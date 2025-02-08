
let pc: RTCPeerConnection;

export async function init() {
  // Get an ephemeral key from your server - see server code below
  const tokenResponse = await fetch("/session");
  const data = await tokenResponse.json();
  const EPHEMERAL_KEY = data.client_secret.value;

  // Create a peer connection
  pc = new RTCPeerConnection();

  // Set up to play remote audio from the model
  const audioEl = document.getElementById("source") as HTMLAudioElement || document.createElement("audio");
  audioEl.autoplay = true;
  pc.ontrack = e => audioEl.srcObject = e.streams[0];

  // Add local audio track for microphone input in the browser
  const ms = await navigator.mediaDevices.getUserMedia({
    audio: true
  });
  pc.addTrack(ms.getTracks()[0]);

  // Set up data channel for sending and receiving events
  const dc = pc.createDataChannel("oai-events");
  dc.addEventListener("message", (e) => {
    const realtimeEvent = JSON.parse(e.data);
    console.log(realtimeEvent);
    const comp = document.getElementById("transcript");
    if (!comp) return;
    if (realtimeEvent.type === 'response.done') {
      comp.innerHTML = "";
      realtimeEvent.response?.output?.forEach((output: any) => {
        output.content?.forEach((content: any) => {
          comp.innerHTML += content.transcript;
        });
      });
    } else if(realtimeEvent.type === 'response.audio_transcript.delta') {
      comp.innerHTML += realtimeEvent.delta;
    } else if(realtimeEvent.type === 'output_audio_buffer.cleared' || realtimeEvent.type === 'output_audio_buffer.stopped') {
      comp.innerHTML = "";
    }
  });

  // Start the session using the Session Description Protocol (SDP)
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const baseUrl = "https://api.openai.com/v1/realtime";
  const model = "gpt-4o-realtime-preview-2024-12-17";
  const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${EPHEMERAL_KEY}`,
      "Content-Type": "application/sdp"
    },
  });

  const answer = {
    type: "answer",
    sdp: await sdpResponse.text(),
  };
  // @ts-ignore
  await pc.setRemoteDescription(answer);
}

export const pause = () => {
  pc.getSenders().forEach(sender => {
    if (sender.track) {
      sender.track.enabled = false;
    }
  });
}

export const play = () => {
  pc.getSenders().forEach(sender => {
    if (sender.track) {
      sender.track.enabled = true;
    }
  });
}