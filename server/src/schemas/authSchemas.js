const { z } = require("zod");

const registerSchema = z.object({
  email: z
    .string({ required_error: "Email є обов'язковим" })
    .trim()
    .toLowerCase()
    .email("Некоректний формат email"),
  password: z
    .string({ required_error: "Пароль є обов'язковим" })
    .min(6, "Пароль повинен містити щонайменше 6 символів")
    .max(100, "Пароль не може бути довшим за 100 символів"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email є обов'язковим" })
    .trim()
    .toLowerCase()
    .email("Некоректний формат email"),
  password: z
    .string({ required_error: "Пароль є обов'язковим" })
    .min(1, "Пароль є обов'язковим"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
