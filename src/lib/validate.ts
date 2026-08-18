import { z } from "zod/v4";

const passwordRule = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(100)
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[0-9]/, "Password harus mengandung angka")
  .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter spesial");

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").max(100),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP harus 6 digit")
    .regex(/^\d+$/, "OTP hanya boleh angka"),
});

export const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  email: z.string().email("Email tidak valid"),
  password: passwordRule,
  role: z.enum(["admin", "user"]).default("user"),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email("Email tidak valid").optional(),
  password: passwordRule.optional(),
  role: z.enum(["admin", "user"]).optional(),
  two_factor_enabled: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)]).optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: passwordRule,
});

export const setEmailSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const changeUsernameSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  password: z.string().min(1, "Password wajib diisi"),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.issues.map((i) => i.message).join(", ");
  return { success: false, error: messages };
}