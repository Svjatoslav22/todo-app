const express = require("express");
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  listTasksQuerySchema,
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

module.exports = router;
