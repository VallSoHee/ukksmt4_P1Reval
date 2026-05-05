import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  
  // Hapus cookie
  response.cookies.delete('token');
  
  return response;
}