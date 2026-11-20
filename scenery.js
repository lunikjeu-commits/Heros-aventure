// Décor gothique vectoriel avec parallaxe, bougies, brume et sol
import { H, GROUND } from './config.js';
const mod = (a, n) => ((a % n) + n) % n;

function arches(c, off, vw) {
  const P = 230;
  c.fillStyle = 'rgba(30,42,72,.55)';
  for (let i = Math.floor(off / P) - 1; i < (off + vw) / P + 1; i++) {
    const x = i * P - off;
    c.beginPath(); c.moveTo(x, GROUND); c.lineTo(x, 160); c.quadraticCurveTo(x + 56, 50, x + 112, 160); c.lineTo(x + 112, GROUND); c.closePath(); c.fill();
  }
}
function pillars(c, off, vw, t) {
  const P = 340;
  for (let i = Math.floor(off / P) - 1; i < (off + vw) / P + 1; i++) {
    const x = i * P - off;
    c.fillStyle = '#0f1527'; c.fillRect(x, 0, 46, GROUND);
    c.fillStyle = '#18213a'; c.fillRect(x - 6, 0, 58, 18); c.fillRect(x - 6, GROUND - 14, 58, 14);
    const sw = Math.sin(t * 1.2 + i) * 3;            // bannière
    c.fillStyle = '#5a1422'; c.beginPath(); c.moveTo(x + 62, 22); c.lineTo(x + 112, 22); c.lineTo(x + 112 + sw, 140); c.lineTo(x + 87 + sw, 120); c.lineTo(x + 62 + sw, 140); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(233,196,106,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(x + 87, 66, 14, 0, 6.283); c.stroke();
  }
}
function candles(c, off, vw, t) {
  const P = 420;
  for (let i = Math.floor(off / P) - 1; i < (off + vw) / P + 1; i++) {
    const x = i * P + 210 - off;
    c.fillStyle = '#2a2f45'; c.fillRect(x - 2, GROUND - 60, 4, 60); c.fillRect(x - 14, GROUND - 4, 28, 4);
    for (let k = -1; k <= 1; k++) {
      const fl = .75 + Math.sin(t * 9 + i * 3 + k) * .25, fx = x + k * 9, fy = GROUND - 72 - (k === 0 ? 8 : 0);
      c.fillStyle = '#e9e2cf'; c.fillRect(fx - 2, fy, 4, 12);
      const g = c.createRadialGradient(fx, fy - 4, 1, fx, fy - 4, 46 * fl);
      g.addColorStop(0, 'rgba(255,214,140,.55)'); g.addColorStop(1, 'rgba(255,214,140,0)');
      c.fillStyle = g; c.fillRect(fx - 50, fy - 54, 100, 100);
      c.fillStyle = '#ffd98a'; c.beginPath(); c.ellipse(fx, fy - 4, 2.2, 5 * fl, 0, 0, 6.283); c.fill();
    }
  }
}
export function drawScene(c, cam, vw, t) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#26335a'); g.addColorStop(.6, '#141b30'); g.addColorStop(1, '#090c18');
  c.fillStyle = g; c.fillRect(0, 0, vw, H);
  arches(c, cam * .25, vw);
  pillars(c, cam * .55, vw, t);
  candles(c, cam * .8, vw, t);
  // brume mouvante
  for (let i = 0; i < 3; i++) {
    const x = mod(i * 340 - t * 14 - cam * .35, vw + 400) - 200;
    const f = c.createRadialGradient(x, GROUND - 10, 10, x, GROUND - 10, 200);
    f.addColorStop(0, 'rgba(150,170,210,.13)'); f.addColorStop(1, 'rgba(150,170,210,0)');
    c.fillStyle = f; c.fillRect(x - 200, GROUND - 150, 400, 200);
  }
  const gr = c.createLinearGradient(0, GROUND, 0, H);
  gr.addColorStop(0, '#202840'); gr.addColorStop(1, '#080b15');
  c.fillStyle = gr; c.fillRect(0, GROUND, vw, H - GROUND);
  c.fillStyle = 'rgba(160,180,230,.28)'; c.fillRect(0, GROUND, vw, 1.5);
}
