import { Hono } from "hono";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { analyzeConversation } from "./conversation-analyser";
import { generateSummary } from "./summariser";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { connectToDatabase } from "./db";

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
  const analysisStructure = z.object({
    overall_mood: z.string(),
    average_mood_score: z.number(),
    mood_distribution: z.record(z.number())
  })
  let analysis: analysisStructure;
  try {
    analysis = await analysisStructure.parseAsync(JSON.parse(raw));
  } catch (e) {
    console.error(e);
    return c.json({ error: "Invalid response from OpenAI" }, 400);
  }
  type analysisStructure = z.infer<typeof analysisStructure>;
  console.log(analysis);
  const summary_raw = await generateSummary(data.transcript);
  const summaryStructure = z.object({
    key_points: z.array(z.string())
  });
  let summary: z.infer<typeof summaryStructure>;
  try {
    summary = await summaryStructure.parseAsync(JSON.parse(summary_raw));
  } catch (e) {
    console.error(e);
    return c.json({ error: "Invalid response from OpenAI" }, 400);
  }
  console.log(summary);
  if (session) {
    const db = await connectToDatabase();
    const summaries = db.collection("summaries");
    const analsyses = db.collection("analyses");
    const p1 = summaries.insertOne({ user_id: session.user.id, date: new Date(), summary });
    const p2 = analsyses.insertOne({ user_id: session.user.id, date: new Date(), analysis });
    await Promise.all([p1, p2]);
    return c.text("OK");
  } else {
    return c.json({ error: "Not authenticated" }, 401);
  }
}).get('/summary', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Not authenticated" }, 401);
  }
  const db = await connectToDatabase();
  const summaries = db.collection("summaries");
  const summary = await summaries.find({ user_id: session.user.id }).sort({ date: -1 }).limit(50).toArray();
  return c.json(summary);
}).get('/analysis', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Not authenticated" }, 401);
  }
  const db = await connectToDatabase();
  const analyses = db.collection("analyses");
  const analysis = await analyses.find({ user_id: session.user.id }).sort({ date: -1 }).limit(50).toArray();
  return c.json(analysis);
});

export type AppType = typeof app;