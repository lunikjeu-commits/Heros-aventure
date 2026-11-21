// Écran des compagnons : éveiller, améliorer, choisir celui qui combat
import { get } from '../save.js';
import { COMPS } from './data.js';
import { MAXL, lvlCost, dmgOf, passOf, unlock, levelUp, setActive } from './logic.js';
import { drawSpirit } from './art.js';

export function showComps(root, onBack) {
  for (const f of ['gear', 'comp']) if (!document.getElementById(f + '-css')) {
    const l = document.createElement('link'); l.id = f + '-css'; l.rel = 'stylesheet'; l.href = f + '.css'; document.head.appendChild(l);
  }
  const s = get(), el = document.createElement('div'); el.className = 'screen gear'; root.appendChild(el);
  let msg = '', last = 0;

  function render() {
    el.innerHTML = `<div class="gh"><button class="gb" id="back">←</button><div class="gheroes"><h1 style="font-size:18px;font-weight:normal;letter-spacing:.1em">Compagnons</h1></div><span class="gold">${s.gold} or</span></div>
      <div class="clist">${COMPS.map(c => {
        const l = s.comp.owned[c.id], on = s.comp.active === c.id, lv = l || 1;
        return `<div class="cc ${on ? 'act' : ''} ${l ? '' : 'lock'}" style="--c:${c.c}"><canvas data-id="${c.id}"></canvas>
          <h2>${c.nom} <small style="color:${c.c};font-size:13px">${c.elem}</small></h2><p>${c.desc}</p>
          <div class="row"><span>Dégâts</span><b>${dmgOf(c, lv)}</b></div>
          <div class="row"><span>Recharge</span><b>${c.cd} s</b></div>
          <div class="row"><span>Bonus ${c.passif.txt}</span><b>+${passOf(c, lv)}</b></div>
          <div class="row"><span>Niveau</span><b>${l ? l + '/' + MAXL : '—'}</b></div>
          ${l ? `<button class="btn" data-a="up" data-id="${c.id}" style="--c:var(--gold)" ${l >= MAXL ? 'disabled' : ''}>Améliorer · ${lvlCost(c, l)} or</button>
                 <button class="btn" data-a="pick" data-id="${c.id}" style="--c:${c.c}" ${on ? 'disabled' : ''}>${on ? 'Compagnon actif' : 'Choisir'}</button>`
               : `<button class="btn" data-a="buy" data-id="${c.id}" style="--c:${c.c}">Éveiller · ${c.cost} or</button>`}
        </div>`; }).join('')}</div><div class="cmsg" style="padding:0 14px 10px">${msg}</div>`;
    el.querySelector('#back').onclick = () => { el.remove(); onBack(); };
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const c = COMPS.find(x => x.id === b.dataset.id), a = b.dataset.a;
      const r = a === 'buy' ? unlock(s, c) : a === 'up' ? levelUp(s, c) : setActive(s, c);
      msg = r.msg; const sc = el.querySelector('.clist').scrollLeft; render(); el.querySelector('.clist').scrollLeft = sc;
    });
  }
  render();
  (function loop(now = 0) {   // animation des esprits
    if (!el.isConnected) return;
    el.querySelectorAll('canvas').forEach(cv => {
      const d = COMPS.find(x => x.id === cv.dataset.id), r = devicePixelRatio || 1;
      if (cv.width !== cv.clientWidth * r) { cv.width = cv.clientWidth * r; cv.height = cv.clientHeight * r; }
      const c = cv.getContext('2d'); c.setTransform(r, 0, 0, r, 0, 0); c.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
      drawSpirit(c, d, now / 1000, cv.clientWidth / 2, cv.clientHeight / 2, 1.6, 1);
    });
    requestAnimationFrame(loop);
  })();
}
