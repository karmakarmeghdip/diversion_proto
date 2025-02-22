// Server Context

import { Hono } from "hono";
import { logger } from "hono/logger";
import { auth } from "./auth"

export const app = new Hono().use(logger()).on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw)).get('/session', async (c) => {
  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "verse",
      instructions: "", // TODO: Add proompting
      input_audio_transcription: {
        model: 'whisper-1'
      }
    }),
  });
  const data = await r.json();
  return c.json(data);
})