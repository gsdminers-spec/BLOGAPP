
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

// Hardcoded hash for "Ashmira@143" (SHA-256)
// Generated online for simplicity, or we can compute on fly. 
// For "Ashmira@143":
// roughly: 24707f15436683515468770289d0b074092b774618a82d2360538965f3f37478 (example)
// But for simplicity in this demo, we'll compare string directly OR compute hash.
// Let's do simple string compare for now per user request context (admin tool).
// Ideally: Use bcrypt/argon2.
const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD || 'Ashmira@143';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (password === CORRECT_PASSWORD) {
            await createSession();
            await logActivity('LOGIN', 'System', 'Admin logged in');
            return NextResponse.json({ success: true });
        }

        await logActivity('ERROR', 'System', 'Failed login attempt');
        return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });

    } catch {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
