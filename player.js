// Joueur : déplacement, attaques, compétences, dessin vectoriel
import { COMBAT } from './skills.js';
import { GROUND, WORLD, rand } from './config.js';

const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };

export class Player {
  constructor(hero) {
    this.hero = hero; this.c = COMBAT[hero.id];
    this.x = 140; this.y = GROUND; this.vx = 0; this.vy = 0; this.face = 1;
    this.hp = this.max = this.c.hp; this.cd = { basic: 0, s1: 0, s2: 0 };
    this.inv = 0; this.atkT = 0; this.potions = 3; this.dashT = 0; this.dashV = 0; this.anim = 0;
  }
  nearest(g) {
    let b = null, d = 420;
    for (const e of g.enemies) if (!e.dead && Math.abs(e.x - this.x) < d) { d = Math.abs(e.x - this.x); b = e; }
    return b;
  }
  aim(g) { const n = this.nearest(g); if (n) this.face = n.x > this.x ? 1 : -1; }
  dmg(def) { return this.c.dmg * def.mult * rand(.9, 1.1); }
  update(dt, inp, g) {
    const c = this.c;
    this.inv -= dt; this.atkT -= dt;
    for (const k in this.cd) this.cd[k] -= dt;
    if (this.hp <= 0) { this.vx *= .92; this.x += this.vx * dt; return; }
    if (this.dashT > 0) {
      this.dashT -= dt; this.x += this.dashV * dt;
      g.fx.burst(this.x, this.y - 30, c.s1.color || '#fff', 2, 40, 3, 0);
    } else {
      const ax = inp.axis();
      this.vx += (ax * c.spd - this.vx) * Math.min(1, dt * 12);
      this.x += this.vx * dt;
      if (Math.abs(ax) > .1) this.face = ax > 0 ? 1 : -1;
    }
    this.x = Math.max(20, Math.min(WORLD - 20, this.x));
    if (inp.consume('jump') && this.y >= GROUND) this.vy = -c.jump;
    this.vy += 1200 * dt; this.y += this.vy * dt;
    if (this.y >= GROUND) { this.y = GROUND; this.vy = 0; }
    this.anim += dt * (8 + Math.abs(this.vx) * .04);
    if (this.dashT <= 0) {
      if (inp.held.atk && this.cd.basic <= 0) { if (Math.abs(inp.axis()) < .3) this.aim(g); this.fire(c.basic, 'basic', g); }
      for (const k of ['s1', 's2']) if (inp.consume(k) && this.cd[k] <= 0) { this.aim(g); this.fire(c[k], k, g); }
    }
    if (inp.consume('potion') && this.potions > 0 && this.hp < this.max) {
      this.potions--; this.heal(.35, g, '#7dff8a'); inp.setPotions(this.potions);
    }
    inp.setCd('s1', Math.max(0, this.cd.s1 / c.s1.cd)); inp.setCd('s2', Math.max(0, this.cd.s2 / c.s2.cd));
  }
  heal(pct, g, color) {
    const v = Math.min(this.max - this.hp, Math.round(this.max * pct));
    this.hp += v; g.fx.text(this.x, this.y - 90, '+' + v, color, true);
    g.fx.burst(this.x, this.y - 40, color, 18, 120, 3, -60); g.fx.ring(this.x, this.y - 30, 60, color);
  }
  fire(d, key, g) {
    const f = this.face, x = this.x, y = this.y;
    this.cd[key] = d.cd; this.atkT = .18;
    if (d.type === 'melee') {
      g.fx.slash(x + f * d.range * .5, y - 36, f, d.range * .8, d.color);
      g.areaHit(x + f * d.range * .55, y - 34, d.range, this.dmg(d), { kb: d.kb, color: d.color, face: f });
    } else if (d.type === 'shot') {
      for (let i = 0; i < d.n; i++) {
        const a = (i - (d.n - 1) / 2) * (d.spread || 0) * (d.n > 2 ? 1 : 2) + rand(-.01, .01);
        g.shots.push({ x: x + f * 26, y: y - 40 + (d.n === 2 ? (i ? 5 : -5) : 0), vx: Math.cos(a) * d.speed * f, vy: Math.sin(a) * d.speed,
          dmg: this.dmg(d), color: d.color, size: d.size, life: 1.2, pierce: d.pierce, explode: d.explode, freeze: d.freeze, hit: new Set(), face: f });
      }
      g.fx.burst(x + f * 28, y - 40, d.color, 4, 90, 2, 0);
    } else if (d.type === 'dash') {
      const end = Math.max(20, Math.min(WORLD - 20, x + f * d.dist));
      for (const e of g.enemies) if (!e.dead && e.x > Math.min(x, end) - d.range * .5 && e.x < Math.max(x, end) + d.range * .5)
        g.hurtEnemy(e, this.dmg(d), { kb: 160, color: d.color, face: f });
      g.fx.slash((x + end) / 2, y - 36, f, 90, d.color); g.fx.slash(end, y - 36, f, 60, '#fff');
      this.dashV = (end - x) / .15; this.dashT = .15; this.inv = Math.max(this.inv, .3);
    } else if (d.type === 'nova') {
      g.fx.ring(x, y - 30, d.radius, d.color); g.fx.ring(x, y - 30, d.radius * .6, '#fff');
      g.fx.burst(x, y - 30, d.color, 30, 260, 3.5); g.fx.kick(5);
      g.areaHit(x, y - 30, d.radius, this.dmg(d), { kb: 220, color: d.color, face: f, freeze: d.freeze, any: true });
    } else if (d.type === 'heal') {
      this.heal(d.amount, g, d.color); g.fx.ring(x, y - 30, 120, d.color);
    }
  }
  draw(c) {
    const id = this.hero.id, col = this.hero.couleur, f = this.face, dead = this.hp <= 0;
    const mv = Math.min(1, Math.abs(this.vx) / 60), sw = Math.sin(this.anim) * 7 * mv, bob = -Math.abs(Math.sin(this.anim)) * 2 * mv;
    c.save();
    c.fillStyle = 'rgba(0,0,0,.38)'; c.beginPath(); c.ellipse(this.x, GROUND + 3, 20, 5, 0, 0, 6.283); c.fill();
    c.translate(this.x, this.y); if (dead) { c.rotate(f * 1.4); c.translate(0, -4); } c.scale(f, 1);
    if (this.inv > 0 && ((this.inv * 24) | 0) % 2) c.globalAlpha = .45;
    if (id === 'ange') {
      c.fillStyle = 'rgba(255,243,176,.5)'; c.beginPath(); c.ellipse(-16, -62 + bob, 12, 34, -.5, 0, 6.283); c.ellipse(-4, -66 + bob, 10, 30, -.1, 0, 6.283); c.fill();
    }
    c.fillStyle = '#10131d'; c.fillRect(-9 + sw, -26, 8, 26); c.fillRect(2 - sw, -26, 8, 26);          // jambes
    if (id !== 'soldat' && id !== 'ange') {                                                              // cape
      c.fillStyle = id === 'mage' ? '#1d2a52' : '#1c1018';
      c.beginPath(); c.moveTo(-8, -60 + bob); c.quadraticCurveTo(-36 - sw * .6, -36, -26 - sw, -4); c.lineTo(-4, -28); c.fill();
    }
    c.fillStyle = id === 'ange' ? '#d9dcec' : '#161a28'; rr(c, -13, -62 + bob, 26, 38, 9);             // torse
    c.fillStyle = col; c.fillRect(-13, -40 + bob, 26, 3);
    c.fillStyle = id === 'ange' ? '#e8d7c0' : '#10131d'; c.beginPath(); c.arc(0, -72 + bob, 10, 0, 6.283); c.fill(); // tête
    if (id === 'assassin') { c.fillStyle = '#10131d'; c.beginPath(); c.moveTo(-12, -70 + bob); c.lineTo(-4, -92 + bob); c.lineTo(12, -70 + bob); c.fill(); }
    if (id === 'mage') { c.fillStyle = '#1d2a52'; c.beginPath(); c.moveTo(-15, -76 + bob); c.lineTo(2, -106 + bob); c.lineTo(15, -76 + bob); c.fill(); }
    if (id === 'soldat') { c.fillStyle = '#2b3140'; c.beginPath(); c.arc(0, -74 + bob, 11, Math.PI, 0); c.fill(); }
    if (id === 'ange') { c.strokeStyle = '#fff3b0'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, -90 + bob, 10, 3, 0, 0, 6.283); c.stroke(); }
    if (id === 'barbare') { c.fillStyle = '#9aa0b5'; c.beginPath(); c.moveTo(-9, -78 + bob); c.lineTo(-16, -92 + bob); c.lineTo(-4, -80 + bob); c.moveTo(9, -78 + bob); c.lineTo(16, -92 + bob); c.lineTo(4, -80 + bob); c.fill(); }
    c.fillStyle = col; c.beginPath(); c.arc(5, -73 + bob, 2, 0, 6.283); c.fill();                          // œil
    if (!dead) this.weapon(c, id, col, this.atkT > 0 ? 1 - this.atkT / .18 : -1, bob);
    c.restore();
  }
  weapon(c, id, col, u, bob) {
    const a = u >= 0 ? -1.4 + u * 2.2 : -.35;
    c.save(); c.translate(10, -46 + bob); c.shadowColor = col; c.shadowBlur = 8;
    if (id === 'assassin') {
      for (const k of [0, 1]) {
        c.save(); c.translate(k ? -5 : 0, k ? 5 : 0); c.rotate(k ? a * .8 + .3 : a);
        c.fillStyle = '#e4eaf8'; c.beginPath(); c.moveTo(0, -2.5); c.lineTo(26, -1.5); c.lineTo(33, 0); c.lineTo(0, 2.5); c.fill(); c.restore();
      }
    } else if (id === 'mage') {
      c.rotate(-.1); c.strokeStyle = '#6b4f3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 26); c.lineTo(0, -44); c.stroke();
      c.fillStyle = col; c.beginPath(); c.arc(0, -50, 6 + (u >= 0 ? 4 * (1 - u) : 0), 0, 6.283); c.fill();
    } else if (id === 'soldat') {
      for (const k of [0, 1]) {
        c.save(); c.translate(k ? -6 : 0, k ? 7 : 0); c.rotate(u >= 0 ? -.1 : 0.05);
        c.fillStyle = '#2f3545'; c.fillRect(0, -3, 16, 6);
        if (u >= 0 && u < .5) { c.fillStyle = '#ffd27a'; c.beginPath(); c.moveTo(16, 0); c.lineTo(28, -5); c.lineTo(25, 0); c.lineTo(28, 5); c.fill(); }
        c.restore();
      }
    } else if (id === 'ange') {
      c.rotate(u >= 0 ? -.5 + u * .6 : -.6); c.strokeStyle = '#fff6c8'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-8, 4); c.lineTo(46, 0); c.stroke();
    } else if (id === 'barbare') {
      c.rotate(a); c.strokeStyle = '#6b4f3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-4, 0); c.lineTo(34, 0); c.stroke();
      c.fillStyle = '#b9bfd0'; c.beginPath(); c.moveTo(24, -15); c.quadraticCurveTo(48, 0, 24, 15); c.lineTo(30, 0); c.fill();
    }
    c.restore();
  }
}
