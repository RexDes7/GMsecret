import { z } from "zod";
import { ru } from "@/lib/i18n/ru";

const e = ru.auth.errors;

export const usernameSchema = z
  .string()
  .min(3, e.usernameTooShort)
  .max(32)
  .regex(/^[A-Za-z0-9_-]+$/, e.usernameInvalid);

export const emailSchema = z
  .string()
  .min(1, e.required)
  .email(e.invalidEmail)
  .max(254);

export const passwordSchema = z.string().min(8, e.passwordTooShort).max(128);

export const registerSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: e.passwordsMismatch,
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;
