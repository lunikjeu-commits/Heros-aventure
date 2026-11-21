import { runSplash } from './splash.js';
import { showMenu } from './menu.js';

const app = document.getElementById('app');
window.__ok = true;   // le chargement des modules a réussi
runSplash(app, () => showMenu(app));
