// Écran de démarrage LC STUDIO : logo 0,5 s -> texte 0,8 s -> pause 0,5 s -> fondu
const LOGO = `<svg class="logo" viewBox="0 0 120 120" fill="none">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fd6ff"/><stop offset="1" stop-color="#e9c46a"/></linearGradient></defs>
<rect x="5" y="5" width="110" height="110" rx="32" fill="#0e1428" stroke="url(#g)" stroke-width="3"/>
<path d="M38 30V84H68" stroke="url(#g)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M93 42A25 25 0 1 0 93 76" stroke="#e8ebf5" stroke-width="10" stroke-linecap="round"/>
</svg>`;
const TEXT = 'LC STUDIO';

export function runSplash(root, onDone) {
  const el = document.createElement('div');
  el.className = 'screen splash';
  el.innerHTML = LOGO + '<div class="brand"></div>';
  root.appendChild(el);
  const brand = el.querySelector('.brand');
  setTimeout(() => {                      // 0,5 s : logo apparu -> écriture
    let i = 0;
    const step = 800 / TEXT.length;
    const t = setInterval(() => {
      brand.textContent = TEXT.slice(0, ++i);
      if (i >= TEXT.length) clearInterval(t);
    }, step);
  }, 500);
  setTimeout(() => el.classList.add('out'), 1800);  // 0,5 + 0,8 + 0,5 pause
  setTimeout(() => { el.remove(); onDone(); }, 2100);
}
