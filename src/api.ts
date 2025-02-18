// Server Context

import { Hono } from "hono";
import { logger } from "hono/logger";

export const app = new Hono().use(logger()).get('/session', async (c) => {
  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "verse",
    }),
  });
  const data = await r.json();
  return c.json(data);
})