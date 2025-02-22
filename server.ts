import index from './pages/index.html';
import dashboard from './pages/dashboard.html';
import signup from './pages/signup.html';
import profilepage from './pages/profile.html';
import summarypage from './pages/summary.html';

import { app } from './src/api';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Please set the OPENAI_API_KEY environment variable");
}

Bun.serve({
  // Serve multiple static files
  static: {
    '/': index,
    '/dashboard': dashboard,
    '/signup': signup,
    '/profile': profilepage,
    '/summary': summarypage
  },
  development: true,
  fetch: app.fetch
});

console.log("Server started on port 3000")
