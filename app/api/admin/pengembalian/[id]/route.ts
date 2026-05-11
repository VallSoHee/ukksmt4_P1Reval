import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Detail satu pengembalian
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const pengembalian = await prisma.pengembalian.findUnique({
      where: { id },
      include: {
        peminjaman: {
          include: {
            user: { select: { id: true, username: true, email: true } },
            alat: { select: { id: true, kodeAlat: true, nama: true } },
          },
        },
      },
    });

    if (!pengembalian) {
      return NextResponse.json(
        { success: false, message: 'Pengembalian tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: pengembalian });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}

// PUT: Update data pengembalian (kondisi, denda, catatan)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { kondisi, denda, catatan, diterimaOleh } = body;

    const existing = await prisma.pengembalian.findUnique({
      where: { id },
      include: { peminjaman: { include: { alat: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Pengembalian tidak ditemukan' },
        { status: 404 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.pengembalian.update({
        where: { id },
        data: {
          kondisi: kondisi ?? existing.kondisi,
          denda: denda ?? existing.denda,
          catatan: catatan ?? existing.catatan,
          diterimaOleh: diterimaOleh ?? existing.diterimaOleh,
        },
      });

      // Jika kondisi berubah ke rusak, update status alat
      if (kondisi && kondisi !== existing.kondisi) {
        await tx.alat.update({
          where: { id: existing.peminjaman.alatId },
          data: { status: kondisi === 'rusak' ? 'rusak' : 'tersedia' },
        });
      }

      return result;
    });

    return NextResponse.json({
      success: true,
      message: 'Pengembalian berhasil diupdate',
      data: updated,
    });
  } catch (error) {
    console.error('Error PUT pengembalian:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate pengembalian' },
      { status: 500 }
    );
  }
}

// DELETE: Batalkan pengembalian (rollback status peminjaman & stok)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    const existing = await prisma.pengembalian.findUnique({
      where: { id },
      include: { peminjaman: { include: { alat: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Pengembalian tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      // Hapus pengembalian
      prisma.pengembalian.delete({ where: { id } }),
      // Rollback status peminjaman ke 'dipinjam'
      prisma.peminjaman.update({
        where: { id: existing.peminjamanId },
        data: { status: 'dipinjam' },
      }),
      // Rollback stok alat
      prisma.alat.update({
        where: { id: existing.peminjaman.alatId },
        data: {
          stok: { decrement: existing.peminjaman.jumlah },
          status: 'dipinjam',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Pengembalian berhasil dibatalkan',
    });
  } catch (error) {
    console.error('Error DELETE pengembalian:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membatalkan pengembalian' },
      { status: 500 }
    );
  }
}
