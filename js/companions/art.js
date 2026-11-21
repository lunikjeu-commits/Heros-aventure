// Dessin vectoriel des esprits compagnons (utilisé en combat et dans l'écran)
export function drawSpirit(c, d, t, x, y, s = 1, face = 1) {
  c.save(); c.translate(x, y); c.scale(s * face, s);
  const g = c.createRadialGradient(0, 0, 2, 0, 0, 44);
  g.addColorStop(0, d.c + '66'); g.addColorStop(1, d.c + '00'); c.fillStyle = g; c.fillRect(-46, -46, 92, 92);
  const fl = Math.sin(t * 10), wing = Math.sin(t * 9) * .6;
  if (d.id === 'braise') {
    c.fillStyle = d.c;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-24 - i * 8 - fl * 3, i * 6 - 6, -34 - i * 9, i * 9 - 8); c.quadraticCurveTo(-22, i * 3, -8, 3); c.fill(); }
    c.fillStyle = '#ffd9a0'; c.beginPath(); c.ellipse(0, 0, 13, 8, 0, 0, 6.283); c.fill();
    c.beginPath(); c.arc(13, -5, 6, 0, 6.283); c.fill(); c.fillStyle = '#ff9a3d'; c.beginPath(); c.moveTo(18, -6); c.lineTo(27, -3); c.lineTo(18, -2); c.fill();
    c.save(); c.translate(-2, -6); c.rotate(-wing); c.fillStyle = d.c; c.beginPath(); c.ellipse(-4, -10, 18, 7, -.5, 0, 6.283); c.fill(); c.restore();
  } else if (d.id === 'givre') {
    c.fillStyle = '#d9f3ff'; c.beginPath(); c.ellipse(0, 0, 17, 9, 0, 0, 6.283); c.fill();
    c.beginPath(); c.arc(19, -7, 8, 0, 6.283); c.moveTo(16, -13); c.lineTo(18, -22); c.lineTo(23, -13); c.fill();
    c.beginPath(); c.moveTo(-15, -2); c.quadraticCurveTo(-32, -14 - fl * 3, -34, 4); c.quadraticCurveTo(-24, -4, -15, 4); c.fill();
    c.fillRect(-10, 6, 4, 9 + fl * 2); c.fillRect(10, 6, 4, 9 - fl * 2);
    c.fillStyle = d.c; c.beginPath(); c.arc(22, -8, 2, 0, 6.283); c.fill();
  } else {
    c.fillStyle = '#2b2f4a'; c.beginPath(); c.ellipse(0, 0, 12, 8, 0, 0, 6.283); c.fill(); c.beginPath(); c.arc(13, -4, 6, 0, 6.283); c.fill();
    c.save(); c.translate(-1, -5); c.rotate(-wing); c.beginPath(); c.moveTo(0, 0); c.lineTo(-30, -18); c.lineTo(-22, 0); c.fill(); c.restore();
    c.fillStyle = d.c; c.beginPath(); c.moveTo(18, -4); c.lineTo(26, -2); c.lineTo(18, 0); c.fill(); c.beginPath(); c.arc(15, -6, 1.8, 0, 6.283); c.fill();
    c.strokeStyle = d.c; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, 10); c.lineTo(-12 + fl * 2, 4); c.lineTo(-18, 0); c.lineTo(-8, -8); c.stroke();
  }
  c.restore();
}
