// Données des objets : emplacements, raretés, noms, statistiques, coûts
import { HEROES } from '../heroes.js';

export const SLOTS = { weapon: 'Arme', helmet: 'Casque', chest: 'Plastron', boots: 'Bottes', amulet: 'Amulette', ring: 'Anneau' };
export const RAR = [
  { n: 'Commun', c: '#9aa3bd', m: 1 }, { n: 'Rare', c: '#4cc9f0', m: 1.7 },
  { n: 'Épique', c: '#b983ff', m: 2.6 }, { n: 'Légendaire', c: '#ffb347', m: 4 },
];
const NAMES = {
  helmet: ['Casque de cuir', 'Heaume d\u2019acier', 'Heaume runique', 'Couronne des ombres'],
  chest:  ['Plastron de cuir', 'Cotte de mailles', 'Armure gravée', 'Cuirasse des abysses'],
  boots:  ['Bottes usées', 'Bottes ferrées', 'Bottes de vent', 'Sandales spectrales'],
  amulet: ['Amulette de bois', 'Amulette d\u2019argent', 'Talisman ardent', 'Cœur de la nuit'],
  ring:   ['Anneau de fer', 'Anneau d\u2019argent', 'Anneau runique', 'Anneau du vide'],
};
// [statistique, valeur de base, croissance par niveau]
const STAT = { weapon: ['atk', 6, .18], helmet: ['hp', 40, .18], chest: ['def', 8, .18], boots: ['spd', 3, .05], amulet: ['atk', 4, .18], ring: ['crit', 3, .05] };
export const STATLAB = { atk: 'Attaque', hp: 'Vie', def: 'Défense', spd: 'Vitesse %', crit: 'Critique %' };

export const itemName = i => i.slot === 'weapon' ? HEROES.find(h => h.id === i.hero).armes[i.rar] : NAMES[i.slot][i.rar];
export const statOf = i => { const [k, b, g] = STAT[i.slot]; return { k, v: Math.round(b * RAR[i.rar].m * (1 + g * (i.lvl - 1))) }; };
export const maxLvl = i => 10 + 5 * i.rar;
export const upCost = i => 40 * i.lvl * (i.rar + 1);
export const recycleGold = i => 15 * (i.rar + 1) * i.lvl;
export const newItem = (slot, rar = 0, hero) => ({ slot, rar, lvl: 1, ...(slot === 'weapon' ? { hero } : {}) });
