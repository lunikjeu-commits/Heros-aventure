// Portraits vectoriels HD dessinés au canvas (silhouette + arme + halo)
export function drawPortrait(cv, h) {
  const r = devicePixelRatio || 1, w = cv.clientWidth, ht = cv.clientHeight;
  cv.width = w * r; cv.height = ht * r;
  const c = cv.getContext('2d'); c.scale(r, r);
  const g = c.createRadialGradient(w/2, ht*.45, 10, w/2, ht*.5, ht*.7);
  g.addColorStop(0, h.couleur + '55'); g.addColorStop(1, '#0b1020');
  c.fillStyle = g; c.fillRect(0, 0, w, ht);
  const x = w/2, y = ht*.82, s = Math.min(w, ht) / 260;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 18;
  c.fillStyle = '#12151f';
  body(c, h.id);
  c.shadowBlur = 0;
  c.fillStyle = h.couleur; c.beginPath(); c.arc(-6, -150, 3.2, 0, 7); c.arc(6, -150, 3.2, 0, 7); c.fill();
  weapon(c, h);
  c.restore();
}
function body(c, id) {
  const rr = (a,b,w,hh,k) => { c.beginPath(); c.roundRect(a,b,w,hh,k); c.fill(); };
  rr(-26, -130, 52, 80, 14);            // torse
  rr(-24, -52, 18, 52, 8); rr(6, -52, 18, 52, 8); // jambes
  c.beginPath(); c.arc(0, -150, 20, 0, 7); c.fill(); // tête
  if (id === 'assassin') { c.beginPath(); c.moveTo(-24,-150); c.lineTo(0,-185); c.lineTo(24,-150); c.fill(); }
  if (id === 'mage') { c.beginPath(); c.moveTo(-34,-135); c.lineTo(0,-195); c.lineTo(34,-135); c.fill(); }
  if (id === 'soldat') rr(-24, -172, 48, 14, 6);
  if (id === 'ange') { c.globalAlpha=.8; c.beginPath(); c.ellipse(-46,-110,26,50,-.5,0,7); c.ellipse(46,-110,26,50,.5,0,7); c.fill(); c.globalAlpha=1; }
  if (id === 'barbare') { rr(-36, -135, 72, 26, 12); }
}
function weapon(c, h) {
  c.strokeStyle = h.couleur; c.fillStyle = h.couleur; c.lineCap = 'round';
  c.shadowColor = h.couleur; c.shadowBlur = 14; c.lineWidth = 5;
  const L = (a,b,d,e) => { c.beginPath(); c.moveTo(a,b); c.lineTo(d,e); c.stroke(); };
  if (h.id === 'assassin') { L(-34,-85,-70,-135); L(34,-85,70,-135); }
  if (h.id === 'mage') { L(44,-20,44,-170); c.beginPath(); c.arc(44,-178,10,0,7); c.fill(); }
  if (h.id === 'soldat') { L(30,-90,64,-98); L(-30,-90,-64,-98); }
  if (h.id === 'ange') { L(44,-30,44,-170); c.beginPath(); c.arc(0,-185,16,0,7); c.lineWidth=3; c.stroke(); }
  if (h.id === 'barbare') { c.lineWidth = 7; L(44,-20,44,-150); c.beginPath(); c.moveTo(44,-150); c.quadraticCurveTo(84,-150,80,-110); c.lineTo(44,-120); c.fill(); }
}
