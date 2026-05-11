import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua pengembalian
export async function GET() {
  try {
    const pengembalian = await prisma.pengembalian.findMany({
      include: {
        peminjaman: {
          include: {
            user: { select: { id: true, username: true, email: true } },
            alat: { select: { id: true, kodeAlat: true, nama: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: pengembalian });
  } catch (error) {
    console.error('Error GET pengembalian:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengembalian' },
      { status: 500 }
    );
  }
}

// POST: Proses pengembalian baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { peminjamanId, kondisi, denda, catatan, diterimaOleh } = body;

    if (!peminjamanId || !diterimaOleh) {
      return NextResponse.json(
        { success: false, message: 'peminjamanId dan diterimaOleh harus diisi' },
        { status: 400 }
      );
    }

    // Cek peminjaman ada dan statusnya 'dipinjam'
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      include: { alat: true },
    });

    if (!peminjaman) {
      return NextResponse.json(
        { success: false, message: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    if (peminjaman.status !== 'dipinjam') {
      return NextResponse.json(
        { success: false, message: 'Hanya peminjaman berstatus "dipinjam" yang bisa diproses pengembaliannya' },
        { status: 400 }
      );
    }

    // Cek belum ada pengembalian untuk peminjaman ini
    const existing = await prisma.pengembalian.findUnique({
      where: { peminjamanId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Pengembalian untuk peminjaman ini sudah ada' },
        { status: 400 }
      );
    }

    // Hitung denda otomatis jika terlambat (Rp 5.000/hari) kecuali denda sudah diisi manual
    let dendaFinal = denda ?? 0;
    if (denda === undefined || denda === null) {
      if (peminjaman.tanggalKembali) {
        const today = new Date();
        const deadline = new Date(peminjaman.tanggalKembali);
        if (today > deadline) {
          const hariTerlambat = Math.ceil(
            (today.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)
          );
          dendaFinal = hariTerlambat * 5000;
        }
      }
    }

    // Buat pengembalian + update status peminjaman + kembalikan stok alat
    const [pengembalian] = await prisma.$transaction([
      prisma.pengembalian.create({
        data: {
          peminjamanId,
          kondisi: kondisi || 'baik',
          denda: dendaFinal,
          catatan: catatan || null,
          diterimaOleh,
        },
      }),
      prisma.peminjaman.update({
        where: { id: peminjamanId },
        data: { status: 'dikembalikan' },
      }),
      prisma.alat.update({
        where: { id: peminjaman.alatId },
        data: {
          stok: { increment: peminjaman.jumlah },
          // Jika kondisi rusak, set status alat ke rusak
          status: kondisi === 'rusak' ? 'rusak' : 'tersedia',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Pengembalian berhasil diproses',
      data: pengembalian,
    });
  } catch (error) {
    console.error('Error POST pengembalian:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pengembalian' },
      { status: 500 }
    );
  }
}
