/// <reference types="@cloudflare/workers-types" />

import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { healthResponse } from "@merka/core";
import type {
  CloudDirectoryEntryV1,
  CloudDirectoryRecordV1,
  CloudDirectoryRegistrationRequestV1,
} from "@merka/core";
import {
  InvalidCloudRecordError,
  isValidCloudId,
  verifyCloudDirectoryRecord,
} from "./registry";

interface PortalEnvironment {
  DB: D1Database;
  ASSETS: Fetcher;
}

interface CloudRow {
  cloud_id: string;
  signed_record: string;
  created_at: string;
}

class RequestPayloadError extends Error {
  constructor(
    readonly status: 400 | 413,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "RequestPayloadError";
  }
}

const app = new Hono<{ Bindings: PortalEnvironment }>();
const maxRequestBytes = 8 * 1024;
type PortalContext = Context<{ Bindings: PortalEnvironment }>;

function apiError(
  context: PortalContext,
  status: 400 | 404 | 413 | 415,
  code: string,
  message: string,
) {
  return context.json({ error: { code, message } }, status);
}

async function readJsonBody(request: Request): Promise<unknown> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      throw new RequestPayloadError(400, "INVALID_CONTENT_LENGTH", "Invalid content length.");
    }
    if (parsedLength > maxRequestBytes) {
      throw new RequestPayloadError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
    }
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new RequestPayloadError(400, "INVALID_JSON", "A JSON request body is required.");
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxRequestBytes) {
        await reader.cancel();
        throw new RequestPayloadError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new RequestPayloadError(400, "INVALID_JSON", "Request body must be valid UTF-8 JSON.");
    }
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new RequestPayloadError(400, "INVALID_JSON", "Request body must be valid JSON.");
    }
    throw error;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRegistrationRequest(value: unknown): value is CloudDirectoryRegistrationRequestV1 {
  return (
    isObject(value) &&
    Object.keys(value).length === 1 &&
    typeof value.signedRecord === "string"
  );
}

function toDirectoryEntry(
  row: CloudRow,
  record: CloudDirectoryRecordV1,
): CloudDirectoryEntryV1 {
  return {
    record,
    signedRecord: row.signed_record,
    createdAt: row.created_at,
  };
}

async function verifyStoredRow(row: CloudRow): Promise<CloudDirectoryRecordV1> {
  const record = await verifyCloudDirectoryRecord(row.signed_record);
  if (record.cloudId !== row.cloud_id) {
    throw new Error("Stored cloud directory fields do not match the signed record.");
  }
  return record;
}

app.use("/api/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST"],
  allowHeaders: ["Content-Type"],
}));

app.get("/health", (context) => context.json(healthResponse("portal")));

app.post("/api/clouds", async (context) => {
  if (
    context.req.header("content-type")?.split(";", 1)[0].trim().toLowerCase() !==
    "application/json"
  ) {
    return apiError(context, 415, "UNSUPPORTED_MEDIA_TYPE", "Expected application/json.");
  }

  let body: unknown;
  try {
    body = await readJsonBody(context.req.raw);
  } catch (error) {
    if (error instanceof RequestPayloadError) {
      return apiError(context, error.status, error.code, error.message);
    }
    throw error;
  }

  if (!isRegistrationRequest(body) || body.signedRecord.length > maxRequestBytes) {
    return apiError(context, 400, "INVALID_REGISTRATION", "A signed cloud record is required.");
  }

  let record: CloudDirectoryRecordV1;
  try {
    record = await verifyCloudDirectoryRecord(body.signedRecord);
  } catch (error) {
    if (error instanceof InvalidCloudRecordError) {
      return apiError(context, 400, "INVALID_CLOUD_RECORD", error.message);
    }
    throw error;
  }

  const insert = await context.env.DB.prepare(
    `INSERT INTO cloud_registry (cloud_id, signed_record)
     VALUES (?, ?)
     ON CONFLICT DO NOTHING`,
  )
    .bind(record.cloudId, body.signedRecord)
    .run();

  if (!insert.success) {
    throw new Error("Cloud directory insert failed.");
  }

  if (insert.meta.changes === 1) {
    const row = await context.env.DB.prepare(
      "SELECT cloud_id, signed_record, created_at FROM cloud_registry WHERE cloud_id = ?",
    )
      .bind(record.cloudId)
      .first<CloudRow>();
    if (!row) {
      throw new Error("Cloud registration was inserted but could not be read back.");
    }
    return context.json(toDirectoryEntry(row, record), 201);
  }

  const existingById = await context.env.DB.prepare(
    "SELECT cloud_id, signed_record, created_at FROM cloud_registry WHERE cloud_id = ?",
  )
    .bind(record.cloudId)
    .first<CloudRow>();

  if (existingById) {
    return context.json(toDirectoryEntry(existingById, record), 200);
  }

  throw new Error("Cloud registration was not inserted and no record was found.");
});

app.get("/api/clouds/by-id/:cloudId", async (context) => {
  const cloudId = context.req.param("cloudId");
  if (!isValidCloudId(cloudId)) {
    return apiError(context, 400, "INVALID_CLOUD_ID", "Cloud identifier is invalid.");
  }

  const row = await context.env.DB.prepare(
    "SELECT cloud_id, signed_record, created_at FROM cloud_registry WHERE cloud_id = ?",
  )
    .bind(cloudId)
    .first<CloudRow>();

  if (!row) {
    return apiError(context, 404, "CLOUD_NOT_FOUND", "Cloud was not found.");
  }

  const record = await verifyStoredRow(row);
  context.header("Cache-Control", "public, max-age=60");
  return context.json(toDirectoryEntry(row, record));
});

app.notFound((context) => context.env.ASSETS.fetch(context.req.raw));

export default app;
