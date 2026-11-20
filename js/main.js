import { runSplash } from './splash.js';
import { showMenu } from './menu.js';

const app = document.getElementById('app');
runSplash(app, () => showMenu(app));
