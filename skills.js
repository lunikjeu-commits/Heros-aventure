// Stats de combat et compétences de chaque héros (data-driven)
// types : melee | shot | dash | nova | heal
export const COMBAT = {
  assassin: { hp: 420, spd: 215, dmg: 16, jump: 430, crit: .30,
    basic: { type:'melee', cd:.26, range:66, mult:1, kb:70, color:'#ff5d73', name:'Lames' },
    s1: { type:'dash', cd:3, dist:190, range:70, mult:2.3, color:'#ff7a8a', name:'Fente' },
    s2: { type:'nova', cd:6, radius:115, mult:2.8, color:'#ff5d73', name:'Tourbillon' } },
  mage: { hp: 560, spd: 150, dmg: 18, jump: 430, crit: .15,
    basic: { type:'shot', cd:.5, speed:430, mult:1, color:'#4cc9f0', size:7, n:1, name:'Éclair' },
    s1: { type:'shot', cd:3, speed:300, mult:3.2, color:'#ff8a3d', size:13, explode:85, n:1, name:'Boule de feu' },
    s2: { type:'nova', cd:6, radius:160, mult:2, color:'#9be7ff', freeze:2.2, name:'Nova de glace' } },
  soldat: { hp: 500, spd: 140, dmg: 20, jump: 420, crit: .15,
    basic: { type:'shot', cd:.34, speed:720, mult:.8, color:'#ffd27a', size:3, n:2, spread:.025, name:'Pistolets' },
    s1: { type:'shot', cd:3.5, speed:650, mult:.9, color:'#ffd27a', size:3, n:7, spread:.12, name:'Salve' },
    s2: { type:'shot', cd:7, speed:380, mult:4.2, color:'#ff9f43', size:9, explode:115, n:1, name:'Grenade' } },
  ange: { hp: 520, spd: 170, dmg: 18, jump: 450, crit: .15,
    basic: { type:'shot', cd:.42, speed:560, mult:1, color:'#fff3b0', size:6, n:1, pierce:true, name:'Rayon' },
    s1: { type:'heal', cd:9, amount:.25, color:'#fff3b0', name:'Bénédiction' },
    s2: { type:'nova', cd:6, radius:175, mult:3, color:'#fff3b0', name:'Jugement' } },
  barbare: { hp: 760, spd: 120, dmg: 24, jump: 400, crit: .12,
    basic: { type:'melee', cd:.5, range:84, mult:1.15, kb:140, color:'#b983ff', name:'Hache' },
    s1: { type:'nova', cd:4, radius:125, mult:2.5, color:'#b983ff', name:'Onde d\u2019os' },
    s2: { type:'dash', cd:6, dist:230, range:80, mult:3, color:'#b983ff', name:'Charge' } },
};
