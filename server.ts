import index from './index.html';
import dashboard from './dashboard.html';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Please set the OPENAI_API_KEY environment variable");
}

Bun.serve({
  // Serve multiple static files
  static: {
    '/': index,
    '/dashboard': dashboard,
  },
  development: true,
  async fetch(request, server) {
    if (request.url.endsWith('/session')) {
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
      return new Response(JSON.stringify(data));
    }
    return new Response("Not Found", { status: 404 });
  },
});
