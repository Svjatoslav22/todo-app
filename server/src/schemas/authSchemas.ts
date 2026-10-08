import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ error: "Email є обов'язковим" })
    .trim()
    .toLowerCase()
    .email("Некоректний формат email"),
  password: z
    .string({ error: "Пароль є обов'язковим" })
    .min(6, "Пароль повинен містити щонайменше 6 символів")
    .max(100, "Пароль не може бути довшим за 100 символів"),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email є обов'язковим" })
    .trim()
    .toLowerCase()
    .email("Некоректний формат email"),
  password: z
    .string({ error: "Пароль є обов'язковим" })
    .min(1, "Пароль є обов'язковим"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
