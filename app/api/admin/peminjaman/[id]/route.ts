import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Detail satu peminjaman
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, email: true } },
        alat: { select: { id: true, kodeAlat: true, nama: true, stok: true } },
        pengembalian: true,
      },
    });

    if (!peminjaman) {
      return NextResponse.json(
        { success: false, message: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: peminjaman });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}

// PUT: Update status / data peminjaman
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { status, tanggalKembali, catatan, disetujuiOleh } = body;

    const existing = await prisma.peminjaman.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    // Jika status diubah ke 'disetujui', kurangi stok alat
    if (status === 'disetujui' && existing.status !== 'disetujui') {
      const alat = await prisma.alat.findUnique({ where: { id: existing.alatId } });
      if (alat && alat.stok < existing.jumlah) {
        return NextResponse.json(
          { success: false, message: `Stok tidak cukup. Tersedia: ${alat.stok}` },
          { status: 400 }
        );
      }
      await prisma.alat.update({
        where: { id: existing.alatId },
        data: {
          stok: { decrement: existing.jumlah },
          status: 'dipinjam',
        },
      });
    }

    // Jika status diubah ke 'ditolak' / 'dikembalikan', kembalikan stok
    if (
      (status === 'ditolak' || status === 'dikembalikan') &&
      existing.status === 'disetujui'
    ) {
      await prisma.alat.update({
        where: { id: existing.alatId },
        data: {
          stok: { increment: existing.jumlah },
          status: 'tersedia',
        },
      });
    }

    const updated = await prisma.peminjaman.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        tanggalKembali: tanggalKembali ? new Date(tanggalKembali) : existing.tanggalKembali,
        catatan: catatan ?? existing.catatan,
        disetujuiOleh: disetujuiOleh ?? existing.disetujuiOleh,
        disetujuiPada:
          status === 'disetujui' && existing.status !== 'disetujui'
            ? new Date()
            : existing.disetujuiPada,
      },
      include: {
        user: { select: { id: true, username: true } },
        alat: { select: { id: true, kodeAlat: true, nama: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Peminjaman berhasil diupdate',
      data: updated,
    });
  } catch (error) {
    console.error('Error PUT peminjaman:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate peminjaman' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus peminjaman (hanya yang masih 'menunggu')
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    const existing = await prisma.peminjaman.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!['menunggu', 'ditolak'].includes(existing.status)) {
      return NextResponse.json(
        { success: false, message: 'Hanya peminjaman berstatus "menunggu" atau "ditolak" yang bisa dihapus' },
        { status: 400 }
      );
    }

    await prisma.peminjaman.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Peminjaman berhasil dihapus',
    });
  } catch (error) {
    console.error('Error DELETE peminjaman:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus peminjaman' },
      { status: 500 }
    );
  }
}
