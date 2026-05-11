'use client';

import { useState, useEffect } from 'react';

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
  id?: number;
  userId: number;
  alatId: number;
  jumlah: number;
  tanggalKembali: string;
  catatan: string;
  status?: string;
}

interface PeminjamanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Peminjaman) => void;
  peminjaman: any | null;
  userList: User[];
  alatList: Alat[];
  title: string;
}

export default function PeminjamanModal({
  isOpen,
  onClose,
  onSave,
  peminjaman,
  userList,
  alatList,
  title,
}: PeminjamanModalProps) {
  const [formData, setFormData] = useState<Peminjaman>({
    userId: 0,
    alatId: 0,
    jumlah: 1,
    tanggalKembali: '',
    catatan: '',
  });
  const [loading, setLoading] = useState(false);

  const isEditMode = !!(peminjaman && peminjaman.id);

  // Alat yang tersedia (stok > 0 dan status tersedia), atau alat yang sedang dipilih
  const availableAlat = alatList.filter(
    (a) => a.status === 'tersedia' || a.id === peminjaman?.alatId
  );

  const selectedAlat = alatList.find((a) => a.id === formData.alatId);

  useEffect(() => {
    if (peminjaman && peminjaman.id) {
      setFormData({
        id: peminjaman.id,
        userId: peminjaman.userId,
        alatId: peminjaman.alatId,
        jumlah: peminjaman.jumlah,
        tanggalKembali: peminjaman.tanggalKembali
          ? peminjaman.tanggalKembali.slice(0, 10)
          : '',
        catatan: peminjaman.catatan || '',
        status: peminjaman.status,
      });
    } else {
      setFormData({
        userId: 0,
        alatId: 0,
        jumlah: 1,
        tanggalKembali: '',
        catatan: '',
      });
    }
  }, [peminjaman, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.userId === 0) { alert('Pilih peminjam terlebih dahulu'); return; }
    if (formData.alatId === 0) { alert('Pilih alat terlebih dahulu'); return; }
    if (!formData.tanggalKembali) { alert('Tanggal kembali harus diisi'); return; }
    if (selectedAlat && formData.jumlah > selectedAlat.stok) {
      alert(`Jumlah melebihi stok tersedia (${selectedAlat.stok})`);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Tanggal minimum = hari ini
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl" type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Peminjam */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Peminjam *</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || isEditMode}
            >
              <option value={0}>Pilih Peminjam</option>
              {userList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} — {u.email}
                </option>
              ))}
            </select>
          </div>

          {/* Alat */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Alat *</label>
            <select
              value={formData.alatId}
              onChange={(e) => setFormData({ ...formData, alatId: parseInt(e.target.value), jumlah: 1 })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || isEditMode}
            >
              <option value={0}>Pilih Alat</option>
              {availableAlat.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.kodeAlat}] {a.nama} — Stok: {a.stok}
                </option>
              ))}
            </select>
            {selectedAlat && (
              <p className="text-xs text-gray-500 mt-1">Stok tersedia: {selectedAlat.stok}</p>
            )}
          </div>

          {/* Jumlah */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Jumlah *</label>
            <input
              type="number"
              value={formData.jumlah}
              onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={1}
              max={selectedAlat?.stok || 99}
              required
              disabled={loading}
            />
          </div>

          {/* Tanggal Kembali */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Tanggal Kembali *</label>
            <input
              type="date"
              value={formData.tanggalKembali}
              onChange={(e) => setFormData({ ...formData, tanggalKembali: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={today}
              required
              disabled={loading}
            />
          </div>

          {/* Catatan */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Catatan</label>
            <textarea
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Catatan tambahan (opsional)"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
