import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
  otpLogin: z.boolean().default(false),
});

export type LoginSchema = z.infer<typeof loginSchema>;
