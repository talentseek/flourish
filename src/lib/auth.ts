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
 * 
 * TEMPORARY: For demo purposes, allows Vapi requests without auth if no auth header is present
 * This will be tightened up after demo - proper solution is to configure Vapi with API key headers
 */
export async function authenticateVapiRequest(req: NextRequest): Promise<{ id: string; role: string; source: 'clerk' | 'vapi' } | null> {
  // Log all headers for debugging (helps us see what Vapi sends)
  const allHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });
  console.log('Vapi request headers:', JSON.stringify(allHeaders, null, 2));
  
  // Check for Vapi API key first (for server-to-server calls)
  // Vapi sends Authorization header with Bearer token
  const authHeader = req.headers.get('authorization');
  const vapiApiKey = authHeader?.replace('Bearer ', '').trim();
  const expectedVapiKey = process.env.VAPI_API_KEY || process.env.VAPI_PRIVATE_KEY;
  
  console.log('Auth check:', {
    hasAuthHeader: !!authHeader,
    authHeaderValue: authHeader ? `${authHeader.substring(0, 20)}...` : null,
    hasApiKey: !!vapiApiKey,
    hasExpectedKey: !!expectedVapiKey,
    keyMatch: vapiApiKey === expectedVapiKey,
    userAgent: req.headers.get('user-agent'),
  });
  
  if (vapiApiKey && expectedVapiKey && vapiApiKey === expectedVapiKey) {
    // Valid Vapi API key - allow access
    console.log('✅ Authenticated via Vapi API key');
    return { id: 'vapi-service', role: 'ADMIN', source: 'vapi' };
  }

  // Fall back to Clerk authentication (for web requests)
  const user = await getSessionUser();
  if (user) {
    console.log('✅ Authenticated via Clerk');
    return { ...user, source: 'clerk' };
  }

  // TEMPORARY FIX FOR DEMO: Allow Vapi requests without auth
  // Check if this looks like a Vapi request (no auth header, POST to /api/vapi/*)
  const url = req.url;
  const isVapiEndpoint = url.includes('/api/vapi/');
  const method = req.method;
  
  if (isVapiEndpoint && method === 'POST' && !authHeader) {
    console.log('⚠️  TEMPORARY: Allowing Vapi request without auth for demo purposes');
    return { id: 'vapi-service', role: 'ADMIN', source: 'vapi' };
  }

  console.log('❌ Authentication failed');
  return null;
}
