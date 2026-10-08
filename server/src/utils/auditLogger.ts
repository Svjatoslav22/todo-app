import prisma from "../lib/prisma";
import { AuditLogOptions } from "../types";

/**
 * Asynchronously logs system actions to the AuditLog table.
 * Never throws an error that interrupts the user request.
 */
export async function logAudit({
  action,
  details = null,
  userId = null,
  ip = null,
}: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details: typeof details === "object" && details !== null ? JSON.stringify(details) : details,
        userId: userId ? Number(userId) : null,
        ip,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to write audit log:", message);
  }
}
