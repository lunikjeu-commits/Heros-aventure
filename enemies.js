// Ennemis : créatures, IA (marche → annonce → frappe → récupération), boss
import { GROUND, WORLD, rand } from './config.js';

export const TYPES = {
  rodeur:  { nom:'Rôdeur',  hp:70,   spd:70,  dmg:9,  range:42,  wind:.45, cd:1.1, s:1,    col:'#241a2e', eye:'#ff4d4d' },
  brute:   { nom:'Brute',   hp:190,  spd:42,  dmg:20, range:58,  wind:.7,  cd:1.6, s:1.35, col:'#2a1f22', eye:'#ff9a3d' },
  spectre: { nom:'Spectre', hp:50,   spd:115, dmg:7,  range:36,  wind:.3,  cd:.9,  s:.9,   col:'#1a2a3a', eye:'#6fe3ff', float:true },
  boss:    { nom:'Thrak – Géant éventreur', hp:1000, spd:48, dmg:32, range:110, wind:.9, cd:2.2, s:2.3, col:'#17131b', eye:'#ff2e2e', boss:true },
};

export class Enemy {
  constructor(type, x, mult) {
    const d = TYPES[type];
    Object.assign(this, { type, d, x, y: GROUND, face: -1, hp: d.hp * mult, max: d.hp * mult, dmg: d.dmg * (1 + (mult - 1) * .6),
      state: 'walk', t: 0, cd: rand(.3, 1.2), flash: 0, vx: 0, freeze: 0, dead: false, deadT: 0, bob: rand(0, 6), w: 30 * d.s, h: 70 * d.s });
  }
  get cy() { return this.y - this.h * .5 + (this.d.float ? -34 : 0); }
  get rage() { return this.d.boss && this.hp < this.max * .4; }
  update(dt, g) {
    if (this.dead) { this.deadT += dt; return; }
    const d = this.d, p = g.p;
    this.flash -= dt; this.freeze -= dt;
    this.x += this.vx * dt; this.vx *= Math.pow(.02, dt);
    this.x = Math.max(10, Math.min(WORLD - 10, this.x));
    if (this.freeze > 0 || g.over || p.hp <= 0) return;
    const dx = p.x - this.x; this.face = dx > 0 ? 1 : -1;
    const k = this.rage ? 1.5 : 1;
    this.cd -= dt;
    if (this.state === 'walk') {
      if (Math.abs(dx) > d.range * .75) { this.x += this.face * d.spd * k * dt; this.bob += dt * 9; }
      else if (this.cd <= 0) { this.state = 'wind'; this.t = d.wind / k; }
    } else if (this.state === 'wind') {
      this.t -= dt;
      if (this.t <= 0) this.strike(g, dx);
    } else if (this.state === 'rec') {
      this.t -= dt; if (this.t <= 0) { this.state = 'walk'; this.cd = d.cd / k; }
    }
  }
  strike(g, dx) {
    const d = this.d, p = g.p;
    if (d.boss) {
      g.fx.ring(this.x, GROUND - 4, d.range + 50, '#ff4a3a'); g.fx.burst(this.x + this.face * 40, GROUND, '#ff6a3a', 26, 260, 4);
      g.fx.kick(9);
      if (Math.abs(dx) < d.range + 40 && p.y > GROUND - 55) g.hurtPlayer(this.dmg, this.x);
    } else if (Math.abs(dx) < d.range + 18 && p.y > GROUND - 60) {
      g.hurtPlayer(this.dmg, this.x);
    }
    this.state = 'rec'; this.t = .35;
  }
  draw(c) {
    const d = this.d, s = d.s;
    c.save(); c.globalAlpha = this.dead ? Math.max(0, 1 - this.deadT / .7) : 1;
    c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(this.x, GROUND + 2, 22 * s, 6 * s, 0, 0, 6.283); c.fill();
    if (this.state === 'wind') {   // zone d'attaque annoncée
      const u = 1 - this.t / (d.wind / (this.rage ? 1.5 : 1));
      c.fillStyle = `rgba(255,40,40,${.1 + .28 * u})`; c.beginPath();
      c.ellipse(this.x + (d.boss ? 0 : this.face * d.range * .5), GROUND + 2, (d.boss ? d.range + 50 : d.range * .6) * (.4 + .6 * u), 9, 0, 0, 6.283); c.fill();
    }
    c.translate(this.x, this.y + (d.float ? -34 + Math.sin(this.bob * .6) * 6 : 0));
    if (this.dead) c.translate(0, this.deadT * 30);
    c.scale(this.face * s, s);
    const base = this.flash > 0 ? '#eef0f8' : this.freeze > 0 ? '#4a6a88' : (this.rage ? '#2a1218' : d.col);
    const sw = Math.sin(this.bob) * 5;
    c.fillStyle = base;
    if (!d.float) { c.fillRect(-9 + sw, -26, 8, 26); c.fillRect(3 - sw, -26, 8, 26); }
    else { c.globalAlpha *= .85; c.beginPath(); c.moveTo(-12, -20); c.quadraticCurveTo(-4, 6, 0, -4); c.quadraticCurveTo(6, 8, 12, -20); c.fill(); }
    c.save(); c.translate(0, -40); c.rotate(.28); c.beginPath(); c.ellipse(0, 0, 15, 22, 0, 0, 6.283); c.fill(); c.restore();
    c.beginPath(); c.arc(10, -62, 10, 0, 6.283); c.fill();
    const u = this.state === 'wind' ? 1 - this.t / (d.wind / (this.rage ? 1.5 : 1)) : 0;
    c.save(); c.translate(8, -48); c.rotate(this.state === 'wind' ? 1 - 3.2 * u : this.state === 'rec' ? 1.5 : .9);
    c.fillRect(0, -3.5, 30, 7);
    if (d.boss) { c.fillStyle = '#7a1620'; c.beginPath(); c.moveTo(24, -6); c.lineTo(58, -14); c.lineTo(62, 12); c.lineTo(24, 8); c.fill(); }
    else { c.beginPath(); c.moveTo(30, -4); c.lineTo(40, 0); c.lineTo(30, 4); c.fill(); }
    c.restore();
    if (d.boss) { c.fillStyle = '#30303c'; c.beginPath(); c.arc(10, -64, 12, Math.PI, 0); c.fill(); c.fillRect(-2, -66, 24, 5); }
    c.fillStyle = d.eye; c.beginPath(); c.arc(15, -64, 2.6, 0, 6.283); c.fill();
    c.globalAlpha *= .25; c.beginPath(); c.arc(15, -64, 8, 0, 6.283); c.fill();
    if (this.freeze > 0) { c.globalAlpha = .7; c.strokeStyle = '#a8e6ff'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -36, 22, 40, 0, 0, 6.283); c.stroke(); }
    c.restore();
    if (!this.dead && !d.boss && this.hp < this.max) {
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(this.x - 18, this.cy - this.h * .5 - 10, 36, 4);
      c.fillStyle = '#e0455a'; c.fillRect(this.x - 18, this.cy - this.h * .5 - 10, 36 * Math.max(0, this.hp / this.max), 4);
    }
  }
}

export function makeWave(stage, stages, level, mult, px) {
  const out = [], last = stage === stages;
  const place = i => Math.min(WORLD - 40 - i * 30, px + 380 + i * 130);
  if (last && level % 5 === 0) {
    out.push(new Enemy('boss', Math.min(WORLD - 60, px + 520), mult));
    out.push(new Enemy('spectre', place(1), mult), new Enemy('spectre', place(2), mult));
  } else {
    const n = 3 + Math.floor(level / 3) + stage + (last ? 2 : 0);
    for (let i = 0; i < n; i++) out.push(new Enemy(i % 4 === 3 ? 'brute' : i % 3 === 2 ? 'spectre' : 'rodeur', place(i), mult));
  }
  return out;
}
