import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "./db";

export const auth = betterAuth({
  database: mongodbAdapter(await connectToDatabase()),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // redirectURI: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback",
    },
  },
});