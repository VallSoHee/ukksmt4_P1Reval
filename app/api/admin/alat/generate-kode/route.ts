import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Generate kode alat otomatis berdasarkan kategori
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kategoriId = parseInt(searchParams.get('kategoriId') || '0');

    if (!kategoriId) {
      return NextResponse.json(
        { success: false, message: 'kategoriId harus diisi' },
        { status: 400 }
      );
    }

    // Ambil data kategori
    const kategori = await prisma.kategori.findUnique({
      where: { id: kategoriId },
    });

    if (!kategori) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Buat prefix 3 huruf dari nama kategori
    const words = kategori.nama.trim().split(/\s+/);
    let prefix: string;
    if (words.length >= 3) {
      prefix = words.slice(0, 3).map((w: string) => w[0]).join('').toUpperCase();
    } else if (words.length === 2) {
      prefix = (words[0].slice(0, 2) + words[1][0]).toUpperCase();
    } else {
      prefix = words[0].slice(0, 3).toUpperCase();
    }

    // Cari kode terakhir dengan prefix yang sama
    const lastAlat = await prisma.alat.findFirst({
      where: {
        kodeAlat: {
          startsWith: `${prefix}-`,
        },
      },
      orderBy: { kodeAlat: 'desc' },
    });

    let nextNumber = 1;
    if (lastAlat) {
      const parts = lastAlat.kodeAlat.split('-');
      const lastNum = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    const kodeAlat = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

    return NextResponse.json({
      success: true,
      kodeAlat,
      prefix,
      nextNumber,
    });
  } catch (error) {
    console.error('Error generate kode alat:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal generate kode alat' },
      { status: 500 }
    );
  }
}
