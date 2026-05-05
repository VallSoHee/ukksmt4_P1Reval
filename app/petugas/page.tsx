'use client';

import { useState } from 'react';
import LayoutWrapper from '@/app/components/LayoutWrapper';

export default function PetugasDashboard() {
  const [pendingLoans] = useState([
    { id: 1, peminjam: 'Budi Santoso', alat: 'Proyektor', tanggal: '2026-04-28', status: 'pending' },
    { id: 2, peminjam: 'Siti Aminah', alat: 'Laptop', tanggal: '2026-04-28', status: 'pending' },
  ]);

  const [todayReturns] = useState([
    { id: 1, peminjam: 'Andi Wijaya', alat: 'Kamera', tanggal: '2026-04-28', status: 'belum' },
  ]);

  const stats = [
    { title: 'Peminjaman Pending', value: pendingLoans.length,  color: 'bg-orange-500' },
    { title: 'Pengembalian Hari Ini', value: todayReturns.length, color: 'bg-blue-500' },
    { title: 'Total Pelanggaran', value: 3,  color: 'bg-red-500' },
    { title: 'Laporan Bulan Ini', value: 5, color: 'bg-green-500' },
  ];

  return (
    <LayoutWrapper>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard Petugas</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        {/* Pending Loans */}
        <div className="grid grid-cols  -1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Peminjaman Menunggu Persetujuan</h2>
            {pendingLoans.length === 0 ? (
              <p className="text-gray-500">Tidak ada peminjaman menunggu</p>
            ) : (
              <div className="space-y-3">
                {pendingLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{loan.peminjam}</p>
                      <p className="text-sm text-gray-500">{loan.alat} - {loan.tanggal}</p>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                      Setujui
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today Returns */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Pengembalian Hari Ini</h2>
            {todayReturns.length === 0 ? (
              <p className="text-gray-500">Tidak ada pengembalian hari ini</p>
            ) : (
              <div className="space-y-3">
                {todayReturns.map((ret) => (
                  <div key={ret.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{ret.peminjam}</p>
                      <p className="text-sm text-gray-500">{ret.alat}</p>
                    </div>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                      Proses
                    </button>
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