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
  alat: Alat | null;
  kategoriList: Kategori[];
  title: string;
}

// Generate prefix 3 huruf dari nama kategori
function generatePrefix(namaKategori: string): string {
  const words = namaKategori.trim().split(/\s+/);
  if (words.length >= 3) {
    return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
  } else if (words.length === 2) {
    return (words[0].slice(0, 2) + words[1][0]).toUpperCase();
  } else {
    return words[0].slice(0, 3).toUpperCase();
  }
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
  const [generatingKode, setGeneratingKode] = useState(false);

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
  }, [alat, isOpen]);

  // Auto-generate kode alat saat kategori dipilih (mode tambah)
  const handleKategoriChange = async (kategoriId: number) => {
    setFormData(prev => ({ ...prev, kategoriId, kodeAlat: '' }));

    if (!alat?.id && kategoriId !== 0) {
      setGeneratingKode(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/alat/generate-kode?kategoriId=${kategoriId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (result.success) {
          setFormData(prev => ({ ...prev, kategoriId, kodeAlat: result.kodeAlat }));
        }
      } catch (err) {
        console.error('Gagal generate kode:', err);
      } finally {
        setGeneratingKode(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const isEditMode = !!(alat && alat.id);

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
          {/* Kategori — pilih dulu agar kode otomatis */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kategori *
            </label>
            <select
              value={formData.kategoriId}
              onChange={(e) => handleKategoriChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || isEditMode}
            >
              <option value={0}>Pilih Kategori</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Kode Alat — auto number, read-only saat tambah, editable saat edit */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kode Alat *
              {!isEditMode && (
                <span className="ml-2 text-xs font-normal text-blue-500">
                  (otomatis terisi setelah pilih kategori)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={generatingKode ? 'Membuat kode...' : formData.kodeAlat}
                onChange={isEditMode
                  ? (e) => setFormData({ ...formData, kodeAlat: e.target.value.toUpperCase() })
                  : undefined
                }
                readOnly={!isEditMode}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono
                  ${!isEditMode ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                placeholder={isEditMode ? 'Contoh: ELC-001' : 'Pilih kategori terlebih dahulu'}
                required
                disabled={loading || generatingKode}
              />
              {generatingKode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
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
              disabled={loading || generatingKode}
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
