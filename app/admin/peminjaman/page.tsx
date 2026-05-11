'use client';

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/app/components/LayoutWrapper';
import PeminjamanModal from '@/app/components/PeminjamanModal';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Alat {
  id: number;
  kodeAlat: string;
  nama: string;
  stok: number;
  status: string;
}

interface Peminjaman {
  id: number;
  kodePeminjaman: string;
  userId: number;
  alatId: number;
  jumlah: number;
  tanggalPinjam: string;
  tanggalKembali: string | null;
  status: string;
  catatan: string | null;
  disetujuiOleh: number | null;
  disetujuiPada: string | null;
  user: { id: number; username: string; email: string };
  alat: { id: number; kodeAlat: string; nama: string };
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  menunggu:     { label: 'Menunggu',     color: 'bg-yellow-100 text-yellow-700' },
  disetujui:    { label: 'Disetujui',    color: 'bg-blue-100 text-blue-700' },
  dipinjam:     { label: 'Dipinjam',     color: 'bg-purple-100 text-purple-700' },
  dikembalikan: { label: 'Dikembalikan', color: 'bg-green-100 text-green-700' },
  ditolak:      { label: 'Ditolak',      color: 'bg-red-100 text-red-700' },
  terlambat:    { label: 'Terlambat',    color: 'bg-orange-100 text-orange-700' },
};

export default function PeminjamanPage() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [alatList, setAlatList] = useState<Alat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<Peminjaman | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [detailModal, setDetailModal] = useState<Peminjaman | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchData = async () => {
    try {
      const [pjmRes, userRes, alatRes] = await Promise.all([
        fetch('/api/admin/peminjaman', { headers: getHeaders() }),
        fetch('/api/admin/users', { headers: getHeaders() }),
        fetch('/api/admin/alat', { headers: getHeaders() }),
      ]);
      const pjmResult = await pjmRes.json();
      const userResult = await userRes.json();
      const alatResult = await alatRes.json();

      if (pjmResult.success) setPeminjaman(pjmResult.data);
      if (userResult.success) setUserList(userResult.data);
      if (alatResult.success) setAlatList(alatResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (data: any) => {
    const res = await fetch('/api/admin/peminjaman', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) { fetchData(); alert('Peminjaman berhasil dibuat'); }
    else alert(result.message);
  };

  const handleUpdate = async (data: any) => {
    const res = await fetch(`/api/admin/peminjaman/${data.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) { fetchData(); alert('Peminjaman berhasil diupdate'); }
    else alert(result.message);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/peminjaman/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (result.success) { fetchData(); alert('Peminjaman berhasil dihapus'); }
    else alert(result.message);
    setDeleteConfirm(null);
  };

  // Ubah status langsung dari tabel
  const handleStatusChange = async (id: number, status: string) => {
    const res = await fetch(`/api/admin/peminjaman/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (result.success) fetchData();
    else alert(result.message);
  };

  const filtered = filterStatus === 'semua'
    ? peminjaman
    : peminjaman.filter((p) => p.status === filterStatus);

  const statusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kelola Peminjaman</h1>
          <button
            onClick={() => { setSelectedPeminjaman(null); setModalOpen(true); }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <span>+</span> Tambah Peminjaman
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = peminjaman.filter((p) => p.status === key).length;
            return (
              <div
                key={key}
                onClick={() => setFilterStatus(key === filterStatus ? 'semua' : key)}
                className={`bg-white rounded-lg shadow p-3 text-center cursor-pointer border-2 transition ${
                  filterStatus === key ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${cfg.color}`}>{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterStatus('semua')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filterStatus === 'semua' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Semua ({peminjaman.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filterStatus === key ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cfg.label} ({peminjaman.filter((p) => p.status === key).length})
            </button>
          ))}
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peminjam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jml</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Pinjam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Kembali</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => {
                const isLate =
                  item.tanggalKembali &&
                  new Date(item.tanggalKembali) < new Date() &&
                  !['dikembalikan', 'ditolak'].includes(item.status);

                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${isLate ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-mono font-medium">{item.kodePeminjaman}</td>
                    <td className="px-4 py-3 text-sm">{item.user?.username || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono text-xs text-gray-500">{item.alat?.kodeAlat}</span>
                      <br />
                      <span>{item.alat?.nama}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{item.jumlah}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(item.tanggalPinjam).toLocaleDateString('id-ID')}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isLate ? 'text-red-600 font-semibold' : ''}`}>
                      {item.tanggalKembali
                        ? new Date(item.tanggalKembali).toLocaleDateString('id-ID')
                        : '-'}
                      {isLate && <span className="ml-1 text-xs">⚠️</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        {/* Tombol aksi cepat sesuai status */}
                        {item.status === 'menunggu' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(item.id, 'disetujui')}
                              className="text-xs text-green-600 hover:text-green-800 font-medium"
                            >
                              ✓ Setujui
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, 'ditolak')}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              ✗ Tolak
                            </button>
                          </>
                        )}
                        {item.status === 'disetujui' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'dipinjam')}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                          >
                            → Dipinjam
                          </button>
                        )}
                        {item.status === 'dipinjam' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'dikembalikan')}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            ↩ Kembalikan
                          </button>
                        )}
                        <button
                          onClick={() => setDetailModal(item)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => { setSelectedPeminjaman(item); setModalOpen(true); }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        {['menunggu', 'ditolak'].includes(item.status) && (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mt-2">
            <p className="text-gray-500">Tidak ada data peminjaman</p>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <PeminjamanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={selectedPeminjaman ? handleUpdate : handleCreate}
        peminjaman={selectedPeminjaman}
        userList={userList}
        alatList={alatList}
        title={selectedPeminjaman ? 'Edit Peminjaman' : 'Tambah Peminjaman Baru'}
      />

      {/* Modal Detail */}
      {detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detail Peminjaman</h2>
              <button onClick={() => setDetailModal(null)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Kode</span>
                <span className="font-mono font-medium">{detailModal.kodePeminjaman}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Peminjam</span>
                <span>{detailModal.user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Alat</span>
                <span>{detailModal.alat?.nama} ({detailModal.alat?.kodeAlat})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Jumlah</span>
                <span>{detailModal.jumlah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tgl Pinjam</span>
                <span>{new Date(detailModal.tanggalPinjam).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tgl Kembali</span>
                <span>{detailModal.tanggalKembali ? new Date(detailModal.tanggalKembali).toLocaleDateString('id-ID') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                {statusBadge(detailModal.status)}
              </div>
              {detailModal.disetujuiPada && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Disetujui Pada</span>
                  <span>{new Date(detailModal.disetujuiPada).toLocaleDateString('id-ID')}</span>
                </div>
              )}
              {detailModal.catatan && (
                <div>
                  <span className="text-gray-500">Catatan</span>
                  <p className="mt-1 p-2 bg-gray-50 rounded">{detailModal.catatan}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setDetailModal(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus peminjaman ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
