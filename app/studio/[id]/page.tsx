import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { courseFor } from "@/lib/courses";
import Studio from "@/components/Studio";
import { HTTPError } from "@/lib/http";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  try {
    const course = await courseFor(session.user.id, id);
    return (
      <Studio
        initial={JSON.parse(JSON.stringify(course))}
        email={session.user.email || ""}
      />
    );
  } catch (e) {
    if (e instanceof HTTPError && e.status === 404) notFound();
    throw e;
  }
}
