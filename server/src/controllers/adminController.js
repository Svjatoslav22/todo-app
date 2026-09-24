const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");
const { logAudit } = require("../utils/auditLogger");
const { signAccessToken } = require("../utils/jwt");

/**
 * GET /api/admin/stats
 * Overview dashboard metrics: total users, total tasks, % done, active 24h, 7d registrations
 */
const getSystemStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalTasks, completedTasks, bannedUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: "done" } }),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

  const completedPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Active in last 24h (users who logged in or created tasks in last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeRecentLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: oneDayAgo },
      userId: { not: null },
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  const active24hUsers = Math.max(activeRecentLogs.length, 1);

  // 7-day registration histogram
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const registrationsByDate = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const count = recentUsers.filter(
      (u) => u.createdAt.toISOString().split("T")[0] === dateStr
    ).length;
    registrationsByDate.push({
      date: dateStr,
      count,
      label: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }

  return res.json({
    stats: {
      totalUsers,
      totalTasks,
      completedTasks,
      completedPercent,
      bannedUsers,
      active24hUsers,
      registrationsByDate,
    },
  });
});

/**
 * GET /api/admin/users
 * Paginated users list with search, filter, and task counts
 */
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const search = req.query.search?.trim();
  const role = req.query.role;
  const status = req.query.status; // "active", "banned"
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  const where = {};

  if (search) {
    where.email = { contains: search, mode: "insensitive" };
  }

  if (role && role !== "all") {
    where.role = role;
  }

  if (status === "banned") {
    where.isBanned = true;
  } else if (status === "active") {
    where.isBanned = false;
  }

  const orderBy = {};
  if (sortBy === "email") {
    orderBy.email = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            projects: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
  ]);

  return res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

/**
 * PATCH /api/admin/users/:id/role
 * Change user role ("admin" | "user")
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    throw new BadRequestError("Неприпустима роль (очікується 'admin' або 'user')");
  }

  if (targetId === req.user.id && role !== "admin") {
    throw new ForbiddenError("Ви не можете зняти права адміністратора з самого себе");
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    throw new NotFoundError("Користувача не знайдено");
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetId },
    data: { role },
    select: { id: true, email: true, role: true, isBanned: true, createdAt: true },
  });

  logAudit({
    action: "ROLE_CHANGE",
    details: `Адміністратор ${req.user.email} змінив роль користувача ${user.email} на "${role}"`,
    userId: req.user.id,
    ip: req.ip,
  });

  return res.json({
    message: `Роль користувача оновлено на ${role}`,
    user: updatedUser,
  });
});

/**
 * PATCH /api/admin/users/:id/ban
 * Toggle ban / unban
 */
const toggleUserBan = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const { isBanned } = req.body;

  if (typeof isBanned !== "boolean") {
    throw new BadRequestError("Параметр isBanned повинен бути булевим значенням");
  }

  if (targetId === req.user.id) {
    throw new ForbiddenError("Ви не можете заблокувати власний обліковий запис");
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    throw new NotFoundError("Користувача не знайдено");
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetId },
    data: { isBanned },
    select: { id: true, email: true, role: true, isBanned: true, createdAt: true },
  });

  logAudit({
    action: isBanned ? "USER_BANNED" : "USER_UNBANNED",
    details: `Адміністратор ${req.user.email} ${isBanned ? "заблокував" : "розблокував"} користувача ${user.email}`,
    userId: req.user.id,
    ip: req.ip,
  });

  return res.json({
    message: isBanned ? "Користувача заблоковано" : "Користувача розблоковано",
    user: updatedUser,
  });
});

/**
 * GET /api/admin/users/:id/tasks
 * Admin inspects a user's tasks (read-only)
 */
const getUserTasks = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new NotFoundError("Користувача не знайдено");
  }

  const tasks = await prisma.task.findMany({
    where: { userId: targetId },
    include: {
      tags: true,
      subtasks: true,
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    user,
    tasks,
  });
});

/**
 * POST /api/admin/users/:id/impersonate
 * Admin logs in as the target user
 */
const impersonateUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  const targetUser = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, email: true, role: true, isBanned: true, createdAt: true },
  });

  if (!targetUser) {
    throw new NotFoundError("Користувача не знайдено");
  }

  if (targetUser.isBanned) {
    throw new ForbiddenError("Неможливо увійти під заблокованим користувачем");
  }

  const impersonationToken = signAccessToken({
    id: targetUser.id,
    role: targetUser.role,
  });

  logAudit({
    action: "ADMIN_IMPERSONATE",
    details: `Адміністратор ${req.user.email} увійшов під користувачем ${targetUser.email}`,
    userId: req.user.id,
    ip: req.ip,
  });

  return res.json({
    message: `Ви успішно переключилися на акаунт ${targetUser.email}`,
    token: impersonationToken,
    accessToken: impersonationToken,
    user: targetUser,
  });
});

/**
 * GET /api/admin/logs
 * View system audit logs
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const [total, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    }),
  ]);

  return res.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

module.exports = {
  getSystemStats,
  listUsers,
  updateUserRole,
  toggleUserBan,
  getUserTasks,
  impersonateUser,
  getAuditLogs,
};
