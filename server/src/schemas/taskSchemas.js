const { z } = require("zod");

const TASK_STATUSES = ["todo", "in_progress", "done"];
const TASK_PRIORITIES = ["urgent", "high", "medium", "low", "none"];

const subtaskInputSchema = z.object({
  id: z.number().optional(),
  title: z.string().trim().min(1, "Назва підзадачі не може бути порожньою"),
  completed: z.boolean().default(false),
});

const tagInputSchema = z.object({
  name: z.string().trim().min(1, "Назва тегу не може бути порожньою").max(30),
  color: z.string().default("indigo"),
});

const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Назва завдання є обов'язковою" })
    .trim()
    .min(1, "Назва завдання не може бути порожньою")
    .max(255, "Назва завдання не може перевищувати 255 символів"),
  description: z
    .string()
    .trim()
    .max(10000, "Опис не може перевищувати 10000 символів")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  status: z.enum(TASK_STATUSES).default("todo"),
  priority: z.enum(TASK_PRIORITIES).default("none"),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable())
    .transform((val) => (val ? new Date(val) : null)),
  projectId: z.coerce.number().positive().optional().nullable(),
  tags: z.array(z.union([z.string(), tagInputSchema])).optional(),
  subtasks: z.array(subtaskInputSchema).optional(),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Назва завдання не може бути порожньою")
    .max(255)
    .optional(),
  description: z
    .string()
    .trim()
    .max(10000)
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  isArchived: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  order: z.number().int().optional(),
  projectId: z.coerce.number().positive().optional().nullable(),
  tags: z.array(z.union([z.string(), tagInputSchema])).optional(),
  subtasks: z.array(subtaskInputSchema).optional(),
});

const taskIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "ID завдання повинен бути числом" })
    .int("ID завдання повинен бути цілим числом")
    .positive("ID завдання повинен бути більшим за 0"),
});

const subtaskParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  subtaskId: z.coerce.number().int().positive(),
});

const listTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  projectId: z.coerce.number().positive().optional(),
  isArchived: z
    .union([z.boolean(), z.enum(["true", "false", "all"])])
    .optional()
    .transform((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    }),
  isDeleted: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .default(false)
    .transform((val) => val === true || val === "true"),
  search: z.string().trim().optional(),
  tag: z.string().trim().optional(),
});

const batchActionSchema = z.object({
  taskIds: z
    .array(z.number().int().positive())
    .min(1, "Необхідно вказати щонайменше одне завдання"),
  action: z.enum(["status", "priority", "archive", "unarchive", "delete", "restore", "permanentDelete"]),
  value: z.any().optional(),
});

const reorderTasksSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.coerce.number().int().positive(),
        order: z.number().int(),
        status: z.enum(TASK_STATUSES).optional(),
      })
    )
    .min(1, "Потрібно передати щонайменше один елемент для сортування"),
});

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  subtaskParamSchema,
  listTasksQuerySchema,
  batchActionSchema,
  reorderTasksSchema,
};
