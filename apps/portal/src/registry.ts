import {
  calculateJwkThumbprint,
  compactVerify,
  decodeProtectedHeader,
  errors,
  importJWK,
  type JWK,
} from "jose";
import type { CloudDirectoryRecordV1 } from "@merka/core";

export const CLOUD_DIRECTORY_RECORD_TYPE = "merka.cloud.directory.v1";
export const CLOUD_DIRECTORY_JWS_TYPE = "merka-cloud-directory+jws";

const cloudIdPattern = /^[A-Za-z0-9_-]{43}$/;
const publicKeyPattern = /^[A-Za-z0-9_-]{43}$/;

export class InvalidCloudRecordError extends Error {
  constructor() {
    super("The signed cloud directory record is invalid.");
    this.name = "InvalidCloudRecordError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPublicEd25519Key(value: unknown): JWK {
  if (
    !isObject(value) ||
    Object.keys(value).length !== 3 ||
    value.kty !== "OKP" ||
    value.crv !== "Ed25519" ||
    typeof value.x !== "string" ||
    !publicKeyPattern.test(value.x)
  ) {
    throw new InvalidCloudRecordError();
  }

  return { kty: "OKP", crv: "Ed25519", x: value.x };
}

function readDirectoryRecord(
  value: unknown,
  expectedCloudId: string,
): CloudDirectoryRecordV1 {
  if (
    !isObject(value) ||
    Object.keys(value).length !== 2 ||
    value.type !== CLOUD_DIRECTORY_RECORD_TYPE ||
    typeof value.cloudId !== "string" ||
    value.cloudId !== expectedCloudId
  ) {
    throw new InvalidCloudRecordError();
  }

  return {
    type: CLOUD_DIRECTORY_RECORD_TYPE,
    cloudId: value.cloudId,
  };
}

function invalidJws(error: unknown): never {
  if (error instanceof errors.JOSENotSupported) {
    throw error;
  }
  if (error instanceof errors.JOSEError) {
    throw new InvalidCloudRecordError();
  }
  throw error;
}

export async function verifyCloudDirectoryRecord(
  signedRecord: string,
): Promise<CloudDirectoryRecordV1> {
  let protectedHeader;
  try {
    protectedHeader = decodeProtectedHeader(signedRecord);
  } catch (error) {
    return invalidJws(error);
  }

  const allowedHeaderKeys = new Set(["alg", "typ", "kid", "jwk"]);
  if (
    Object.keys(protectedHeader).some((key) => !allowedHeaderKeys.has(key)) ||
    protectedHeader.alg !== "EdDSA" ||
    protectedHeader.typ !== CLOUD_DIRECTORY_JWS_TYPE ||
    typeof protectedHeader.kid !== "string"
  ) {
    throw new InvalidCloudRecordError();
  }

  const publicJwk = readPublicEd25519Key(protectedHeader.jwk);
  const cloudId = await calculateJwkThumbprint(publicJwk, "sha256");
  if (!cloudIdPattern.test(cloudId) || protectedHeader.kid !== cloudId) {
    throw new InvalidCloudRecordError();
  }

  let verifiedPayload: Uint8Array;
  try {
    const publicKey = await importJWK(publicJwk, "EdDSA");
    ({ payload: verifiedPayload } = await compactVerify(signedRecord, publicKey, {
      algorithms: ["EdDSA"],
    }));
  } catch (error) {
    return invalidJws(error);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(verifiedPayload));
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      throw new InvalidCloudRecordError();
    }
    throw error;
  }

  return readDirectoryRecord(payload, cloudId);
}

export function isValidCloudId(cloudId: string): boolean {
  return cloudIdPattern.test(cloudId);
}
