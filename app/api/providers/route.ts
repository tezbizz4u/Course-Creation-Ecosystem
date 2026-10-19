export async function GET() {
  const available =
    process.env.AI_ENABLED === "1" &&
    !!process.env.GEMINI_API_KEY &&
    !!process.env.AI_MODEL;
  return Response.json({
    providers: [
      {
        id: "gemini",
        capabilities: ["text"],
        available,
        model: available ? process.env.AI_MODEL : null,
      },
    ],
    message: available
      ? "Explicit request approval is required. Provider charges may apply."
      : "Generation is disabled. Configure GEMINI_API_KEY, AI_MODEL and AI_ENABLED securely.",
  });
}
