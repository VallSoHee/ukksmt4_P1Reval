import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil alat by id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alatId = parseInt(id);

    const alat = await prisma.alat.findUnique({
      where: { id: alatId },
      include: {
        kategori: true,
      },
    });

    if (!alat) {
      return NextResponse.json(
        { success: false, message: 'Alat tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: alat,
    });
  } catch (error) {
    console.error('Error GET alat by id:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data alat' },
      { status: 500 }
    );
  }
}

// PUT: Update alat
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alatId = parseInt(id);
    const body = await req.json();
    const { kodeAlat, nama, deskripsi, stok, status, kategoriId } = body;

    if (!kodeAlat || !nama || !kategoriId) {
      return NextResponse.json(
        { success: false, message: 'Kode alat, nama, dan kategori harus diisi' },
        { status: 400 }
      );
    }

    // Cek kode alat sudah dipakai alat lain
    const existing = await prisma.alat.findFirst({
      where: {
        kodeAlat,
        NOT: { id: alatId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Kode alat sudah digunakan' },
        { status: 400 }
      );
    }

    const alat = await prisma.alat.update({
      where: { id: alatId },
      data: {
        kodeAlat,
        nama,
        deskripsi,
        stok,
        status,
        kategoriId,
      },
      include: {
        kategori: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Alat berhasil diupdate',
      data: alat,
    });
  } catch (error) {
    console.error('Error PUT alat:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate alat' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus alat
// DELETE: Hapus alat (sederhana, tanpa cek peminjaman)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alatId = parseInt(id);

    await prisma.alat.delete({
      where: { id: alatId },
    });

    return NextResponse.json({
      success: true,
      message: 'Alat berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error DELETE alat:', error);
    
    // Jika error karena foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, message: 'Tidak dapat menghapus alat karena sedang digunakan dalam peminjaman' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus alat' },
      { status: 500 }
    );
  }
}