// Effets spéciaux : particules, chiffres de dégâts, arcs de coups, anneaux, tremblement, flash
import { rand } from './config.js';
export class FX {
  constructor() { this.p = []; this.t = []; this.a = []; this.shake = 0; this.flash = 0; }
  burst(x, y, color, n = 10, sp = 180, size = 3, grav = 320) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, 6.283), v = sp * rand(.3, 1), l = rand(.35, .8);
      this.p.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 50, l, m: l, size: size * rand(.5, 1.2), color, grav });
    }
  }
  text(x, y, txt, color, big) { this.t.push({ x: x + rand(-8, 8), y, txt, color, size: big ? 24 : 16, l: .9, m: .9 }); }
  slash(x, y, face, r, color) { this.a.push({ k: 's', x, y, face, r, color, l: .18, m: .18 }); }
  ring(x, y, r, color) { this.a.push({ k: 'r', x, y, r, color, l: .35, m: .35 }); }
  kick(a) { this.shake = Math.max(this.shake, a); }
  offset() { const s = this.shake; return [rand(-s, s), rand(-s, s)]; }
  update(dt) {
    for (const p of this.p) { p.l -= dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    for (const t of this.t) { t.l -= dt; t.y -= 55 * dt; }
    for (const a of this.a) a.l -= dt;
    this.p = this.p.filter(p => p.l > 0); this.t = this.t.filter(t => t.l > 0); this.a = this.a.filter(a => a.l > 0);
    this.shake *= Math.pow(.002, dt); this.flash = Math.max(0, this.flash - dt * 1.6);
  }
  draw(c) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const p of this.p) { c.globalAlpha = p.l / p.m; c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size, 0, 6.283); c.fill(); }
    c.lineCap = 'round';
    for (const a of this.a) {
      const u = a.l / a.m; c.strokeStyle = a.color;
      if (a.k === 's') {
        const b = a.face > 0 ? 0 : Math.PI, cx = a.x - a.face * a.r * .3;
        c.globalAlpha = u * .55; c.lineWidth = 14 * u + 2; c.beginPath(); c.arc(cx, a.y, a.r, b - 1.1, b + 1.1); c.stroke();
        c.globalAlpha = u; c.lineWidth = 3 * u + 1; c.strokeStyle = '#fff'; c.beginPath(); c.arc(cx, a.y, a.r, b - 1.1, b + 1.1); c.stroke();
      } else {
        c.globalAlpha = u; c.lineWidth = 6 * u + 1; c.beginPath(); c.arc(a.x, a.y, a.r * (1 - u * u), 0, 6.283); c.stroke();
      }
    }
    c.restore();
    c.textAlign = 'center'; c.lineJoin = 'round';
    for (const t of this.t) {
      c.globalAlpha = Math.min(1, t.l / t.m * 1.5); c.font = `bold ${t.size}px Georgia`;
      c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.7)'; c.strokeText(t.txt, t.x, t.y);
      c.fillStyle = t.color; c.fillText(t.txt, t.x, t.y);
    }
    c.globalAlpha = 1;
  }
  vignette(c, w, h) {   // flash rouge quand le joueur est touché
    if (this.flash <= 0) return;
    const g = c.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, h * .9);
    g.addColorStop(0, 'rgba(200,0,20,0)'); g.addColorStop(1, `rgba(200,0,20,${Math.min(.6, this.flash)})`);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
}
