import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua alat (include kategori)
export async function GET() {
  try {
    const alat = await prisma.alat.findMany({
      include: {
        kategori: {
          select: { id: true, nama: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: alat,
    });
  } catch (error) {
    console.error('Error GET alat:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data alat' },
      { status: 500 }
    );
  }
}

// POST: Buat alat baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kodeAlat, nama, deskripsi, stok, status, kategoriId } = body;

    // Validasi
    if (!kodeAlat || !nama || !kategoriId) {
      return NextResponse.json(
        { success: false, message: 'Kode alat, nama, dan kategori harus diisi' },
        { status: 400 }
      );
    }

    // Cek kode alat sudah ada
    const existing = await prisma.alat.findUnique({
      where: { kodeAlat },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Kode alat sudah digunakan' },
        { status: 400 }
      );
    }

    const alat = await prisma.alat.create({
      data: {
        kodeAlat,
        nama,
        deskripsi,
        stok: stok || 1,
        status: status || 'tersedia',
        kategoriId,
      },
      include: {
        kategori: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Alat berhasil dibuat',
      data: alat,
    });
  } catch (error) {
    console.error('Error POST alat:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat alat' },
      { status: 500 }
    );
  }
}