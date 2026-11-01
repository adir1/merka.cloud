# Online Portal

The portal starts as a Hono application on Cloudflare Workers, with D1-backed Better Auth email/password endpoints and shared health contracts. It is separate from the per-node dashboard.

## Local setup

1. Copy `.dev.vars.example` to `.dev.vars` and set a unique random `BETTER_AUTH_SECRET`.
2. Create the D1 database with `bunx wrangler d1 create merka-portal` and replace the placeholder `database_id` in `wrangler.jsonc`.
3. Generate and apply the Better Auth schema before using authentication routes.
4. Run `bun run dev:portal` from the repository root.

The login policy, verification/email delivery, recovery, social providers, and production domain are intentionally left for later requirements. Do not deploy until the D1 schema and production secret are configured.
