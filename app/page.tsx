import { auth } from "@/lib/auth";
import AuthScreen from "@/components/AuthScreen";
import Library from "@/components/Library";
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await auth();
  return session?.user ? (
    <Library email={session.user.email || ""} />
  ) : (
    <AuthScreen registration={process.env.ALLOW_REGISTRATION === "1"} />
  );
}
