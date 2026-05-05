import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'rahasia12345gantiinidi');

// Route yang bisa diakses tanpa login
const publicRoutes = ['/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - izinkan akses
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Ambil token dari cookie
  const token = request.cookies.get('token')?.value;

  // Jika tidak ada token, redirect ke login
  if (!token) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // Untuk sekarang, hanya cek ada token atau tidak
  // Validasi token akan dilakukan di masing-masing page/API
  return NextResponse.next();
}

// Konfigurasi route mana saja yang akan diproteksi
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/petugas/:path*',
    '/api/petugas/:path*',
    '/peminjam/:path*',
    '/api/peminjam/:path*',
  ],
};