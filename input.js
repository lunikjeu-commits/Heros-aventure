// Contrôles tactiles (joystick + boutons) et clavier de secours
export class Input {
  constructor(parent, cfg) {
    this.joyx = 0; this.kx = 0; this.held = {}; this.pressed = {};
    const w = this.el = document.createElement('div'); w.className = 'ctl';
    w.innerHTML = `<div class="joy"><i></i></div>
      <button class="b pause" data-k="pause">❚❚</button>
      <button class="b atk" data-k="atk">⚔</button>
      <button class="b jmp" data-k="jump">↑</button>
      <button class="b sk s1" data-k="s1"><span>${cfg.s1.name}</span></button>
      <button class="b sk s2" data-k="s2"><span>${cfg.s2.name}</span></button>
      <button class="b pot" data-k="potion">⚗<em>3</em></button>`;
    parent.appendChild(w);
    w.querySelectorAll('.b').forEach(b => {
      const k = b.dataset.k, up = () => { this.held[k] = false; };
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); this.held[k] = true; this.pressed[k] = true; });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, up));
    });
    const joy = w.querySelector('.joy'), knob = joy.firstElementChild; let id = null;
    const move = e => {
      const r = joy.getBoundingClientRect(), R = r.width / 2;
      const x = Math.max(-R, Math.min(R, e.clientX - r.left - R)), y = Math.max(-R, Math.min(R, e.clientY - r.top - R));
      knob.style.transform = `translate(${x * .6}px,${y * .6}px)`;
      this.joyx = Math.abs(x) > R * .2 ? x / R : 0;
      if (y < -R * .75 && !this._up) { this.pressed.jump = true; this._up = true; } else if (y > -R * .5) this._up = false;
    };
    joy.addEventListener('pointerdown', e => { id = e.pointerId; joy.setPointerCapture(id); move(e); });
    joy.addEventListener('pointermove', e => { if (e.pointerId === id) move(e); });
    const end = () => { id = null; this.joyx = 0; this._up = false; knob.style.transform = ''; };
    ['pointerup', 'pointercancel'].forEach(ev => joy.addEventListener(ev, end));
    // clavier (tests sur ordinateur)
    const map = { j: 'atk', k: 's1', l: 's2', ' ': 'jump', w: 'jump', ArrowUp: 'jump', h: 'potion', p: 'pause' };
    this._kd = e => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.kx = -1; else if (e.key === 'ArrowRight' || e.key === 'd') this.kx = 1;
      const k = map[e.key]; if (k) { if (!this.held[k]) this.pressed[k] = true; this.held[k] = true; }
    };
    this._ku = e => {
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) this.kx = 0;
      const k = map[e.key]; if (k) this.held[k] = false;
    };
    addEventListener('keydown', this._kd); addEventListener('keyup', this._ku);
  }
  axis() { return this.joyx || this.kx; }
  consume(k) { const v = this.pressed[k]; this.pressed[k] = false; return v; }
  setCd(k, r) { const b = this.el.querySelector(`[data-k="${k}"]`); if (b) b.style.setProperty('--cd', r); }
  setPotions(n) { this.el.querySelector('.pot em').textContent = n; }
  destroy() { removeEventListener('keydown', this._kd); removeEventListener('keyup', this._ku); this.el.remove(); }
}
