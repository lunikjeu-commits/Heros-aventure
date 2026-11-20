// Butin de fin de combat : or + objets (plus rares contre les boss)
import { HEROES } from '../heroes.js';
import { SLOTS, newItem } from './items.js';

export function rollLoot(heroId, level, world, boss) {
  const gold = Math.round((40 + level * 12) * (1 + (world - 1) * .8)) * (boss ? 3 : 1);
  const n = 1 + (boss ? 2 : 0) + (Math.random() < .4 ? 1 : 0), items = [], slots = Object.keys(SLOTS);
  for (let i = 0; i < n; i++) {
    const x = Math.random() + level * .004 + (boss ? .25 : 0);
    let rar = x > 1.18 ? 3 : x > .95 ? 2 : x > .7 ? 1 : 0;
    if (boss) rar = Math.max(1, rar);
    const hero = Math.random() < .6 ? heroId : HEROES[Math.floor(Math.random() * HEROES.length)].id;
    items.push(newItem(slots[Math.floor(Math.random() * slots.length)], rar, hero));
  }
  return { gold, items };
}
