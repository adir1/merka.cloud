# Inference Service

An isolated Bun process for local GGUF inference using `node-llama-cpp`. The main daemon will own lifecycle supervision and fallback routing.

The initial process exposes only the shared `/health` response on `127.0.0.1:3001`; model loading and the OpenAI-compatible inference API are intentionally deferred until their requirements are defined.
