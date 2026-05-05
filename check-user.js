const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  // Cari user admin1
  const user = await prisma.user.findUnique({
    where: { username: 'admin1' }
  });

  if (!user) {
    console.log('User admin1 tidak ditemukan!');
    return;
  }

  console.log('=== DATA USER ===');
  console.log('Username:', user.username);
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Password hash:', user.password);
  console.log('Panjang hash:', user.password.length);
  
  // Test verifikasi password
  const testPassword = 'password123';
  const isValid = await bcrypt.compare(testPassword, user.password);
  console.log('Apakah password "password123" valid?', isValid);
  
  // Coba generate hash baru untuk perbandingan
  const newHash = await bcrypt.hash(testPassword, 10);
  console.log('Contoh hash yang benar untuk "password123":', newHash);
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());