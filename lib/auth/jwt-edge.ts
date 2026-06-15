import { jwtVerify } from "jose";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "default-access-secret-key-oceanstore";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export async function verifyAccessTokenEdge(token: string): Promise<JWTPayload> {
  const secretKey = new TextEncoder().encode(ACCESS_SECRET);
  const { payload } = await jwtVerify(token, secretKey, {
    issuer: "oceanstore",
    audience: "oceanstore-client",
  });
  return payload as unknown as JWTPayload;
}
