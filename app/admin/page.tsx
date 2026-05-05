'use client';

import { useEffect, useState } from 'react';
import LayoutWrapper from '@/app/components/LayoutWrapper';

interface Stats {
  totalUsers: number;
  totalAlat: number;
  totalPeminjaman: number;
  totalPengembalian: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAlat: 0,
    totalPeminjaman: 0,
    totalPengembalian: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    // Fetch data - nanti diintegrasikan dengan API
    setStats({
      totalUsers: 12,
      totalAlat: 45,
      totalPeminjaman: 28,
      totalPengembalian: 22,
    });
    setRecentActivities([
      { id: 1, action: 'User baru mendaftar', time: '5 menit lalu', user: 'john_doe' },
      { id: 2, action: 'Alat baru ditambahkan', time: '1 jam lalu', user: 'admin' },
      { id: 3, action: 'Peminjaman disetujui', time: '2 jam lalu', user: 'petugas1' },
    ]);
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers },
    { title: 'Total Alat', value: stats.totalAlat },
    { title: 'Peminjaman Aktif', value: stats.totalPeminjaman },
    { title: 'Pengembalian', value: stats.totalPengembalian },
  ];

  return (
    <LayoutWrapper>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`} p-3 rounded-full text-white text-xl`}>
                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">Oleh: {activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}