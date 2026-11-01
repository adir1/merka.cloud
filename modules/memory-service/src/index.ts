import { healthResponse } from "@merka/core";

const port = Number(Bun.env.PORT ?? "3002");
const hostname = Bun.env.HOST ?? "127.0.0.1";

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new RangeError(`PORT must be an integer from 1 to 65535; received ${Bun.env.PORT}`);
}

const server = Bun.serve({
  hostname,
  port,
  fetch(request) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json(healthResponse("memory-service"));
    }

    return Response.json(
      { error: { code: "NOT_FOUND", message: "Route not found." } },
      { status: 404 },
    );
  },
});

console.log(`memory-service listening on http://${server.hostname}:${server.port}`);
