// Écran d'équipement : emplacements, portrait, stats, inventaire, fiche d'objet
import { HEROES } from '../heroes.js';
import { drawPortrait } from '../portrait.js';
import { COMBAT } from '../combat/skills.js';
import { get } from '../save.js';
import { SLOTS, RAR, STATLAB, itemName, statOf, maxLvl, upCost, recycleGold } from './items.js';
import * as A from './actions.js';

export function showGear(root, onBack) {
  if (!document.getElementById('gear-css')) {
    const l = document.createElement('link'); l.id = 'gear-css'; l.rel = 'stylesheet'; l.href = 'gear.css'; document.head.appendChild(l);
  }
  const s = get(), el = document.createElement('div'); el.className = 'screen gear'; root.appendChild(el);
  const open = h => h.debloque || s.unlocked.includes(h.id);
  let heroId = s.hero, tab = 'all';
  const col = id => HEROES.find(h => h.id === id).couleur;
  const tile = (it, extra = '') => {
    const o = A.owner(s, it.id);
    return `<button class="it" data-id="${it.id}" style="--c:${RAR[it.rar].c}"><b>${itemName(it)}</b><i>Nv.${it.lvl}</i>${o ? `<u style="--h:${col(o)}"></u>` : ''}${extra}</button>`;
  };

  function render() {
    const hero = HEROES.find(h => h.id === heroId), t = A.totals(s, heroId), eq = s.equip[heroId] || {}, c = COMBAT[heroId];
    const list = s.items.filter(i => (tab === 'all' || i.slot === tab) && (i.slot !== 'weapon' || i.hero === heroId))
      .sort((a, b) => b.rar - a.rar || b.lvl - a.lvl);
    el.innerHTML = `<div class="gh"><button class="gb" id="back">←</button>
      <div class="gheroes">${HEROES.filter(open).map(h => `<button class="hb ${h.id === heroId ? 'on' : ''}" data-h="${h.id}" style="--c:${h.couleur}">${h.nom}</button>`).join('')}</div>
      <span class="gold">${s.gold} or</span></div>
      <div class="gbody">
        <div class="gslots">${Object.keys(SLOTS).map(sl => { const it = s.items.find(i => i.id === eq[sl]);
          return it ? tile(it) : `<button class="it empty" data-slot="${sl}"><b>${SLOTS[sl]}</b></button>`; }).join('')}</div>
        <div class="gmid"><canvas></canvas><div class="gstats">
          <span>Attaque</span><span>${c.dmg + t.atk}</span><span>Vie</span><span>${c.hp + t.hp}</span>
          <span>Défense</span><span>${t.def}</span><span>Vitesse</span><span>${Math.round(c.spd * (1 + t.spd / 100))}</span>
          <span>Critique</span><span>${Math.round(Math.min(.75, c.crit + t.crit / 100) * 100)}%</span></div></div>
        <div class="gright"><div class="gtabs">${['all', ...Object.keys(SLOTS)].map(k => `<button class="${k === tab ? 'on' : ''}" data-t="${k}">${k === 'all' ? 'Tout' : SLOTS[k]}</button>`).join('')}</div>
          <div class="ggrid">${list.length ? list.map(i => tile(i)).join('') : '<div class="gempty">Aucun objet. Gagne des combats pour en trouver.</div>'}</div></div>
      </div>`;
    drawPortrait(el.querySelector('canvas'), hero);
    el.querySelector('#back').onclick = () => { el.remove(); onBack(); };
    el.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { heroId = b.dataset.h; s.hero = heroId; render(); });
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
    el.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => { tab = b.dataset.slot; render(); });
    el.querySelectorAll('[data-id]').forEach(b => b.onclick = () => detail(+b.dataset.id));
  }

  function detail(id, msg = '') {
    const it = s.items.find(i => i.id === id); if (!it) return;
    const cur = statOf(it), nxt = statOf({ ...it, lvl: it.lvl + 1 }), mine = A.owner(s, id) === heroId, mx = maxLvl(it);
    const foreign = it.slot === 'weapon' && it.hero !== heroId, d = A.dupes(s, it).length;
    const box = document.createElement('div'); box.className = 'gdet';
    box.innerHTML = `<div class="gcard" style="--c:${RAR[it.rar].c}"><h3>${itemName(it)}</h3>
      <p>${RAR[it.rar].n} · ${SLOTS[it.slot]} · Nv.${it.lvl}/${mx}</p>
      <p class="big">${STATLAB[cur.k]} +${cur.v}${it.lvl < mx ? ` <small>→ +${nxt.v}</small>` : ''}</p>
      <div class="gmsg">${msg}</div><div class="gbtns">
        <button class="btn" data-a="eq" ${foreign ? 'disabled' : ''}>${foreign ? 'Autre héros' : mine ? 'Retirer' : 'Équiper'}</button>
        <button class="btn" data-a="up" ${it.lvl >= mx ? 'disabled' : ''}>Améliorer · ${upCost(it)} or</button>
        <button class="btn" data-a="ev" ${it.rar >= 3 ? 'disabled' : ''}>Évoluer · doublons ${Math.min(d, 2)}/2</button>
        <button class="btn" data-a="rc">Recycler · +${recycleGold(it)} or</button>
        <button class="btn" data-a="x" style="grid-column:1/3">Fermer</button></div></div>`;
    el.appendChild(box);
    box.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a; box.remove();
      if (a === 'x') return;
      const r = a === 'eq' ? (mine ? A.unequip(s, id) : A.equip(s, heroId, id)) : a === 'up' ? A.upgrade(s, id) : a === 'ev' ? A.evolve(s, id) : A.recycle(s, id);
      render();
      if (a === 'rc' && r.ok) return;
      if (a === 'eq' && r.ok) return;
      detail(id, r.msg);
    });
  }
  render();
}
