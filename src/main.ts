import { init, pause, play } from './ai'
import { draw } from './visualisation';


init();
draw();

// Handler Assignments
document.getElementById("pause")?.addEventListener("click", pause);
document.getElementById("play")?.addEventListener("click", play);