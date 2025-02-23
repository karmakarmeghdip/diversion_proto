import { init, pause, play, done } from './ai'
import { draw } from './visualisation';


init();
draw();

let isPaused = false;

// Handler Assignments
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
  document.getElementById("mic-btn")?.addEventListener("click", () => {
    console.log("Mic button clicked");
    if (isPaused) {
      console.log("Resuming audio transmission");
      play();
      isPaused = false;
    } else {
      console.log("Pausing audio transmission");
      pause();
      isPaused = true;
    }
  });
  document.getElementById("done-btn")?.addEventListener("click", () => {
    console.log("Done button clicked");
    done();
  });
});