// Actions sur l'équipement : équiper, améliorer, évoluer, recycler, totaux de stats
import { commit } from '../save.js';
import { statOf, maxLvl, upCost, recycleGold } from './items.js';
import { tierBasic } from './tiers.js';

const find = (s, id) => s.items.find(i => i.id === id);
export const owner = (s, id) => Object.keys(s.equip).find(h => Object.values(s.equip[h]).includes(id));
const ok = (msg = '') => ({ ok: true, msg }), no = msg => ({ ok: false, msg });

export function addItem(s, it) { it.id = ++s.nid; s.items.push(it); }
export function equip(s, heroId, id) {
  const it = find(s, id);
  if (it.slot === 'weapon' && it.hero !== heroId) return no('Arme d\u2019un autre héros');
  unequip(s, id);
  (s.equip[heroId] = s.equip[heroId] || {})[it.slot] = id; commit(); return ok();
}
export function unequip(s, id) {
  for (const h in s.equip) for (const sl in s.equip[h]) if (s.equip[h][sl] === id) delete s.equip[h][sl];
  commit(); return ok();
}
export function upgrade(s, id) {
  const it = find(s, id), c = upCost(it);
  if (it.lvl >= maxLvl(it)) return no('Niveau maximum (évolue l\u2019objet)');
  if (s.gold < c) return no('Pas assez d\u2019or');
  s.gold -= c; it.lvl++; commit(); return ok('Amélioré !');
}
export function dupes(s, it) {
  return s.items.filter(o => o.id !== it.id && o.slot === it.slot && o.rar === it.rar && (it.slot !== 'weapon' || o.hero === it.hero) && !owner(s, o.id));
}
export function evolve(s, id) {
  const it = find(s, id), d = dupes(s, it);
  if (it.rar >= 3) return no('Rareté maximum');
  if (d.length < 2) return no('Il faut 2 doublons libres');
  s.items = s.items.filter(o => o.id !== d[0].id && o.id !== d[1].id);
  it.rar++; commit(); return ok('Évolué !');
}
export function recycle(s, id) {
  const it = find(s, id);
  if (owner(s, id)) return no('Retire-le d\u2019abord');
  s.gold += recycleGold(it); s.items = s.items.filter(o => o.id !== id); commit(); return ok();
}
export function totals(s, heroId) {
  const t = { atk: 0, hp: 0, def: 0, spd: 0, crit: 0, rar: 0 };
  for (const sl in (s.equip[heroId] || {})) {
    const it = find(s, s.equip[heroId][sl]); if (!it) continue;
    const { k, v } = statOf(it); t[k] += v; if (sl === 'weapon') t.rar = it.rar;
  }
  return t;
}
// Applique l'équipement au joueur de combat (copie, sans modifier les stats de base)
export function applyGear(p, heroId, s) {
  const t = totals(s, heroId), c = { ...p.c };
  c.hp += t.hp; c.dmg += t.atk; c.spd *= 1 + t.spd / 100; c.crit = Math.min(.75, c.crit + t.crit / 100);
  c.basic = tierBasic(heroId, c.basic, t.rar);
  p.c = c; p.hp = p.max = c.hp; return t;
}
