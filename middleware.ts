import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow: admin, API routes, static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/maintenance'
  ) {
    return NextResponse.next()
  }

  try {
    const res = await fetch(`${req.nextUrl.origin}/api/maintenance`, {
      cache: 'no-store',
    })
    const data = await res.json()

    if (data.maintenance === true) {
      return NextResponse.rewrite(new URL('/maintenance', req.url))
    }
  } catch {
    // If check fails, allow access (fail open)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon).*)'],
}
