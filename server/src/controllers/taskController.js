const prisma = require("../lib/prisma");
const { NotFoundError } = require("../utils/errors");
const asyncHandler = require("../utils/asyncHandler");

async function getOwnedTaskOrThrow(id, userId) {
  const task = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!task) {
    throw new NotFoundError("Завдання не знайдено");
  }

  return task;
}

const listTasks = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = { userId: req.user.id };

  if (status) {
    where.status = status;
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return res.json({ tasks });
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      userId: req.user.id,
    },
  });

  return res.status(201).json({ task });
});

const updateTask = asyncHandler(async (req, res) => {
  const id = req.params.id;

  await getOwnedTaskOrThrow(id, req.user.id);

  const task = await prisma.task.update({
    where: { id },
    data: req.body,
  });

  return res.json({ task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const id = req.params.id;

  await getOwnedTaskOrThrow(id, req.user.id);

  await prisma.task.delete({ where: { id } });

  return res.json({ message: "Завдання успішно видалено" });
});

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
};
