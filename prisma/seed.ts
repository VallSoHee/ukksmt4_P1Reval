import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log('Password hash:', hashedPassword);

  // Hapus data lama (opsional)
  await prisma.user.deleteMany({});
  console.log('Cleared existing users');

  // Buat user baru
  const admin = await prisma.user.create({
    data: {
      username: 'admin1',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('Created admin:', admin.username);

  const petugas = await prisma.user.create({
    data: {
      username: 'petugas1',
      email: 'petugas@example.com',
      password: hashedPassword,
      role: 'petugas',
    },
  });
  console.log('Created petugas:', petugas.username);

  const peminjam = await prisma.user.create({
    data: {
      username: 'peminjam1',
      email: 'peminjam@example.com',
      password: hashedPassword,
      role: 'peminjam',
    },
  });
  console.log('Created peminjam:', peminjam.username);

  console.log('🌱 Seeding finished!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });