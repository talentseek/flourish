import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkAdminRole } from '@/lib/rbac';
import { computeGapAnalysis } from '@/lib/gap-analysis';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: headers()
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Assuming the session object contains a userId or similar identifier
    // that can be used for role checking. Adjust 'session.userId' if needed.
    const userId = session.user.id;

    if (!userId || !(await checkAdminRole(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

