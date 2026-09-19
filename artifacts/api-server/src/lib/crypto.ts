import crypto from "crypto";
import { promisify } from "util";

const pbkdf2 = promisify(crypto.pbkdf2);
const algorithm = "pbkdf2-sha512";
const currentIterations = 210_000;
const legacyIterations = 1_000;
const keyLength = 64;
const digest = "sha512";

async function derivePassword(
  password: string,
  salt: string,
  iterations: number,
) {
  return pbkdf2(password, salt, iterations, keyLength, digest);
}

export async function hashPassword(
  password: string,
): Promise<{ salt: string; hash: string }> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await derivePassword(password, salt, currentIterations);
  return {
    salt,
    hash: `${algorithm}$${currentIterations}$${derived.toString("hex")}`,
  };
}

function parseStoredHash(hash: string) {
  const [storedAlgorithm, rawIterations, derivedHex] = hash.split("$");
  const iterations = Number(rawIterations);

  if (
    storedAlgorithm === algorithm &&
    Number.isSafeInteger(iterations) &&
    iterations > 0 &&
    /^[a-f0-9]{128}$/i.test(derivedHex ?? "")
  ) {
    return { iterations, derivedHex };
  }

  if (/^[a-f0-9]{128}$/i.test(hash)) {
    return { iterations: legacyIterations, derivedHex: hash };
  }

  return null;
}

export function needsPasswordRehash(hash: string) {
  const parsed = parseStoredHash(hash);
  return (
    !parsed ||
    parsed.iterations !== currentIterations ||
    !hash.startsWith(`${algorithm}$`)
  );
}

export async function verifyPassword(
  password: string,
  salt: string,
  hash: string,
): Promise<boolean> {
  const parsed = parseStoredHash(hash);
  if (!parsed) return false;

  const actual = await derivePassword(password, salt, parsed.iterations);
  const expected = Buffer.from(parsed.derivedHex, "hex");
  return (
    actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
  );
}
