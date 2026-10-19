import { z } from "zod";
export const courseBriefSchema = z.object({
  audience: z
    .literal("Indian AYUSH practitioners")
    .default("Indian AYUSH practitioners"),
  language: z.string().trim().min(1).max(100).default("English (India)"),
  deliverables: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .default("High-quality editable PowerPoint presentation"),
  vision: z.string().trim().max(20000).default(""),
  objectives: z.string().trim().max(12000).default(""),
  sourceNotes: z.string().trim().max(24000).default(""),
  design: z.string().trim().max(12000).default(""),
  constraints: z.string().trim().max(10000).default(""),
  references: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(500),
        url: z
          .string()
          .url()
          .max(2000)
          .refine(
            (v) => ["https:", "http:"].includes(new URL(v).protocol),
            "Use an HTTP(S) reference URL",
          ),
      }),
    )
    .max(50)
    .default([]),
});
export type CourseBrief = z.infer<typeof courseBriefSchema>;
export const newCourseBrief = (): CourseBrief => courseBriefSchema.parse({});
export const briefQuestions = [
  {
    key: "vision",
    question: "Describe what you want to create, in your own words.",
    hint: "For example: an in-depth CDEM lesson explaining diabetes fundamentals through clear diagrams and clinical teaching cases.",
  },
  {
    key: "objectives",
    question:
      "What should the practitioners understand or be able to do after this lesson?",
    hint: "Write your learning goals in plain language. We will keep them with the course.",
  },
  {
    key: "sourceNotes",
    question:
      "What sources, notes or existing materials should guide this lesson?",
    hint: "Add source names, links, notes, or references to your existing documents. These are starting materials; their accuracy has not yet been verified.",
  },
  {
    key: "design",
    question: "How should the presentation look, and what should it include?",
    hint: "Describe the visual style, diagrams, cases, tables, desired depth, or any new ideas. No template selection is required.",
  },
  {
    key: "constraints",
    question: "Are there any other requirements or limits?",
    hint: "For example: lesson duration, slide count, terminology, exclusions, accessibility, or delivery requirements. You can leave this answer blank.",
  },
] as const;
export function productionOutline(brief: CourseBrief) {
  return [
    {
      id: "brief",
      title: "Course requirements",
      status: brief.vision && brief.objectives ? "captured" : "needs_input",
      detail: "Your saved requirements and learning objectives.",
    },
    {
      id: "research",
      title: "Research and verify sources",
      status: "pending",
      detail:
        brief.sourceNotes || brief.references.length
          ? "Starting materials recorded; source reliability and clinical claims still need verification."
          : "Reliable sources still need to be gathered and verified.",
    },
    {
      id: "structure",
      title: "Structure the lesson",
      status: "pending",
      detail: "Organize content and examples around the learning objectives.",
    },
    {
      id: "design",
      title: "Create content and visual designs",
      status: "pending",
      detail:
        "Produce editable slides and relevant diagrams, tables and visuals.",
    },
    {
      id: "quality",
      title: "Check the presentation",
      status: "pending",
      detail:
        "Review factual support, instructional alignment, readability and layout.",
    },
    {
      id: "export",
      title: "Export deliverables",
      status: "pending",
      detail:
        "PowerPoint export is available for saved slides. A finished lesson still needs to be produced and reviewed.",
    },
  ] as const;
}
