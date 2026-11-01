/// <reference types="@cloudflare/workers-types" />

import { betterAuth } from "better-auth";
import { Hono } from "hono";
import { healthResponse } from "@merka/core";

interface PortalEnvironment {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

const app = new Hono<{ Bindings: PortalEnvironment }>();

function createAuth(env: PortalEnvironment) {
  return betterAuth({
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
  });
}

app.get("/", (context) =>
  context.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Merka.cloud Portal</title>
  </head>
  <body>
    <main>
      <h1>Merka.cloud Portal</h1>
      <p>The Cloudflare Workers portal scaffold is running.</p>
      <p>Authentication API: <code>/api/auth/*</code></p>
    </main>
  </body>
</html>`),
);

app.get("/health", (context) => context.json(healthResponse("portal")));

app.all("/api/auth/*", (context) => createAuth(context.env).handler(context.req.raw));

app.get("/api/session", async (context) => {
  const session = await createAuth(context.env).api.getSession({
    headers: context.req.raw.headers,
  });

  if (!session) {
    return context.json(
      { error: { code: "UNAUTHENTICATED", message: "Authentication required." } },
      401,
    );
  }

  return context.json({ session });
});

export default app;
