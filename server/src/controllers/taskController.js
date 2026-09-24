const prisma = require("../lib/prisma");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const asyncHandler = require("../utils/asyncHandler");

async function getOwnedTaskOrThrow(id, userId) {
  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: {
      tags: true,
      subtasks: { orderBy: { createdAt: "asc" } },
      project: true,
    },
  });

  if (!task) {
    throw new NotFoundError("Завдання не знайдено");
  }

  return task;
}

const listTasks = asyncHandler(async (req, res) => {
  const { status, priority, projectId, isArchived, isDeleted, search, tag } = req.query;
  const isDeletedBool = isDeleted === "true" || isDeleted === true;
  const where = {
    userId: req.user.id,
    isDeleted: isDeletedBool,
  };

  if (isArchived !== undefined) {
    where.isArchived = isArchived === "true" || isArchived === true;
  }

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (projectId) {
    where.projectId = projectId;
  }

  if (tag) {
    where.tags = {
      some: { name: { equals: tag, mode: "insensitive" } },
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      tags: true,
      subtasks: { orderBy: { createdAt: "asc" } },
      project: true,
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return res.json({ tasks });
});

const getTask = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const task = await getOwnedTaskOrThrow(id, req.user.id);
  return res.json({ task });
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, projectId, tags, subtasks } = req.body;

  // Process tags if provided
  let tagConnectOrCreate = undefined;
  if (Array.isArray(tags) && tags.length > 0) {
    tagConnectOrCreate = tags.map((t) => {
      const tagName = typeof t === "string" ? t.trim() : t.name.trim();
      const tagColor = typeof t === "object" && t.color ? t.color : "indigo";
      return {
        where: { id: -1 }, // fallback for upsert
        create: { name: tagName, color: tagColor, userId: req.user.id },
      };
    });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      status: status || "todo",
      priority: priority || "none",
      dueDate: dueDate || null,
      projectId: projectId || null,
      userId: req.user.id,
      subtasks:
        Array.isArray(subtasks) && subtasks.length > 0
          ? {
              create: subtasks.map((st) => ({
                title: st.title.trim(),
                completed: Boolean(st.completed),
              })),
            }
          : undefined,
    },
    include: {
      tags: true,
      subtasks: { orderBy: { createdAt: "asc" } },
      project: true,
    },
  });

  return res.status(201).json({ task });
});

const updateTask = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await getOwnedTaskOrThrow(id, req.user.id);

  const { title, description, status, priority, dueDate, isArchived, isDeleted, order, projectId, subtasks } =
    req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (isArchived !== undefined) updateData.isArchived = isArchived;
  if (isDeleted !== undefined) {
    updateData.isDeleted = isDeleted;
    updateData.deletedAt = isDeleted ? new Date() : null;
  }
  if (order !== undefined) updateData.order = order;
  if (projectId !== undefined) updateData.projectId = projectId;

  // Handle subtasks replacement/update if provided
  if (Array.isArray(subtasks)) {
    // Delete existing subtasks and re-create them cleanly
    await prisma.subtask.deleteMany({ where: { taskId: id } });
    if (subtasks.length > 0) {
      updateData.subtasks = {
        create: subtasks.map((st) => ({
          title: st.title.trim(),
          completed: Boolean(st.completed),
        })),
      };
    }
  }

  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      tags: true,
      subtasks: { orderBy: { createdAt: "asc" } },
      project: true,
    },
  });

  return res.json({ task: updated });
});

const deleteTask = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const existing = await getOwnedTaskOrThrow(id, req.user.id);

  if (existing.isDeleted) {
    // Already in trash -> permanently delete
    await prisma.task.delete({ where: { id } });
    return res.json({ message: "Завдання остаточно видалено" });
  }

  // Soft delete into trash
  await prisma.task.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return res.json({ message: "Завдання переміщено в корзину" });
});

const restoreTask = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await getOwnedTaskOrThrow(id, req.user.id);

  const restored = await prisma.task.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
    include: {
      tags: true,
      subtasks: { orderBy: { createdAt: "asc" } },
      project: true,
    },
  });

  return res.json({ task: restored, message: "Завдання відновлено" });
});

const batchAction = asyncHandler(async (req, res) => {
  const { taskIds, action, value } = req.body;

  // Verify all tasks belong to user
  const userTasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, userId: req.user.id },
    select: { id: true, isDeleted: true },
  });

  const validIds = userTasks.map((t) => t.id);
  if (validIds.length === 0) {
    throw new BadRequestError("Не знайдено жодного доступного завдання для цієї дії");
  }

  if (action === "status") {
    await prisma.task.updateMany({
      where: { id: { in: validIds } },
      data: { status: value },
    });
  } else if (action === "priority") {
    await prisma.task.updateMany({
      where: { id: { in: validIds } },
      data: { priority: value },
    });
  } else if (action === "archive") {
    await prisma.task.updateMany({
      where: { id: { in: validIds } },
      data: { isArchived: true },
    });
  } else if (action === "unarchive") {
    await prisma.task.updateMany({
      where: { id: { in: validIds } },
      data: { isArchived: false },
    });
  } else if (action === "delete") {
    await prisma.task.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  } else if (action === "restore") {
    await prisma.task.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: false, deletedAt: null },
    });
  } else if (action === "permanentDelete") {
    await prisma.task.deleteMany({
      where: { id: { in: validIds } },
    });
  }

  return res.json({
    message: `Дію успішно застосовано до ${validIds.length} завдань`,
    affectedCount: validIds.length,
  });
});

const toggleSubtask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const subtaskId = Number.parseInt(req.params.subtaskId, 10);

  await getOwnedTaskOrThrow(taskId, req.user.id);

  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, taskId },
  });

  if (!subtask) {
    throw new NotFoundError("Підзадачу не знайдено");
  }

  const updatedSubtask = await prisma.subtask.update({
    where: { id: subtaskId },
    data: { completed: !subtask.completed },
  });

  return res.json({ subtask: updatedSubtask });
});

const reorderTasks = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const ids = items.map((i) => i.id);

  const count = await prisma.task.count({
    where: { id: { in: ids }, userId: req.user.id },
  });

  if (count !== ids.length) {
    throw new BadRequestError("Деякі завдання не належать поточному користувачу");
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.task.update({
        where: { id: item.id },
        data: {
          order: item.order,
          ...(item.status ? { status: item.status } : {}),
        },
      })
    )
  );

  return res.json({ message: "Порядок завдань успішно збережено" });
});

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  batchAction,
  toggleSubtask,
  reorderTasks,
};
