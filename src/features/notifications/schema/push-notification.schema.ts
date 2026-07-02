import { z } from "zod";

export const pushNotificationSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(50, "Title must be 50 characters or less"),
    message: z
      .string()
      .min(1, "Message is required")
      .max(150, "Message must be 150 characters or less"),
    imageUrl: z.string().optional(),
    audienceType: z.enum(["all", "city_hub", "segment", "custom_list"]),
    audienceTargets: z.array(z.string()).optional(),
    deepLinkTarget: z.enum([
      "home",
      "product",
      "offer",
      "category",
      "custom_url",
    ]),
    deepLinkValue: z.string().optional(),
    deliveryMode: z.enum(["now", "scheduled"]),
    scheduledAt: z.string().optional(),
  })
  .refine(
    (data) =>
      data.deliveryMode !== "scheduled" ||
      Boolean(data.scheduledAt && data.scheduledAt.length > 0),
    {
      message: "Scheduled date and time is required",
      path: ["scheduledAt"],
    },
  )
  .refine(
    (data) =>
      data.deepLinkTarget !== "custom_url" ||
      Boolean(data.deepLinkValue && data.deepLinkValue.length > 0),
    {
      message: "Custom URL is required",
      path: ["deepLinkValue"],
    },
  );

export type PushNotificationSchema = z.infer<typeof pushNotificationSchema>;
