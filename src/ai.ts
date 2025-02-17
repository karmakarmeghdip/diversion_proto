let pc: RTCPeerConnection;
let currentChatBubble: HTMLElement | null = null;

/**
 * Initializes the WebRTC connection and sets up event listeners.
 */
export async function init() {
  const tokenResponse = await fetch("/session");
  const data = await tokenResponse.json();
  const EPHEMERAL_KEY = data.client_secret.value;

  pc = new RTCPeerConnection();

  const audioEl = document.getElementById("source") as HTMLAudioElement || document.createElement("audio");
  audioEl.autoplay = true;
  pc.ontrack = (e) => audioEl.srcObject = e.streams[0];

  const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
  pc.addTrack(ms.getTracks()[0]);

  const dc = pc.createDataChannel("oai-events");
  dc.addEventListener("message", (e) => handleIncomingMessage(e));

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const baseUrl = "https://api.openai.com/v1/realtime";
  const model = "gpt-4o-realtime-preview-2024-12-17";
  const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${EPHEMERAL_KEY}`,
      "Content-Type": "application/sdp",
    },
  });

  const answer: RTCSessionDescriptionInit = {
    type: "answer",
    sdp: await sdpResponse.text(),
};
  await pc.setRemoteDescription(answer);
}

/**
 * Handles incoming WebRTC messages and updates the UI accordingly.
 */
function handleIncomingMessage(event: MessageEvent) {
  const realtimeEvent = JSON.parse(event.data);

  if (realtimeEvent.type === "response.audio_transcript.delta") {
    appendToChatBubble(realtimeEvent.delta);
  } else if (realtimeEvent.type === "response.done") {
    const finalMessage = realtimeEvent.response?.output?.map((output: any) =>
      output.content?.map((content: any) => content.transcript).join("")
    ).join("");
    finalizeChatBubble(finalMessage || "");
  }
}

/**
 * Appends delta text to the current chat bubble.
 */
function appendToChatBubble(delta: string) {
  if (!currentChatBubble) {
    currentChatBubble = document.createElement("div");
    currentChatBubble.className = "chat-bubble";
    document.getElementById("transcript")?.appendChild(currentChatBubble);
  }
  currentChatBubble.innerText += delta;
}

/**
 * Finalizes the current chat bubble with the complete message.
 */
function finalizeChatBubble(finalMessage: string) {
  if (currentChatBubble) {
    currentChatBubble.innerText = finalMessage;
    currentChatBubble = null;
  }
}

/**
 * Pauses audio transmission by disabling the local audio track.
 */
export const pause = () => {
  pc.getSenders().forEach(sender => {
    if (sender.track) {
      sender.track.enabled = false;
    }
  });
}

/**
 * Resumes audio transmission by enabling the local audio track.
 */
export const play = () => {
  pc.getSenders().forEach(sender => {
    if (sender.track) {
      sender.track.enabled = true;
    }
  });
}
