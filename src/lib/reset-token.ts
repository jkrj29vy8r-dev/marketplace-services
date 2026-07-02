import { createHmac } from "crypto";

// Stateless password-reset tokens: HMAC over userId + expiry + a fragment of the
// current password hash. Changing the password invalidates the token automatically,
// so no DB table is needed.
const SECRET = process.env.NEXTAUTH_SECRET ?? "dev-secret";

function sign(payload: string, hashFragment: string): string {
  return createHmac("sha256", SECRET).update(`${payload}:${hashFragment}`).digest("base64url");
}

export function createResetToken(userId: string, passwordHash: string): string {
  const exp = Date.now() + 60 * 60 * 1000; // 1 hour
  const payload = Buffer.from(`${userId}:${exp}`).toString("base64url");
  return `${payload}.${sign(payload, passwordHash.slice(0, 16))}`;
}

export function verifyResetToken(
  token: string,
  getPasswordHash: (userId: string) => Promise<string | null>,
): Promise<string | null> {
  return (async () => {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    let decoded: string;
    try {
      decoded = Buffer.from(payload, "base64url").toString();
    } catch {
      return null;
    }

    const [userId, expStr] = decoded.split(":");
    if (!userId || !expStr || Number(expStr) < Date.now()) return null;

    const hash = await getPasswordHash(userId);
    if (!hash) return null;

    if (sign(payload, hash.slice(0, 16)) !== signature) return null;
    return userId;
  })();
}
