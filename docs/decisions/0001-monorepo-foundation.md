# ADR 0001: Monorepo foundation

- **Status:** Accepted for the initial scaffold
- **Date:** 2026-10-31

## Context

Merka.cloud is moving from a collection of infrastructure experiments and API specifications toward a multi-device agent platform. The repository needs explicit boundaries for its local processes, shared protocol, online portal, and mobile client while preserving useful existing material.

## Decisions

- Use Bun workspaces for the three local Bun services and shared `@merka/core` package.
- Keep each local runtime isolated in `modules/agent-core`, `modules/inference-service`, and `modules/memory-service`.
- Put shared, versioned protocol types in `modules/core`; the current contracts are deliberately a small baseline, not a finalized wire protocol.
- Scaffold the portal as a Cloudflare Worker using Hono, D1, and Better Auth. Better Auth with D1 was selected by the user; the remaining account and deployment policies are undecided.
- Scaffold mobile as an Expo development build with React Native and `llama.rn`, as selected by the user.
- Put architecture documents and ADRs in `docs/`; move deployment configuration to `infra/` and the existing Fabric utilities to `tools/fabric`.

## Consequences

- The three local services expose loopback-only health endpoints until their network and authorization requirements are implemented.
- The portal requires a real D1 database ID, generated Better Auth schema, and production secret before deployment.
- The mobile app requires a development build to load native inference code; no model lifecycle or device enrollment behavior is defined yet.
- Existing setup, API, security, and Fabric material remains in the repository under its new locations.
