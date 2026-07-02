import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  displayOrder: z
    .number()
    .int("Display order must be a whole number")
    .min(0, "Display order must be 0 or greater"),
  isActive: z.boolean(),
  iconFile: z.instanceof(File).optional(),
  heroImageFile: z.instanceof(File).optional(),
});

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>;
