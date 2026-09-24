const prisma = require("../lib/prisma");

/**
 * Asynchronously logs system actions to the AuditLog table.
 * Never throws an error that interrupts the user request.
 */
async function logAudit({ action, details = null, userId = null, ip = null }) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details,
        userId: userId ? Number(userId) : null,
        ip,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
}

module.exports = {
  logAudit,
};
