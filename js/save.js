// Sauvegarde unique du jeu (localStorage) : héros, or, objets, équipement
const KEY = 'lc_game_save';
let S = null;

function starter(d) {
  d.gold = d.gold ?? 300; d.nid = 0; d.items = []; d.equip = {};
  const add = (slot, hero) => { const it = { id: ++d.nid, slot, rar: 0, lvl: 1 }; if (hero) it.hero = hero; d.items.push(it); return it; };
  for (const h of ['assassin', 'mage', 'soldat']) (d.equip[h] = {}).weapon = add('weapon', h).id;
  for (const sl of ['helmet', 'chest', 'boots', 'amulet', 'ring']) add(sl);
}
export function get() {
  if (!S) {
    try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { S = {}; }
    if (!S.items) starter(S);
    S.hero = S.hero || 'assassin'; S.unlocked = S.unlocked || []; S.comp = S.comp || { owned: {}, active: null };
    commit();
  }
  return S;
}
export function commit() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
