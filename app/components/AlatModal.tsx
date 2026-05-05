'use client';

import { useState, useEffect } from 'react';

interface Kategori {
  id: number;
  nama: string;
}

interface Alat {
  id?: number;
  kodeAlat: string;
  nama: string;
  deskripsi?: string;
  stok: number;
  status: string;
  kategoriId: number;
}

interface AlatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alat: Alat) => void;
  alat: Alat | null;  // ← bisa null
  kategoriList: Kategori[];
  title: string;
}

export default function AlatModal({ 
  isOpen, 
  onClose, 
  onSave, 
  alat, 
  kategoriList, 
  title 
}: AlatModalProps) {
  const [formData, setFormData] = useState<Alat>({
    kodeAlat: '',
    nama: '',
    deskripsi: '',
    stok: 1,
    status: 'tersedia',
    kategoriId: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (alat && alat.id) {
      // Mode Edit: isi form dengan data alat yang dipilih
      setFormData({
        id: alat.id,
        kodeAlat: alat.kodeAlat,
        nama: alat.nama,
        deskripsi: alat.deskripsi || '',
        stok: alat.stok,
        status: alat.status,
        kategoriId: alat.kategoriId,
      });
    } else {
      // Mode Tambah: reset form
      setFormData({
        kodeAlat: '',
        nama: '',
        deskripsi: '',
        stok: 1,
        status: 'tersedia',
        kategoriId: 0,
      });
    }
  }, [alat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (formData.kategoriId === 0) {
      alert('Pilih kategori terlebih dahulu');
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving alat:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'tersedia', label: 'Tersedia' },
    { value: 'dipinjam', label: 'Dipinjam' },
    { value: 'rusak', label: 'Rusak' },
    { value: 'perbaikan', label: 'Perbaikan' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kode Alat *
            </label>
            <input
              type="text"
              value={formData.kodeAlat}
              onChange={(e) => setFormData({ ...formData, kodeAlat: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: ELC-001"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nama Alat *
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kategori *
            </label>
            <select
              value={formData.kategoriId}
              onChange={(e) => setFormData({ ...formData, kategoriId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value={0}>Pilih Kategori</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Stok
            </label>
            <input
              type="number"
              value={formData.stok}
              onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
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