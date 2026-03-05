// src/middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const protectedPaths = ['/dashboard', '/patients', '/waiting-room', '/prescriptions', '/finance', '/settings', '/documents']
  const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path))

  // Doctor-only routes
  const doctorPaths = ['/prescriptions/new', '/documents', '/finance']
  const isDoctorOnly = doctorPaths.some(path => nextUrl.pathname.startsWith(path))

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isDoctorOnly && isLoggedIn && session.user?.role !== 'DOCTOR') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  if (nextUrl.pathname === '/') {
    if (isLoggedIn) return NextResponse.redirect(new URL('/dashboard', nextUrl))
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
