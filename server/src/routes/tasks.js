const express = require("express");
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  subtaskParamSchema,
  listTasksQuerySchema,
  batchActionSchema,
} = require("../schemas/taskSchemas");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  validate({ query: listTasksQuerySchema }),
  taskController.listTasks
);

router.post(
  "/",
  validate({ body: createTaskSchema }),
  taskController.createTask
);

router.post(
  "/batch",
  validate({ body: batchActionSchema }),
  taskController.batchAction
);

router.get(
  "/:id",
  validate({ params: taskIdParamSchema }),
  taskController.getTask
);

router.put(
  "/:id",
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  taskController.updateTask
);

router.delete(
  "/:id",
  validate({ params: taskIdParamSchema }),
  taskController.deleteTask
);

router.post(
  "/:id/restore",
  validate({ params: taskIdParamSchema }),
  taskController.restoreTask
);

router.post(
  "/:id/subtasks/:subtaskId/toggle",
  validate({ params: subtaskParamSchema }),
  taskController.toggleSubtask
);

module.exports = router;
