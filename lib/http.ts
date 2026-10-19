import { auth } from "./auth";
export class HTTPError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function owner() {
  const session = await auth();
  if (!session?.user?.id) throw new HTTPError(401, "Sign in to continue.");
  return session.user.id;
}
export function sameOrigin(request: Request) {
  const expected = new URL(process.env.AUTH_URL || request.url).origin;
  if (request.headers.get("origin") !== expected)
    throw new HTTPError(403, "Request origin is not allowed.");
}
export async function body(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 2_000_000)
    throw new HTTPError(413, "Request is too large.");
  const text = await request.text();
  if (Buffer.byteLength(text) > 2_000_000)
    throw new HTTPError(413, "Request is too large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new HTTPError(400, "Invalid JSON.");
  }
}
export function failure(e: unknown) {
  if (e instanceof HTTPError)
    return Response.json({ error: e.message }, { status: e.status });
  if (e instanceof Error && e.name === "ZodError")
    return Response.json(
      { error: "Please check the supplied fields." },
      { status: 400 },
    );
  console.error(
    "Request failed:",
    e instanceof Error ? e.name : "UnknownError",
  );
  return Response.json(
    { error: "The request could not be completed." },
    { status: 500 },
  );
}
