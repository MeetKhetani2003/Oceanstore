import AuditLog, { IAuditLog } from "@/lib/db/models/AuditLog";
import connectDB from "@/lib/db/connect";

export class AuditRepository {
  static async log(data: Partial<IAuditLog>): Promise<void> {
    await connectDB();
    await AuditLog.create(data).catch((err) => {
      console.error("[AuditLog] Failed to write log:", err);
    });
  }

  static async list(opts: {
    page?: number;
    limit?: number;
    userId?: string;
    resource?: string;
    action?: string;
  }): Promise<{ logs: IAuditLog[]; total: number }> {
    await connectDB();
    const { page = 1, limit = 50, userId, resource, action } = opts;
    const query: Record<string, unknown> = {};
    if (userId) query.userId = userId;
    if (resource) query.resource = resource;
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IAuditLog[]>(),
      AuditLog.countDocuments(query),
    ]);
    return { logs, total };
  }
}
