
import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST() {
    await logActivity('LOGIN', 'System', 'Admin logged out');
    await deleteSession();
    return NextResponse.json({ success: true });
}
