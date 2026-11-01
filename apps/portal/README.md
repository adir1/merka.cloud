# Online Portal

The portal publishes static website assets and exposes a public API for cryptographically published Merka cloud identities. Creating or administering a cloud does not require a portal account; after discovery, cloud devices connect and enforce authorization directly.

The Worker is implemented in TypeScript with Hono and Cloudflare D1. D1 stores only the signed public directory record and lookup fields; it does not store user profiles or cloud content.

## Directory API

- `POST /api/clouds` registers a cloud using a compact signed record in `{ "signedRecord": "..." }`.
- `GET /api/clouds/by-id/:cloudId` looks up a cloud by its key-derived identifier.
- `GET /health` reports service health. Static files are served from `public/`.

The directory is non-enumerable: it has no list, shortname, or subdomain lookup. A cloud ID must be communicated through a trusted offline or separate channel before lookup. The ID is a pseudonymous public locator, not a secret or access credential; anyone who learns it can query the public record.

The initial record format is a prototype using JWS Compact Serialization with EdDSA/Ed25519. The protected header contains the public Ed25519 JWK and its RFC 7638 SHA-256 thumbprint as `kid`; the thumbprint is also the immutable `cloudId`. The signed payload is exactly `{ "type": "merka.cloud.directory.v1", "cloudId": "..." }`. Registration proves possession of the key; clients verify that the returned public key hashes to the ID they received out of band. No portal credentials or secrets are used.

Initial registration is immutable. Updates, deletion, key rotation, anti-abuse controls, and freshness/replay policy are not implemented.

## Local setup

From `apps/portal/`:

1. Create a D1 database with `bunx wrangler d1 create merka-portal` and set its ID in `wrangler.jsonc`.
2. Apply the local schema with `bunx wrangler d1 migrations apply merka-portal --local`.

From the repository root, run `bun run dev:portal`.

Before deploying, apply the schema remotely from `apps/portal/` with `bunx wrangler d1 migrations apply merka-portal --remote`. The current D1 schema and registration format are scaffolding and should be reviewed before production use.
