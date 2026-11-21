// Compagnon en combat : suit le joueur, attaque seul, donne un bonus passif
import { COMPS } from '../companions/data.js';
import { dmgOf, passOf } from '../companions/logic.js';
import { drawSpirit } from '../companions/art.js';
import { GROUND, rand } from './config.js';

export class Companion {
  constructor(id, lvl, g) {
    this.d = COMPS.find(c => c.id === id); this.lvl = lvl;
    this.x = g.p.x - 40; this.y = GROUND - 80; this.cd = 1; this.t = 0; this.face = 1; this.bolts = [];
    const v = passOf(this.d, lvl), k = this.d.passif.k;   // bonus passif
    if (k === 'atk') g.p.c.dmg += v; else if (k === 'def') g.gear.def += v; else g.p.c.crit = Math.min(.75, g.p.c.crit + v / 100);
  }
  target(g) {
    let b = null, d = this.d.rng;
    for (const e of g.enemies) { if (e.dead) continue; const k = Math.abs(e.x - this.x); if (k < d) { d = k; b = e; } }
    return b;
  }
  update(dt, g) {
    this.t += dt; const p = g.p, k = Math.min(1, dt * 4);
    this.x += (p.x - p.face * 55 - this.x) * k; this.y += (GROUND - 85 + Math.sin(this.t * 3) * 8 - this.y) * k; this.face = p.face;
    for (const b of this.bolts) b.l -= dt;
    this.bolts = this.bolts.filter(b => b.l > 0);
    this.cd -= dt; if (this.cd > 0 || g.over || p.hp <= 0) return;
    const e = this.target(g); if (!e) return;
    this.cd = this.d.cd; this.face = e.x > this.x ? 1 : -1; this.act(e, g);
  }
  act(e, g) {
    const d = this.d, dmg = dmgOf(d, this.lvl) * rand(.9, 1.1), f = this.face;
    if (d.id === 'braise') {
      const dx = e.x - this.x, dy = e.cy - this.y, L = Math.hypot(dx, dy) || 1;
      g.shots.push({ x: this.x, y: this.y, vx: dx / L * 380, vy: dy / L * 380, dmg, color: d.c, size: 8, life: 1.6, explode: 65, hit: new Set(), face: f });
      g.fx.burst(this.x, this.y, d.c, 6, 100, 3, 0);
    } else if (d.id === 'givre') {
      g.fx.ring(e.x, GROUND - 10, 85, d.c); g.fx.burst(e.x, e.cy, d.c, 18, 200, 3); g.fx.kick(2);
      g.areaHit(e.x, e.cy, 85, dmg, { freeze: 1.6, color: d.c, face: f, kb: 50 });
    } else {
      this.strike(e, dmg, g);
      const o = g.enemies.find(x => !x.dead && x !== e && Math.abs(x.x - e.x) < 170);
      if (o) this.strike(o, dmg * .6, g, e);
    }
  }
  strike(e, dmg, g, from) {
    const sx = from ? from.x : e.x + rand(-30, 30), sy = from ? from.cy : 0, pts = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8, j = i && i < 8 ? rand(-14, 14) : 0; pts.push([sx + (e.x - sx) * u + j, sy + (e.cy - sy) * u]); }
    this.bolts.push({ pts, l: .18 });
    g.areaHit(e.x, e.cy, 45, dmg, { color: this.d.c, face: this.face, kb: 30 });
    g.fx.burst(e.x, e.cy, this.d.c, 14, 240, 3); g.fx.ring(e.x, e.cy, 40, this.d.c); g.fx.kick(3);
  }
  draw(c) {
    drawSpirit(c, this.d, this.t, this.x, this.y, 1, this.face);
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round';
    for (const b of this.bolts) {
      const u = b.l / .18; c.beginPath(); b.pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
      c.globalAlpha = u * .5; c.strokeStyle = this.d.c; c.lineWidth = 7; c.stroke();
      c.globalAlpha = u; c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
    }
    c.restore();
  }
}
