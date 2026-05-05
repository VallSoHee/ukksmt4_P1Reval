import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aplikasi Peminjaman Alat',
  description: 'Sistem peminjaman alat berbasis Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}