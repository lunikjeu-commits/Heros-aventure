// Sélection du héros (carrousel tactile) + accès équipement et combat
import { HEROES } from './heroes.js';
import { drawPortrait } from './portrait.js';
import { startCombat } from './combat/engine.js';
import { showGear } from './gear/screen.js';
import { showComps } from './companions/screen.js';
import { get, commit } from './save.js';

async function goLandscape() {   // plein écran + paysage si le navigateur l'autorise
  try { await document.documentElement.requestFullscreen(); await screen.orientation.lock('landscape'); } catch {}
}

export function showMenu(root) {
  const data = get();
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = `<div class="top"><h1>Choisis ton héros</h1><span id="sub"></span></div><div class="rail"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 20px 14px">
      <button class="btn" id="gear" style="--c:#8fa3d8;margin:0">Équipement</button>
      <button class="btn" id="comp" style="--c:#7fd6ff;margin:0">Compagnons</button>
      <button class="btn" data-l="1" style="--c:#e9c46a;margin:0">Combat</button>
      <button class="btn" data-l="5" style="--c:#e0455a;margin:0">Boss</button></div>`;
  root.appendChild(el);
  const rail = el.querySelector('.rail');
  const sub = el.querySelector('#sub');

  el.querySelector('#gear').onclick = () => { el.remove(); showGear(root, () => showMenu(root)); };
  el.querySelector('#comp').onclick = () => { el.remove(); showComps(root, () => showMenu(root)); };
  el.querySelectorAll('[data-l]').forEach(b => b.onclick = async () => {
    await goLandscape();
    el.remove();
    startCombat(root, { heroId: data.hero, world: 1, level: +b.dataset.l, onExit: () => showMenu(root) });
  });

  const bar = (n, v) => `<div class="stat">${n}<div class="bar"><i style="width:${v}%"></i></div></div>`;
  const render = () => {
    rail.innerHTML = '';
    HEROES.forEach(h => {
      const open = h.debloque || data.unlocked.includes(h.id);
      const card = document.createElement('div');
      card.className = 'card' + (data.hero === h.id ? ' sel' : '');
      card.style.setProperty('--c', h.couleur);
      card.innerHTML = `<canvas></canvas><h2>${h.nom}</h2><p>${h.desc}</p>
        ${bar('Vie', h.pv)}${bar('Attaque', h.atk)}${bar('Vitesse', h.vit)}
        <button class="btn" ${open ? '' : 'disabled'}>${open ? (data.hero === h.id ? 'Sélectionné' : 'Choisir') : 'Verrouillé'}</button>
        ${open ? '' : `<div class="lock"><b>🔒 ${h.cond}</b></div>`}`;
      rail.appendChild(card);
      drawPortrait(card.querySelector('canvas'), h);
      card.querySelector('.btn').onclick = () => { if (!open) return; data.hero = h.id; commit(); render(); };
    });
    const cur = HEROES.find(h => h.id === data.hero);
    sub.textContent = (cur ? cur.nom + ' · ' : '') + data.gold + ' or';
  };
  render();
}
