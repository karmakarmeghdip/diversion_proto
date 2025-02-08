import Alpine from 'alpinejs'
import { init, pause, play } from './src/ai'
import { draw } from './src/visualisation';
Alpine.start()

init();
draw();

// Handler Assignments
document.getElementById("pause")?.addEventListener("click", pause);
document.getElementById("play")?.addEventListener("click", play);