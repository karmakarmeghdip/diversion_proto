import { Hono } from "hono";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { analyzeConversation, generateFollowUpQuestions } from "./conversation-analyser";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const session_req = z.object({
  transcript: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  }))
})

type session_req = z.infer<typeof session_req>

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
}).post('/session_finish', zValidator('json', session_req), async (c) => {
  const data = await c.req.json<session_req>();
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  console.log(data);
  const raw = await analyzeConversation(data.transcript);
  console.log(raw);
  const points = await generateFollowUpQuestions(data.transcript, raw);
  console.log(points);
  { /* Code to store the data to MongoDB */ }
  return c.json({ points, raw });
})

export type AppType = typeof app;