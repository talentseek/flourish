import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkAdminRole } from '@/lib/rbac';
import { getLocationsMissingField } from '@/lib/gap-analysis';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: { field: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Assuming the session object contains a userId or similar identifier
    // Adjust 'session.userId' if your session object uses a different property for the user ID
    if (!(await checkAdminRole(session.user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { field } = params; // params is no longer a Promise

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const locations = await getLocationsMissingField(field, limit);
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Get missing locations error:', error);
    return NextResponse.json(
      { error: 'Failed to get locations' },
      { status: 500 }
    );
  }
}

