// Compagnons élémentaires à débloquer avec de l'or
export const COMPS = [
  { id: 'braise', nom: 'Braise', elem: 'Feu', c: '#ff7a3d', cost: 250, dmg: 22, cd: 1.5, rng: 520,
    desc: 'Esprit-phénix. Lance des boules de feu explosives.', passif: { k: 'atk', v: 5, txt: 'Attaque' } },
  { id: 'givre', nom: 'Givre', elem: 'Glace', c: '#7fd6ff', cost: 600, dmg: 26, cd: 2.4, rng: 480,
    desc: 'Loup spectral. Gèle les ennemis qu\u2019il frappe.', passif: { k: 'def', v: 6, txt: 'Défense' } },
  { id: 'orage', nom: 'Orage', elem: 'Foudre', c: '#ffe066', cost: 1000, dmg: 30, cd: 2, rng: 560,
    desc: 'Faucon de tempête. La foudre saute d\u2019un ennemi à l\u2019autre.', passif: { k: 'crit', v: 5, txt: 'Critique %' } },
];
