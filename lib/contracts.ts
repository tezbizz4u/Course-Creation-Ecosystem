import { z } from "zod";
export const elementSchema = z
  .object({
    id: z.string().uuid(),
    type: z.enum(["text", "shape", "image"]),
    x: z.number().min(-1920).max(1920),
    y: z.number().min(-1080).max(1080),
    width: z.number().min(10).max(1920),
    height: z.number().min(10).max(1080),
    rotation: z.number().min(-360).max(360),
    text: z.string().max(10000).default(""),
    fill: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    fontSize: z.number().min(10).max(200),
    assetId: z.string().uuid().optional(),
  })
  .refine((o) => o.type !== "image" || !!o.assetId, {
    message: "Image asset is required",
  });
export const documentSchema = z
  .object({
    schemaVersion: z.literal(1),
    slides: z
      .array(
        z.object({
          id: z.string().uuid(),
          title: z.string().min(1).max(200),
          background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          objects: z.array(elementSchema).max(100),
        }),
      )
      .min(1)
      .max(50),
  })
  .superRefine((d, ctx) => {
    const ids = d.slides.flatMap((s) => [s.id, ...s.objects.map((o) => o.id)]);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: "custom", message: "Object IDs must be unique" });
  });
export type SlideDocument = z.infer<typeof documentSchema>;
export type SlideElement = SlideDocument["slides"][number]["objects"][number];
export const createCourseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  audience: z.string().trim().max(500),
  projectTitle: z.string().trim().min(1).max(200),
});
