import crypto from "crypto";

export function createHash(data, len = 2) {
  return crypto
    .createHash("shake256", { outputLength: len })
    .update(data)
    .digest("hex");
}
