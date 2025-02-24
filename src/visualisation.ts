// Get references to the HTML elements
const audioElement = document.getElementById('source') as HTMLAudioElement;
const canvas = document.getElementById('visualisation') as HTMLCanvasElement;
if (!audioElement || !canvas) {
  throw new Error('Missing HTML elements');
}
const canvasCtx = canvas.getContext('2d');

let audioCtx: AudioContext | undefined;

function initAudio() {
  return new Promise<AudioContext>((resolve, reject) => {
    document.getElementById("mic-btn")?.addEventListener("click", () => {
      if (!audioCtx) {
        // @ts-ignore
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Initialize other audio nodes here
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      resolve(audioCtx)
    });
  });
}

// Add to your mic button click handler in main.ts
audioCtx = await initAudio();

// Create a MediaElementAudioSourceNode from the audio element
const sourceNode = audioCtx.createMediaElementSource(audioElement);

// Create an AnalyserNode
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048; // Default fftSize is 2048

// Determine the number of data points to collect
const bufferLength = analyser.frequencyBinCount; // equals fftSize/2
const dataArray = new Uint8Array(bufferLength);

// Connect the nodes: audio source -> analyser -> destination (speakers)
sourceNode.connect(analyser);
analyser.connect(audioCtx.destination);

// (Optional) Set the canvas dimensions; here we make it fill the window.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
}

// Add event listener for resize
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial sizing

// This function will draw the waveform on the canvas repeatedly.
export function draw() {
  // Copy the current time-domain data into our array
  analyser.getByteTimeDomainData(dataArray);
  if (!canvasCtx) {
    throw new Error('Failed to get 2d context from canvas');
  }
  // Clear the canvas with a light gray background
  canvasCtx.fillStyle = 'rgb(31 41 55)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Set up the drawing style for the waveform line
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(156 163 175)';
  canvasCtx.beginPath();

  // Calculate the width of each slice of the waveform
  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  // Loop through the dataArray and plot each point
  for (let i = 0; i < bufferLength; i++) {
    // Scale the data from [0, 255] to roughly [0, canvas.height]
    const v = dataArray[i] / 128.0; // 128 is the midpoint for 8-bit data
    const y = (v * canvas.height) / 2; // center the waveform vertically

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  // Draw a line to the end of the canvas (centered vertically)
  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
  requestAnimationFrame(draw);
}
