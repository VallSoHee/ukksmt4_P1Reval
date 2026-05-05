import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET: Ambil user by id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error GET user by id:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data user' },
      { status: 500 }
    );
  }
}

// PUT: Update user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await req.json();
    const { username, email, password, role } = body;

    // Validasi
    if (!username || !email || !role) {
      return NextResponse.json(
        { success: false, message: 'Username, email, dan role harus diisi' },
        { status: 400 }
      );
    }

    // Cek username atau email sudah dipakai user lain
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username atau email sudah digunakan' },
        { status: 400 }
      );
    }

    // Prepare data update
    const updateData: any = {
      username,
      email,
      role,
    };

    // Jika password diisi, hash dan update
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
      data: user,
    });
  } catch (error) {
    console.error('Error PUT user:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate user' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    // Cek user ada
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cegah delete admin terakhir
    const adminCount = await prisma.user.count({
      where: { role: 'admin' },
    });

    if (user.role === 'admin' && adminCount === 1) {
      return NextResponse.json(
        { success: false, message: 'Tidak dapat menghapus admin terakhir' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('Error DELETE user:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}