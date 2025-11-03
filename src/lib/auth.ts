import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function getSessionUser() {
  const { userId } = auth();
  if (!userId) return null;
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string | undefined)?.toUpperCase() || "USER";
  return { id: userId, role };
}

/**
 * Authenticate requests from either Clerk (web) or Vapi (server-to-server)
 * Returns user info if authenticated, null otherwise
 */
export async function authenticateVapiRequest(req: NextRequest): Promise<{ id: string; role: string; source: 'clerk' | 'vapi' } | null> {
  // Check for Vapi API key first (for server-to-server calls)
  // Vapi sends Authorization header with Bearer token
  const authHeader = req.headers.get('authorization');
  const vapiApiKey = authHeader?.replace('Bearer ', '').trim();
  const expectedVapiKey = process.env.VAPI_API_KEY || process.env.VAPI_PRIVATE_KEY;
  
  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth check:', {
      hasAuthHeader: !!authHeader,
      hasApiKey: !!vapiApiKey,
      hasExpectedKey: !!expectedVapiKey,
      keyMatch: vapiApiKey === expectedVapiKey,
    });
  }
  
  if (vapiApiKey && expectedVapiKey && vapiApiKey === expectedVapiKey) {
    // Valid Vapi API key - allow access
    return { id: 'vapi-service', role: 'ADMIN', source: 'vapi' };
  }

  // Fall back to Clerk authentication (for web requests)
  const user = await getSessionUser();
  if (user) {
    return { ...user, source: 'clerk' };
  }

  return null;
}
