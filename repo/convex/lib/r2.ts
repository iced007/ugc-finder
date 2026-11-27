// Signs requests to the private R2 bucket through its S3 API. Server only.
import { AwsClient } from "aws4fetch";
import { PLAYBACK_URL_TTL_SECONDS, UPLOAD_URL_TTL_SECONDS } from "./config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`R2 is not configured: missing ${name}`);
  return value;
}

function connect(key: string) {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const client = new AwsClient({
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });
  const bucket = requireEnv("R2_BUCKET");
  const path = key.split("/").map(encodeURIComponent).join("/");
  const url = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${path}`,
  );
  return { client, url };
}

/**
 * The upload must send exactly this content type and size, plus
 * `If-None-Match: *`, or R2 rejects it. That header makes the URL work once: R2
 * answers 412 if the key already exists.
 */
export async function presignPut(
  key: string,
  contentType: string,
  sizeBytes: number,
): Promise<string> {
  const { client, url } = connect(key);
  url.searchParams.set("X-Amz-Expires", String(UPLOAD_URL_TTL_SECONDS));
  const signed = await client.sign(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(sizeBytes),
      "If-None-Match": "*",
    },
    // allHeaders: aws4fetch leaves Content-Type and Content-Length unsigned by
    // default.
    aws: { signQuery: true, allHeaders: true },
  });
  return signed.url;
}

export async function presignGet(key: string): Promise<string> {
  const { client, url } = connect(key);
  url.searchParams.set("X-Amz-Expires", String(PLAYBACK_URL_TTL_SECONDS));
  const signed = await client.sign(url.toString(), {
    method: "GET",
    aws: { signQuery: true },
  });
  return signed.url;
}

/** Deleting a key that does not exist also succeeds. */
export async function deleteObject(key: string): Promise<void> {
  const { client, url } = connect(key);
  const response = await client.fetch(url.toString(), { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`R2 delete failed with status ${response.status}`);
  }
}

/** `sizeBytes` is null unless the object exists and R2 reports its length. */
export async function headObject(
  key: string,
): Promise<{ status: number; sizeBytes: number | null }> {
  const { client, url } = connect(key);
  const response = await client.fetch(url.toString(), { method: "HEAD" });
  const length = response.headers.get("content-length");
  return {
    status: response.status,
    sizeBytes: response.ok && length !== null ? Number(length) : null,
  };
}
