# Memory Service

An isolated Bun process for filesystem crawling, chunking, embedding generation, and local vector indexing in `bun:sqlite` with `sqlite-vec`.

The initial process exposes only the shared `/health` response on `127.0.0.1:3002`; indexing, storage, and scatter-gather search behavior are deferred until their requirements are defined.
