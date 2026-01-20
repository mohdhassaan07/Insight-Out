import { getToken } from 'next-auth/jwt'
import { NextResponse, NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;
    if(token && (
        url.pathname.startsWith('/signin') ||
        url.pathname.startsWith('/signup') ||
        url.pathname === '/'
    )){
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
}

export const config = {
    matcher: ['/', '/signin', '/signup', '/dashboard/:path*', '/signout'],
}