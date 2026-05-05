const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    { username: 'admin1', email: 'admin@example.com', role: 'admin' },
    { username: 'petugas1', email: 'petugas@example.com', role: 'petugas' },
    { username: 'peminjam1', email: 'peminjam@example.com', role: 'peminjam' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
    console.log(`User ${user.username} berhasil dibuat`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());