'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MenuItem {
  title: string;
  href: string;
  icon: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setRole(user.role);
    setUsername(user.username);
  }, []);

  const getMenuItems = (): MenuItem[] => {
    if (role === 'admin') {
      return [
        { title: 'Dashboard', href: '/admin',icon: ''},
        { title: 'Kelola User', href: '/admin/users',icon: '' },
        { title: 'Kelola Alat', href: '/admin/alat',icon: '' },
        { title: 'Kelola Kategori', href: '/admin/kategori',icon: ''},
        { title: 'Kelola Peminjaman', href: '/admin/peminjaman',icon: '' },
        { title: 'Kelola Pengembalian', href: '/admin/pengembalian', icon: '' },
        { title: 'Log Aktivitas', href: '/admin/log-aktivitas', icon: '' },
      ];
    } else if (role === 'petugas') {
      return [
        { title: 'Dashboard', href: '/petugas', icon: '' },
        { title: 'Setujui Peminjaman', href: '/petugas/peminjaman', icon: '' },
        { title: 'Pantau Pengembalian', href: '/petugas/pengembalian', icon: '' },
        { title: 'Cetak Laporan', href: '/petugas/laporan', icon: '' },
        { title: 'Kelola Pelanggaran', href: '/petugas/pelanggaran', icon: '' },
      ];
    } else {
      return [
        { title: 'Dashboard', href: '/peminjam', icon: '' },
        { title: 'Daftar Alat', href: '/peminjam/alat', icon: '' },
        { title: 'Peminjaman Saya', href: '/peminjam/peminjaman', icon: '' },
        { title: 'Kembalikan Alat', href: '/peminjam/pengembalian', icon: '' },
      ];
    }
  };

  const handleLogout = async () => {
    // Panggil API logout
    await fetch('/api/auth/logout', { method: 'POST' });
    
    // Hapus dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Hapus cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Redirect ke login
    router.push('/login');
  };

  const menus = getMenuItems();

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold">Peminjaman Alat</h2>
        <p className="text-sm text-gray-400 mt-2">Login sebagai: {role}</p>
        <p className="text-xs text-gray-500">{username}</p>
      </div>
      
      <nav>
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
              pathname === menu.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span></span>
            <span>{menu.title}</span>
          </Link>
        ))}
      </nav>
      
      <button
        onClick={handleLogout}
        className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition"
      >
        <span></span>
        <span>Logout</span>
      </button>
    </div>
  );
}