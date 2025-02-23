import { Hono } from "hono";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { analyzeConversation } from "./conversation-analyser";
import { generateSummary } from "./summariser";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { connectToDatabase } from "./db";

// Type definitions
const SessionTranscript = z.object({
  transcript: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  }))
});

const AnalysisSchema = z.object({
  overall_mood: z.string(),
  average_mood_score: z.number(),
  mood_distribution: z.record(z.number())
});

const SummarySchema = z.object({
  key_points: z.array(z.string())
});

type SessionTranscript = z.infer<typeof SessionTranscript>;
type Analysis = z.infer<typeof AnalysisSchema>;
type Summary = z.infer<typeof SummarySchema>;

// Controller functions
async function createSession(user_id: string | undefined) {
  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "verse",
      instructions: "You are a human journaler, you will be asking questions to the user and recording their responses. What happened today? How are you feeling? Did something make you happy or sad? Were you Anxious or Calm? Were you able to focus on the task at hand? What did you have for lunch? What did you have for breakfast? What did you have for dinner? What did you have for lunch? What did you have for breakfast? What did you have for dinner? Previous conversation: " + "", // TODO: Add proompting (dummy data c.req.query("previous_conversation"))
      input_audio_transcription: {
        model: 'whisper-1'
      }
    }),
  });
  return response.json();
}

async function processSessionFinish(userId: string, data: SessionTranscript) {
  const raw = await analyzeConversation(data.transcript);
  const analysis = await AnalysisSchema.parseAsync(JSON.parse(raw));

  const summary_raw = await generateSummary(data.transcript);
  const summary = await SummarySchema.parseAsync(JSON.parse(summary_raw));

  const db = await connectToDatabase();
  const summaries = db.collection("summaries");
  const analyses = db.collection("analyses");

  await Promise.all([
    summaries.insertOne({ user_id: userId, date: new Date(), summary }),
    analyses.insertOne({ user_id: userId, date: new Date(), analysis })
  ]);

  return { analysis, summary };
}

async function getUserSummaries(userId: string) {
  const db = await connectToDatabase();
  return db.collection("summaries")
    .find({ user_id: userId })
    .sort({ date: -1 })
    .limit(50)
    .toArray();
}

async function getUserAnalyses(userId: string) {
  const db = await connectToDatabase();
  return db.collection("analyses")
    .find({ user_id: userId })
    .sort({ date: -1 })
    .limit(50)
    .toArray();
}

// API Routes
export const app = new Hono()
  .use(logger())
  .on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))

  // Session routes
  .get('/session', async (c) => {
    /**
     * @description Create a new conversation session
     * @returns {Object} Session configuration and tokens
     */
    const userSession = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!userSession) {
      return c.json({ error: "User is not logged in" }, 403)
    }
    const sessionData = await createSession(userSession?.user.id);
    return c.json(sessionData);
  })

  .post('/session_finish', zValidator('json', SessionTranscript), async (c) => {
    /**
     * @description Process and analyze a completed conversation session
     * @body {SessionTranscript} Conversation transcript
     * @returns {Object} Analysis and summary results
     */
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Not authenticated" }, 401);

    try {
      const data = await c.req.json<SessionTranscript>();
      const results = await processSessionFinish(session.user.id, data);
      return c.json(results);
    } catch (e) {
      console.error(e);
      return c.json({ error: "Processing failed" }, 400);
    }
  })

  // User data routes
  .get('/api/summary', async (c) => {
    /**
     * @description Retrieve user's conversation summaries
     * @returns {Array} List of conversation summaries
     */
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Not authenticated" }, 401);

    const summaries = await getUserSummaries(session.user.id);
    return c.json(summaries);
  })

  .get('/api/analysis', async (c) => {
    /**
     * @description Retrieve user's conversation analyses
     * @returns {Array} List of conversation analyses
     */
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Not authenticated" }, 401);

    const analyses = await getUserAnalyses(session.user.id);
    return c.json(analyses);
  });

export type AppType = typeof app;