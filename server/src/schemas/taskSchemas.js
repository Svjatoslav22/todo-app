const { z } = require("zod");

const TASK_STATUSES = ["todo", "in_progress", "done"];

const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Назва завдання є обов'язковою" })
    .trim()
    .min(1, "Назва завдання не може бути порожньою")
    .max(200, "Назва завдання не може перевищувати 200 символів"),
  description: z
    .string()
    .trim()
    .max(2000, "Опис не може перевищувати 2000 символів")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Назва завдання не може бути порожньою")
      .max(200, "Назва завдання не може перевищувати 200 символів")
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Опис не може перевищувати 2000 символів")
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
    status: z
      .enum(TASK_STATUSES, {
        errorMap: () => ({
          message: "Статус повинен бути одним із: todo, in_progress, done",
        }),
      })
      .optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined,
    {
      message: "Необхідно надати хоча б одне поле для оновлення (title, description або status)",
    }
  );

const taskIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "ID завдання повинен бути числом" })
    .int("ID завдання повинен бути цілим числом")
    .positive("ID завдання повинен бути більшим за 0"),
});

const listTasksQuerySchema = z.object({
  status: z
    .enum(TASK_STATUSES, {
      errorMap: () => ({
        message: "Статус повинен бути одним із: todo, in_progress, done",
      }),
    })
    .optional(),
});

module.exports = {
  TASK_STATUSES,
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  listTasksQuerySchema,
};
