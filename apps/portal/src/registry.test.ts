import { describe, expect, test } from "bun:test";
import {
  calculateJwkThumbprint,
  CompactSign,
  exportJWK,
  generateKeyPair,
} from "jose";
import {
  CLOUD_DIRECTORY_JWS_TYPE,
  CLOUD_DIRECTORY_RECORD_TYPE,
  InvalidCloudRecordError,
  verifyCloudDirectoryRecord,
} from "./registry";

async function createSignedRecord(
  options: { cloudId?: string; includePrivateKey?: boolean; includeName?: boolean } = {},
): Promise<string> {
  const { publicKey, privateKey } = await generateKeyPair("EdDSA", { extractable: true });
  const publicJwk = await exportJWK(publicKey);
  const cloudId = await calculateJwkThumbprint(publicJwk, "sha256");
  const payload = options.includeName
    ? { type: CLOUD_DIRECTORY_RECORD_TYPE, cloudId: options.cloudId ?? cloudId, name: "family" }
    : { type: CLOUD_DIRECTORY_RECORD_TYPE, cloudId: options.cloudId ?? cloudId };
  const protectedJwk = options.includePrivateKey
    ? await exportJWK(privateKey)
    : publicJwk;

  return new CompactSign(new TextEncoder().encode(JSON.stringify(payload)))
    .setProtectedHeader({
      alg: "EdDSA",
      typ: CLOUD_DIRECTORY_JWS_TYPE,
      kid: cloudId,
      jwk: protectedJwk,
    })
    .sign(privateKey);
}

describe("verifyCloudDirectoryRecord", () => {
  test("accepts a valid Ed25519-signed cloud record", async () => {
    const signedRecord = await createSignedRecord();

    const verifiedRecord = await verifyCloudDirectoryRecord(signedRecord);
    expect(verifiedRecord).toMatchObject({
      type: CLOUD_DIRECTORY_RECORD_TYPE,
    });
    expect(Object.keys(verifiedRecord)).toEqual(["type", "cloudId"]);
  });

  test("rejects a signature that has been modified", async () => {
    const parts = (await createSignedRecord()).split(".");
    parts[2] = `${parts[2].startsWith("A") ? "B" : "A"}${parts[2].slice(1)}`;

    await expect(verifyCloudDirectoryRecord(parts.join("."))).rejects.toBeInstanceOf(
      InvalidCloudRecordError,
    );
  });

  test("rejects a record whose cloud identifier is not bound to its key", async () => {
    const signedRecord = await createSignedRecord({
      cloudId: "A".repeat(43),
    });

    await expect(verifyCloudDirectoryRecord(signedRecord)).rejects.toBeInstanceOf(
      InvalidCloudRecordError,
    );
  });

  test("rejects records that expose a name", async () => {
    const signedRecord = await createSignedRecord({ includeName: true });

    await expect(verifyCloudDirectoryRecord(signedRecord)).rejects.toBeInstanceOf(
      InvalidCloudRecordError,
    );
  });

  test("rejects private keys embedded in the signed record", async () => {
    const signedRecord = await createSignedRecord({ includePrivateKey: true });

    await expect(verifyCloudDirectoryRecord(signedRecord)).rejects.toBeInstanceOf(
      InvalidCloudRecordError,
    );
  });
});
