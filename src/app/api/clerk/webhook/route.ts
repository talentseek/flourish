import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const payload = await req.text();
  const h = headers();
  const svix_id = h.get("svix-id");
  const svix_timestamp = h.get("svix-timestamp");
  const svix_signature = h.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt: any;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const user = evt.data;
    const id = user.id as string;
    const email = (user.email_addresses?.[0]?.email_address || "") as string;
    const role = ((user.public_metadata?.role as string) || "USER").toUpperCase();

    await prisma.user.upsert({
      where: { id },
      update: { email, role: role as any },
      create: { id, email, role: role as any },
    });
  }

  return new Response("ok");
}
