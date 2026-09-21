const prisma = require("../lib/prisma");

const TASK_STATUSES = ["todo", "in_progress", "done"];

function parseTaskId(rawId) {
  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return id;
}

function normalizeTitle(title) {
  return typeof title === "string" ? title.trim() : "";
}

function normalizeDescription(description) {
  if (description === undefined) {
    return undefined;
  }

  if (description === null) {
    return null;
  }

  if (typeof description !== "string") {
    return undefined;
  }

  const trimmed = description.trim();
  return trimmed.length === 0 ? null : trimmed;
}

async function getOwnedTaskOrError(id, userId, res) {
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return null;
  }

  if (task.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }

  return task;
}

async function listTasks(req, res) {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };

    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({
          message: "Status must be one of: todo, in_progress, done",
        });
      }

      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json({ tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createTask(req, res) {
  try {
    const title = normalizeTitle(req.body?.title);
    const description = normalizeDescription(req.body?.description);

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description === undefined ? undefined : description,
        userId: req.user.id,
      },
    });

    return res.status(201).json({ task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function updateTask(req, res) {
  try {
    const id = parseTaskId(req.params.id);

    if (id == null) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const existing = await getOwnedTaskOrError(id, req.user.id, res);

    if (!existing) {
      return;
    }

    const data = {};

    if (req.body?.title !== undefined) {
      const title = normalizeTitle(req.body.title);

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      data.title = title;
    }

    if (req.body?.description !== undefined) {
      data.description = normalizeDescription(req.body.description) ?? null;
    }

    if (req.body?.status !== undefined) {
      if (!TASK_STATUSES.includes(req.body.status)) {
        return res.status(400).json({
          message: "Status must be one of: todo, in_progress, done",
        });
      }

      data.status = req.body.status;
    }

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    return res.json({ task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteTask(req, res) {
  try {
    const id = parseTaskId(req.params.id);

    if (id == null) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const existing = await getOwnedTaskOrError(id, req.user.id, res);

    if (!existing) {
      return;
    }

    await prisma.task.delete({ where: { id } });

    return res.json({ message: "Task deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
