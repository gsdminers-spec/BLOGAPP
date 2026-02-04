
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Allow public routes
    if (pathname === '/login' || pathname.startsWith('/api/auth')) {
        // If user is already logged in and tries to access login page, redirect to dashboard
        const session = await verifySession();
        if (session && pathname === '/login') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // 2. Check session
    const session = await verifySession();

    // 3. Redirect if not authenticated
    if (!session) {
        const loginUrl = new URL('/login', request.url);
        // Add redirect param if needed
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public images
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
