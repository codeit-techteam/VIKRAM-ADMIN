import { z } from "zod";

export const videoUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Select a category"),
  targetAudience: z.string().min(1, "Select a target audience"),
  placements: z.array(z.string()).min(1, "Select at least one app placement"),
  priorityLevel: z.number().min(1).max(10),
  publishImmediately: z.boolean(),
  scheduledAt: z.string().optional(),
});

export type VideoUploadSchema = z.infer<typeof videoUploadSchema>;
