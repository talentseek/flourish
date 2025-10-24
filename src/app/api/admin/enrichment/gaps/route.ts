import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkAdminRole } from '@/lib/rbac';
import { computeGapAnalysis } from '@/lib/gap-analysis';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();

  if (!userId || !(await checkAdminRole(userId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const gapAnalysis = await computeGapAnalysis();
    return NextResponse.json(gapAnalysis);
  } catch (error) {
    console.error('Gap analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to compute gap analysis' },
      { status: 500 }
    );
  }
}

