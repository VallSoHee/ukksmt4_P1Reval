'use client';

import { useState, useEffect } from 'react';

interface Kategori {
  id?: number;
  nama: string;
  deskripsi?: string;
}

interface KategoriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kategori: Kategori) => void;
  kategori: Kategori | null;
  title: string;
  existingNames?: string[]; // nama kategori yang sudah ada (untuk filter dropdown)
}

// Daftar preset nama kategori alat laboratorium / bengkel
const PRESET_KATEGORI = [
  'Elektronik',
  'Mekanik',
  'Pengukuran',
  'Keselamatan',
  'Komputer',
  'Jaringan',
  'Pneumatik',
  'Hidrolik',
  'Listrik',
  'Optik',
  'Audio Visual',
  'Robotika',
  'Otomotif',
  'Pertukangan',
  'Kimia',
  'Fisika',
  'Tangan (Hand Tools)',
  'Mesin (Power Tools)',
  'Instrumentasi',
  'Telekomunikasi',
  'Lainnya',
];

export default function KategoriModal({
  isOpen,
  onClose,
  onSave,
  kategori,
  title,
  existingNames = [],
}: KategoriModalProps) {
  const [formData, setFormData] = useState<Kategori>({
    nama: '',
    deskripsi: '',
  });
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const isEditMode = !!(kategori && kategori.id);

  useEffect(() => {
    if (kategori) {
      setFormData({
        id: kategori.id,
        nama: kategori.nama,
        deskripsi: kategori.deskripsi || '',
      });
      // Jika nama tidak ada di preset, tandai sebagai custom
      setIsCustom(!PRESET_KATEGORI.includes(kategori.nama));
    } else {
      setFormData({ nama: '', deskripsi: '' });
      setIsCustom(false);
    }
  }, [kategori, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert('Nama kategori harus diisi');
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving kategori:', error);
    } finally {
      setLoading(false);
    }
  };

  // Opsi dropdown: preset dikurangi yang sudah ada (kecuali nama kategori yang sedang diedit)
  const availableOptions = PRESET_KATEGORI.filter(
    (name) => !existingNames.includes(name) || name === kategori?.nama
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
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
              Nama Kategori *
            </label>

            {/* Mode edit atau custom: tampilkan text input */}
            {(isEditMode || isCustom) ? (
              <div>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama kategori"
                  required
                  disabled={loading}
                />
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => { setIsCustom(false); setFormData({ ...formData, nama: '' }); }}
                    className="mt-1 text-xs text-blue-500 hover:underline"
                  >
                    ← Pilih dari daftar
                  </button>
                )}
              </div>
            ) : (
              /* Mode tambah: tampilkan dropdown */
              <div>
                <select
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Pilih Nama Kategori</option>
                  {availableOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className="mt-1 text-xs text-blue-500 hover:underline"
                >
                  + Tulis nama sendiri
                </button>
              </div>
            )}
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
              placeholder="Deskripsi kategori (opsional)"
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
