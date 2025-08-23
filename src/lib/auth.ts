import { auth, currentUser } from "@clerk/nextjs/server";

export async function getSessionUser() {
  const { userId } = auth();
  if (!userId) return null;
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string | undefined)?.toUpperCase() || "USER";
  return { id: userId, role };
}
