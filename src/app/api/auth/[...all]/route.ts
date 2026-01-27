import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const GET = async (req: Request) => {
    console.log(`[DEBUG] GET ${req.url}`);
    return handlers.GET(req);
}

export const POST = async (req: Request) => {
    console.log(`[DEBUG] POST ${req.url}`);
    return handlers.POST(req);
}
