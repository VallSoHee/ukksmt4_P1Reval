import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua kategori
export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: kategori,
    });
  } catch (error) {
    console.error('Error GET kategori:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}

// POST: Buat kategori baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, deskripsi } = body;

    if (!nama) {
      return NextResponse.json(
        { success: false, message: 'Nama kategori harus diisi' },
        { status: 400 }
      );
    }

    // Cek kategori sudah ada
    const existing = await prisma.kategori.findUnique({
      where: { nama },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Kategori sudah ada' },
        { status: 400 }
      );
    }

    const kategori = await prisma.kategori.create({
      data: { nama, deskripsi },
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: kategori,
    });
  } catch (error) {
    console.error('Error POST kategori:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat kategori' },
      { status: 500 }
    );
  }
}