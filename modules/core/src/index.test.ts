import { describe, expect, test } from "bun:test";
import { healthResponse, PROTOCOL_VERSION } from "./index";

describe("healthResponse", () => {
  test("includes the shared protocol version and service identity", () => {
    expect(healthResponse("agent-core")).toEqual({
      protocolVersion: PROTOCOL_VERSION,
      service: "agent-core",
      status: "ok",
    });
  });
});
