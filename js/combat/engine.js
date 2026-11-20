// Moteur de combat : boucle, caméra, dégâts, étapes, HUD, écrans de fin
import { H, GROUND, WORLD, rand } from './config.js';
import { COMBAT } from './skills.js';
import { Input } from './input.js';
import { FX } from './fx.js';
import { Player } from './player.js';
import { makeWave } from './enemies.js';
import { drawScene } from './scenery.js';
import { HEROES } from '../heroes.js';
import { get, commit } from '../save.js';
import { applyGear } from '../gear/actions.js';
import { rollLoot } from '../gear/loot.js';
import { Companion } from './companion.js';
import { RAR, itemName } from '../gear/items.js';
import { addItem } from '../gear/actions.js';

// o = { heroId, world, level, onExit }
export function startCombat(root, o) {
  if (!document.getElementById('combat-css')) {
    const l = document.createElement('link'); l.id = 'combat-css'; l.rel = 'stylesheet'; l.href = 'combat.css'; document.head.appendChild(l);
  }
  const hero = HEROES.find(h => h.id === o.heroId) || HEROES[0];
  const world = o.world || 1, level = o.level || 1, mult = 1 + (world - 1) * .8 + (level - 1) * .12;
  const screen = document.createElement('div'); screen.className = 'screen combat';
  screen.innerHTML = '<canvas></canvas><div class="rotate-hint">Tourne ton téléphone en mode paysage</div>';
  root.appendChild(screen);
  const cv = screen.firstChild, c = cv.getContext('2d');
  const input = new Input(screen, COMBAT[hero.id]);
  const g = { p: new Player(hero), enemies: [], shots: [], fx: new FX(), stage: 0, stages: 2, time: 0, taken: 0, kills: 0,
    freeze: 0, paused: false, over: false, banner: 0, bannerTxt: '', clearT: 0, hpShow: 1 };
  g.gear = applyGear(g.p, hero.id, get());   // équipement du héros
  const cs = get().comp;                      // compagnon actif
  g.comp = cs.active && cs.owned[cs.active] ? new Companion(cs.active, cs.owned[cs.active], g) : null;
  let s = 1, vw = 640, cam = 0, raf = 0, ovl = null;

  const resize = () => { const r = devicePixelRatio || 1; cv.width = cv.clientWidth * r; cv.height = cv.clientHeight * r; s = cv.height / H; vw = cv.width / s; };
  addEventListener('resize', resize); resize();

  g.areaHit = (cx, cy, r, dmg, opt) => {
    for (const e of g.enemies) {
      if (e.dead) continue;
      const dx = e.x - cx, dy = e.cy - cy;
      if (dx * dx + dy * dy < (r + e.w * .5) ** 2) g.hurtEnemy(e, dmg, opt);
    }
  };
  g.hurtEnemy = (e, base, o2 = {}) => {
    if (e.dead) return;
    const crit = Math.random() < g.p.c.crit, dmg = Math.round(base * (crit ? 1.8 : 1)), col = o2.color || '#fff';
    e.hp -= dmg; e.flash = .12; e.vx += (o2.face || (e.x > g.p.x ? 1 : -1)) * (o2.kb || 60) * (e.d.boss ? .15 : 1);
    if (o2.freeze) e.freeze = Math.max(e.freeze, o2.freeze * (e.d.boss ? .4 : 1));
    g.fx.burst(e.x, e.cy, '#ffffff', crit ? 8 : 4, 220, 2); g.fx.burst(e.x, e.cy, col, crit ? 14 : 8, 200, 3);
    g.fx.text(e.x, e.cy - e.h * .5, crit ? dmg + '!' : '' + dmg, crit ? '#ffb347' : '#ffffff', crit);
    g.freeze = Math.max(g.freeze, crit ? .06 : .025); g.fx.kick(crit ? 4 : 1.5);
    if (e.hp <= 0) {
      e.dead = true; e.deadT = 0; g.kills++;
      g.fx.burst(e.x, e.cy, e.d.eye, 24, 260, 4); g.fx.ring(e.x, e.cy, 55, e.d.eye); g.fx.kick(e.d.boss ? 10 : 3);
      if (e.d.boss) g.freeze = .25;
    }
  };
  g.hurtPlayer = (dmg, fromX) => {
    const p = g.p; if (p.inv > 0 || p.hp <= 0 || g.over) return;
    dmg = Math.round(dmg * (1 - g.gear.def / (g.gear.def + 100))); p.hp -= dmg; p.inv = .7; p.vx = (p.x > fromX ? 1 : -1) * 230; g.taken += dmg;
    g.fx.flash = .65; g.fx.kick(6); g.freeze = .05;
    g.fx.burst(p.x, p.y - 40, '#ff3b4e', 14, 220, 3); g.fx.text(p.x, p.y - 90, '-' + dmg, '#ff5d6e', true);
    if (p.hp <= 0) { p.hp = 0; end(false); }
  };

  function nextStage() {
    g.stage++;
    if (g.stage > g.stages) return end(true);
    g.enemies.push(...makeWave(g.stage, g.stages, level, mult, g.p.x));
    g.banner = 1.8; g.bannerTxt = `STAGE ${g.stage}/${g.stages}`;
  }
  function update(dt) {
    g.time += dt; g.p.update(dt, input, g); g.comp?.update(dt, g);
    if (input.consume('pause') && !g.over) pause();
    for (const e of g.enemies) e.update(dt, g);
    g.enemies = g.enemies.filter(e => !(e.dead && e.deadT > .8));
    for (const sh of g.shots) {
      sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.life -= dt;
      g.fx.burst(sh.x, sh.y, sh.color, 1, 20, sh.size * .6, 0);
      for (const e of g.enemies) {
        if (e.dead || sh.hit.has(e) || sh.life <= 0) continue;
        if (Math.abs(sh.x - e.x) < e.w * .5 + sh.size && Math.abs(sh.y - e.cy) < e.h * .5) {
          g.hurtEnemy(e, sh.dmg, { kb: 80, color: sh.color, face: sh.face, freeze: sh.freeze });
          if (sh.explode) { g.fx.ring(sh.x, sh.y, sh.explode, sh.color); g.fx.burst(sh.x, sh.y, sh.color, 24, 280, 4); g.fx.kick(4); g.areaHit(sh.x, sh.y, sh.explode, sh.dmg * .6, { kb: 120, color: sh.color, face: sh.face }); }
          if (sh.pierce) sh.hit.add(e); else sh.life = 0;
        }
      }
    }
    g.shots = g.shots.filter(sh => sh.life > 0 && sh.x > 0 && sh.x < WORLD);
    if (g.banner > 0) g.banner -= dt;
    if (!g.over && g.stage > 0 && g.enemies.every(e => e.dead)) { g.clearT += dt; if (g.clearT > 1) { g.clearT = 0; nextStage(); } } else g.clearT = 0;
    const target = Math.max(0, Math.min(WORLD - vw, g.p.x - vw * .4));
    cam += (target - cam) * Math.min(1, dt * 6);
  }

  function hud() {
    c.setTransform(s, 0, 0, s, 0, 0); const p = g.p;
    g.hpShow += (p.hp / p.max - g.hpShow) * .15;
    c.fillStyle = 'rgba(8,11,22,.6)'; c.beginPath(); c.roundRect(10, 8, 210, 40, 10); c.fill();
    c.fillStyle = hero.couleur; c.beginPath(); c.arc(30, 28, 10, 0, 6.283); c.fill();
    c.font = '13px Georgia'; c.textAlign = 'left'; c.fillStyle = '#e8ebf5'; c.fillText(`${hero.nom}   ${p.hp}/${p.max}`, 48, 24);
    c.fillStyle = '#2a1018'; c.fillRect(48, 30, 160, 8);
    c.fillStyle = '#d63a4f'; c.fillRect(48, 30, 160 * Math.max(0, g.hpShow), 8);
    c.textAlign = 'right'; c.font = '13px Georgia'; c.fillStyle = '#c9cfe6';
    const t = Math.floor(g.time); c.fillText(`Monde ${world} · Niveau ${level} · STAGE ${Math.min(g.stage, g.stages)}/${g.stages}   ${String((t / 60) | 0).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`, vw - 62, 24);
    const b = g.enemies.find(e => e.d.boss && !e.dead);
    if (b) {
      c.textAlign = 'center'; c.font = '16px Georgia'; c.fillStyle = '#f1d9d9'; c.fillText(b.d.nom, vw / 2, 22);
      c.fillStyle = '#2a1018'; c.fillRect(vw * .25, 28, vw * .5, 9); c.fillStyle = b.rage ? '#ff3b3b' : '#b8452f'; c.fillRect(vw * .25, 28, vw * .5 * Math.max(0, b.hp / b.max), 9);
    }
    if (g.banner > 0) {
      c.globalAlpha = Math.min(1, g.banner); c.textAlign = 'center'; c.font = '34px Georgia'; c.fillStyle = '#e9c46a'; c.fillText(g.bannerTxt, vw / 2, 120); c.globalAlpha = 1;
    }
  }
  function render() {
    const [sx, sy] = g.fx.offset();
    c.setTransform(s, 0, 0, s, sx * s, sy * s); drawScene(c, cam, vw, g.time);
    c.save(); c.translate(-cam, 0);
    const list = [...g.enemies, g.p].sort((a, b) => a.y - b.y);
    for (const e of list) e.draw(c);
    g.comp?.draw(c);
    for (const sh of g.shots) { c.fillStyle = sh.color; c.shadowColor = sh.color; c.shadowBlur = 10; c.beginPath(); c.ellipse(sh.x, sh.y, sh.size * 2, sh.size, 0, 0, 6.283); c.fill(); c.shadowBlur = 0; }
    g.fx.draw(c); c.restore();
    c.setTransform(s, 0, 0, s, 0, 0); g.fx.vignette(c, vw, H); hud();
  }

  function overlay(title, sub, btns) {
    ovl?.remove(); ovl = document.createElement('div'); ovl.className = 'ovl';
    ovl.innerHTML = `<h2>${title}</h2><p>${sub}</p><div></div>`;
    btns.forEach(([label, fn]) => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = label; b.onclick = fn; ovl.lastChild.appendChild(b); });
    screen.appendChild(ovl);
  }
  function pause() {
    g.paused = true;
    overlay('Pause', '', [['Reprendre', () => { g.paused = false; ovl.remove(); ovl = null; }], ['Quitter', exit]]);
  }
  function end(win) {
    if (g.over) return; g.over = true;
    const s = get(), loot = win ? rollLoot(hero.id, level, world, level % 5 === 0) : { gold: g.kills * 4, items: [] };
    s.gold += loot.gold; loot.items.forEach(i => addItem(s, i)); commit();
    const drops = loot.items.map(i => `<span style="color:${RAR[i.rar].c}">${itemName(i)}</span>`).join(' · ');
    setTimeout(() => {
      const st = win ? 1 + (g.time < 120) + (g.taken < g.p.max * .3) : 0;
      const stars = win ? '★'.repeat(st) + '☆'.repeat(3 - st) + '<br>' : '';
      overlay(win ? 'Victoire' : 'Défaite', `${stars}${Math.floor(g.time)} s · ${g.kills} ennemis vaincus<br>+${loot.gold} or${drops ? '<br>' + drops : ''}`,
        [['Rejouer', () => { exit(true); startCombat(root, o); }], ['Menu', exit]]);
    }, win ? 700 : 1000);
  }
  function exit(silent) {
    cancelAnimationFrame(raf); removeEventListener('resize', resize); input.destroy(); screen.remove();
    if (silent !== true) o.onExit?.();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.033, (now - last) / 1000); last = now;
    if (!g.paused) { g.fx.update(dt); if (g.freeze > 0) g.freeze -= dt; else update(dt); }
    render(); raf = requestAnimationFrame(frame);
  }
  nextStage(); raf = requestAnimationFrame(frame);
}
