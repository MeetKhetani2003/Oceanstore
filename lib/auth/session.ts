import Session from "@/lib/db/models/Session";
import connectDB from "@/lib/db/connect";
import { v4 as uuidv4 } from "uuid";

export async function createSession(opts: {
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ip?: string;
}): Promise<string> {
  await connectDB();
  const sessionId = uuidv4();
  await Session.create({
    userId: opts.userId,
    refreshToken: opts.refreshToken,
    deviceInfo: {
      userAgent: opts.userAgent || "Unknown",
      deviceType: detectDeviceType(opts.userAgent || ""),
    },
    ipAddress: opts.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return sessionId;
}

export async function validateSession(
  refreshToken: string
): Promise<boolean> {
  await connectDB();
  const session = await Session.findOne({
    refreshToken,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).select("+refreshToken");
  return !!session;
}

export async function revokeSession(refreshToken: string): Promise<void> {
  await connectDB();
  await Session.findOneAndUpdate(
    { refreshToken },
    { isRevoked: true }
  );
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await connectDB();
  await Session.updateMany({ userId }, { isRevoked: true });
}

export async function cleanExpiredSessions(): Promise<number> {
  await connectDB();
  const result = await Session.deleteMany({
    $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
  });
  return result.deletedCount;
}

function detectDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
}
