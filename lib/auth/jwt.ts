import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "default-access-secret-key-oceanstore";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "default-refresh-secret-key-oceanstore";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
    issuer: "oceanstore",
    audience: "oceanstore-client",
  });
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
    issuer: "oceanstore",
    audience: "oceanstore-refresh",
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET, {
    issuer: "oceanstore",
    audience: "oceanstore-client",
  }) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, REFRESH_SECRET, {
    issuer: "oceanstore",
    audience: "oceanstore-refresh",
  }) as JWTPayload;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
