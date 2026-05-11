'use client';

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/app/components/LayoutWrapper';
import PengembalianModal from '@/app/components/PengembalianModal';

interface Pengembalian {
  id: number;
  peminjamanId: number;
  tanggalKembali: string;
  kondisi: string;
  denda: number;
  catatan: string | null;
  diterimaOleh: number;
  createdAt: string;
  peminjaman: {
    id: number;
    kodePeminjaman: string;
    jumlah: number;
    tanggalKembali: string | null;
    status: string;
    user: { id: number; username: string; email: string };
    alat: { id: number; kodeAlat: string; nama: string };
  };
}

interface PeminjamanDipinjam {
  id: number;
  kodePeminjaman: string;
  jumlah: number;
  tanggalKembali: string | null;
  user: { username: string };
  alat: { kodeAlat: string; nama: string };
}

const KONDISI_CONFIG: Record<string, { label: string; color: string }> = {
  baik:   { label: 'Baik',        color: 'bg-green-100 text-green-700' },
  kurang: { label: 'Kurang Baik', color: 'bg-yellow-100 text-yellow-700' },
  rusak:  { label: 'Rusak',       color: 'bg-red-100 text-red-700' },
};

export default function PengembalianPage() {
  const [pengembalian, setPengembalian] = useState<Pengembalian[]>([]);
  const [peminjamanDipinjam, setPeminjamanDipinjam] = useState<PeminjamanDipinjam[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPengembalian, setSelectedPengembalian] = useState<Pengembalian | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [detailModal, setDetailModal] = useState<Pengembalian | null>(null);
  const [filterKondisi, setFilterKondisi] = useState<string>('semua');
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserId(user.id || 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pengRes, pjmRes] = await Promise.all([
        fetch('/api/admin/pengembalian', { headers: getHeaders() }),
        fetch('/api/admin/peminjaman', { headers: getHeaders() }),
      ]);
      const pengResult = await pengRes.json();
      const pjmResult = await pjmRes.json();

      if (pengResult.success) setPengembalian(pengResult.data);

      // Ambil hanya peminjaman berstatus 'dipinjam' untuk dropdown modal
      if (pjmResult.success) {
        const dipinjam = pjmResult.data.filter((p: any) => p.status === 'dipinjam');
        setPeminjamanDipinjam(dipinjam);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    const res = await fetch('/api/admin/pengembalian', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) { fetchData(); alert('Pengembalian berhasil diproses'); }
    else alert(result.message);
  };

  const handleUpdate = async (data: any) => {
    const res = await fetch(`/api/admin/pengembalian/${data.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) { fetchData(); alert('Pengembalian berhasil diupdate'); }
    else alert(result.message);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/pengembalian/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (result.success) { fetchData(); alert('Pengembalian berhasil dibatalkan'); }
    else alert(result.message);
    setDeleteConfirm(null);
  };

  const kondisiBadge = (kondisi: string) => {
    const cfg = KONDISI_CONFIG[kondisi] || { label: kondisi, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  const filtered = filterKondisi === 'semua'
    ? pengembalian
    : pengembalian.filter((p) => p.kondisi === filterKondisi);

  // Summary stats
  const totalDenda = pengembalian.reduce((sum, p) => sum + p.denda, 0);
  const dendaHariIni = pengembalian
    .filter((p) => new Date(p.tanggalKembali).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + p.denda, 0);

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
          <h1 className="text-2xl font-bold">Kelola Pengembalian</h1>
          <button
            onClick={() => { setSelectedPengembalian(null); setModalOpen(true); }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <span>+</span> Proses Pengembalian
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-blue-600">{pengembalian.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Pengembalian</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-green-600">
              {pengembalian.filter((p) => p.kondisi === 'baik').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Kondisi Baik</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-red-600">
              {pengembalian.filter((p) => p.kondisi === 'rusak').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Kondisi Rusak</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xl font-bold text-orange-600">
              Rp {totalDenda.toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Denda</p>
          </div>
        </div>

        {/* Info peminjaman aktif */}
        {peminjamanDipinjam.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
            <span className="font-semibold">⏳ {peminjamanDipinjam.length} peminjaman</span> masih berstatus "dipinjam" menunggu dikembalikan.
          </div>
        )}

        {/* Filter kondisi */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'semua', label: `Semua (${pengembalian.length})` },
            { key: 'baik', label: `Baik (${pengembalian.filter(p => p.kondisi === 'baik').length})` },
            { key: 'kurang', label: `Kurang Baik (${pengembalian.filter(p => p.kondisi === 'kurang').length})` },
            { key: 'rusak', label: `Rusak (${pengembalian.filter(p => p.kondisi === 'rusak').length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterKondisi(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filterKondisi === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Peminjaman</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peminjam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Kembali</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kondisi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denda</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-mono font-medium">
                    {item.peminjaman?.kodePeminjaman || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">{item.peminjaman?.user?.username || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-gray-500">{item.peminjaman?.alat?.kodeAlat}</span>
                    <br />
                    <span>{item.peminjaman?.alat?.nama}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(item.tanggalKembali).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-sm">{kondisiBadge(item.kondisi)}</td>
                  <td className="px-4 py-3 text-sm">
                    {item.denda > 0 ? (
                      <span className="text-red-600 font-semibold">
                        Rp {item.denda.toLocaleString('id-ID')}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setDetailModal(item)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => { setSelectedPengembalian(item); setModalOpen(true); }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Batalkan
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mt-2">
            <p className="text-gray-500">Belum ada data pengembalian</p>
          </div>
        )}
      </div>

      {/* Modal Proses / Edit */}
      <PengembalianModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={selectedPengembalian ? handleUpdate : handleCreate}
        pengembalian={selectedPengembalian}
        peminjamanList={peminjamanDipinjam}
        currentUserId={currentUserId}
        title={selectedPengembalian ? 'Edit Pengembalian' : 'Proses Pengembalian'}
      />

      {/* Modal Detail */}
      {detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detail Pengembalian</h2>
              <button onClick={() => setDetailModal(null)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Kode Peminjaman</span>
                <span className="font-mono font-medium">{detailModal.peminjaman?.kodePeminjaman}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Peminjam</span>
                <span>{detailModal.peminjaman?.user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Alat</span>
                <span>{detailModal.peminjaman?.alat?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Jumlah</span>
                <span>{detailModal.peminjaman?.jumlah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tgl Dikembalikan</span>
                <span>{new Date(detailModal.tanggalKembali).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kondisi</span>
                {kondisiBadge(detailModal.kondisi)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Denda</span>
                <span className={detailModal.denda > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                  {detailModal.denda > 0
                    ? `Rp ${detailModal.denda.toLocaleString('id-ID')}`
                    : 'Tidak ada denda'}
                </span>
              </div>
              {detailModal.catatan && (
                <div>
                  <span className="text-gray-500">Catatan</span>
                  <p className="mt-1 p-2 bg-gray-50 rounded">{detailModal.catatan}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Diproses Pada</span>
                <span>{new Date(detailModal.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
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

      {/* Konfirmasi Batalkan */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Batalkan Pengembalian?</h2>
            <p className="text-gray-600 mb-2">
              Membatalkan pengembalian akan mengembalikan status peminjaman menjadi <strong>"dipinjam"</strong> dan stok alat akan dikurangi kembali.
            </p>
            <p className="text-red-500 text-sm mb-6">Tindakan ini tidak dapat dibatalkan.</p>
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
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
