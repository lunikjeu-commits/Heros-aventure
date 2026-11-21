// Règles des compagnons : stats par niveau, déblocage, amélioration, choix
import { commit } from '../save.js';
import { COMPS } from './data.js';

export const MAXL = 15;
export const lvlCost = (c, l) => Math.round(60 * l * (1 + COMPS.indexOf(c) * .5));
export const dmgOf = (c, l) => Math.round(c.dmg * (1 + .25 * (l - 1)));
export const passOf = (c, l) => Math.round(c.passif.v * (1 + .12 * (l - 1)) * 10) / 10;
const no = msg => ({ ok: false, msg });

export function unlock(s, c) {
  if (s.comp.owned[c.id]) return no('Déjà débloqué');
  if (s.gold < c.cost) return no('Pas assez d\u2019or');
  s.gold -= c.cost; s.comp.owned[c.id] = 1; s.comp.active = s.comp.active || c.id; commit(); return { ok: true, msg: 'Compagnon éveillé !' };
}
export function levelUp(s, c) {
  const l = s.comp.owned[c.id], cost = lvlCost(c, l);
  if (l >= MAXL) return no('Niveau maximum');
  if (s.gold < cost) return no('Pas assez d\u2019or');
  s.gold -= cost; s.comp.owned[c.id] = l + 1; commit(); return { ok: true, msg: 'Amélioré !' };
}
export function setActive(s, c) { s.comp.active = c.id; commit(); return { ok: true, msg: '' }; }
