import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkAdminRole } from '@/lib/rbac';
import { getLocationsMissingField } from '@/lib/gap-analysis';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ field: string }> }
) {
  const { userId } = await auth();
  const { field } = await params;

  if (!userId || !(await checkAdminRole(userId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
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

