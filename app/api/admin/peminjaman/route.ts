import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua peminjaman
export async function GET() {
  try {
    const peminjaman = await prisma.peminjaman.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        alat: { select: { id: true, kodeAlat: true, nama: true } },
        pengembalian: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: peminjaman });
  } catch (error) {
    console.error('Error GET peminjaman:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data peminjaman' },
      { status: 500 }
    );
  }
}

// POST: Buat peminjaman baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, alatId, jumlah, tanggalKembali, catatan } = body;

    if (!userId || !alatId) {
      return NextResponse.json(
        { success: false, message: 'User dan alat harus dipilih' },
        { status: 400 }
      );
    }

    // Cek stok alat
    const alat = await prisma.alat.findUnique({ where: { id: alatId } });
    if (!alat) {
      return NextResponse.json(
        { success: false, message: 'Alat tidak ditemukan' },
        { status: 404 }
      );
    }
    if (alat.stok < (jumlah || 1)) {
      return NextResponse.json(
        { success: false, message: `Stok tidak cukup. Stok tersedia: ${alat.stok}` },
        { status: 400 }
      );
    }

    // Generate kode peminjaman: PJM-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const lastPjm = await prisma.peminjaman.findFirst({
      where: { kodePeminjaman: { startsWith: `PJM-${dateStr}-` } },
      orderBy: { kodePeminjaman: 'desc' },
    });
    let nextNum = 1;
    if (lastPjm) {
      const parts = lastPjm.kodePeminjaman.split('-');
      nextNum = parseInt(parts[parts.length - 1]) + 1;
    }
    const kodePeminjaman = `PJM-${dateStr}-${String(nextNum).padStart(3, '0')}`;

    const peminjaman = await prisma.peminjaman.create({
      data: {
        kodePeminjaman,
        userId,
        alatId,
        jumlah: jumlah || 1,
        tanggalKembali: tanggalKembali ? new Date(tanggalKembali) : null,
        catatan: catatan || null,
        status: 'menunggu',
      },
      include: {
        user: { select: { id: true, username: true } },
        alat: { select: { id: true, kodeAlat: true, nama: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Peminjaman berhasil dibuat',
      data: peminjaman,
    });
  } catch (error) {
    console.error('Error POST peminjaman:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat peminjaman' },
      { status: 500 }
    );
  }
}
