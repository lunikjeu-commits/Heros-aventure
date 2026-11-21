// L'arme évolue : la rareté change l'attaque de base du héros
export function tierBasic(id, b, r) {
  const o = { ...b };
  if (id === 'assassin') { o.range = b.range + 8 * r; o.cd = b.cd * (1 - .06 * r); }
  else if (id === 'mage') { o.size = b.size + r; if (r >= 2) { o.n = r; o.spread = .14; } }
  else if (id === 'soldat') {
    if (r === 1) Object.assign(o, { name: 'Mitraillette', cd: .2, n: 1, mult: 1.3 });
    else if (r === 2) Object.assign(o, { name: 'Mitrailleuse', cd: .11, n: 1, mult: .95 });
    else if (r === 3) Object.assign(o, { name: 'Fusil d\u2019assaut', cd: .16, n: 1, mult: 2, speed: 950 });
  }
  else if (id === 'ange') { if (r >= 2) { o.n = r; o.spread = .1; } }
  else if (id === 'barbare') { o.range = b.range + 8 * r; o.mult = b.mult + .1 * r; }
  return o;
}
