import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil kategori by id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kategoriId = parseInt(id);

    const kategori = await prisma.kategori.findUnique({
      where: { id: kategoriId },
    });

    if (!kategori) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kategori,
    });
  } catch (error) {
    console.error('Error GET kategori by id:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}

// PUT: Update kategori
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kategoriId = parseInt(id);
    const body = await req.json();
    const { nama, deskripsi } = body;

    if (!nama) {
      return NextResponse.json(
        { success: false, message: 'Nama kategori harus diisi' },
        { status: 400 }
      );
    }

    // Cek nama sudah dipakai kategori lain
    const existing = await prisma.kategori.findFirst({
      where: {
        nama,
        NOT: { id: kategoriId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Nama kategori sudah digunakan' },
        { status: 400 }
      );
    }

    const kategori = await prisma.kategori.update({
      where: { id: kategoriId },
      data: { nama, deskripsi },
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: kategori,
    });
  } catch (error) {
    console.error('Error PUT kategori:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate kategori' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus kategori
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kategoriId = parseInt(id);

    // Cek apakah kategori memiliki alat
    const alatCount = await prisma.alat.count({
      where: { kategoriId },
    });

    if (alatCount > 0) {
      return NextResponse.json(
        { success: false, message: `Tidak dapat menghapus kategori yang masih memiliki ${alatCount} alat` },
        { status: 400 }
      );
    }

    await prisma.kategori.delete({
      where: { id: kategoriId },
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
  } catch (error) {
    console.error('Error DELETE kategori:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}