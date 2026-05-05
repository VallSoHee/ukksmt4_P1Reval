'use client';

import { useEffect, useState } from 'react';
import LayoutWrapper from '@/app/components/LayoutWrapper';

export default function PeminjamDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    aktif: 0,
    riwayat: 0,
    totalAlat: 0,
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Mock data
    setStats({
      aktif: 2,
      riwayat: 5,
      totalAlat: 45,
    });
  }, []);

  const statCards = [
    { title: 'Peminjaman Aktif', value: stats.aktif, color: 'bg-blue-500' },
    { title: 'Riwayat Peminjaman', value: stats.riwayat, color: 'bg-green-500' },
    { title: 'Total Alat Tersedia', value: stats.totalAlat, color: 'bg-purple-500' },
  ];

  const recentLoans = [
    { id: 1, alat: 'Proyektor Epson', tanggal: '2026-04-25', status: 'Selesai' },
    { id: 2, alat: 'Laptop Dell', tanggal: '2026-04-20', status: 'Selesai' },
  ];

  return (
    <LayoutWrapper>
      <div>
        <h1 className="text-2xl font-bold mb-2">Halo, {user?.username}!</h1>
        <p className="text-gray-500 mb-6">Selamat datang di sistem peminjaman alat</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full text-white text-xl`}>
                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition">
                 Ajukan Peminjaman Alat
              </button>
              <button className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition">
                 Kembalikan Alat
              </button>
              <button className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition">
                Lihat Riwayat
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Peminjaman Terakhir</h2>
            {recentLoans.length === 0 ? (
              <p className="text-gray-500">Belum ada riwayat peminjaman</p>
            ) : (
              <div className="space-y-3">
                {recentLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{loan.alat}</p>
                      <p className="text-sm text-gray-500">{loan.tanggal}</p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      loan.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}