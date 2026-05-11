'use client';

import { useState, useEffect } from 'react';

interface PeminjamanOption {
  id: number;
  kodePeminjaman: string;
  jumlah: number;
  tanggalKembali: string | null;
  user: { username: string };
  alat: { kodeAlat: string; nama: string };
}

interface Pengembalian {
  id?: number;
  peminjamanId: number;
  kondisi: string;
  denda: number;
  catatan: string;
  diterimaOleh: number;
}

interface PengembalianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Pengembalian) => void;
  pengembalian: any | null;
  peminjamanList: PeminjamanOption[]; // hanya peminjaman berstatus 'dipinjam'
  currentUserId: number;
  title: string;
}

const KONDISI_OPTIONS = [
  { value: 'baik',     label: 'Baik',           color: 'text-green-600' },
  { value: 'kurang',   label: 'Kurang Baik',     color: 'text-yellow-600' },
  { value: 'rusak',    label: 'Rusak',           color: 'text-red-600' },
];

export default function PengembalianModal({
  isOpen,
  onClose,
  onSave,
  pengembalian,
  peminjamanList,
  currentUserId,
  title,
}: PengembalianModalProps) {
  const [formData, setFormData] = useState<Pengembalian>({
    peminjamanId: 0,
    kondisi: 'baik',
    denda: 0,
    catatan: '',
    diterimaOleh: currentUserId,
  });
  const [loading, setLoading] = useState(false);
  const [dendaOtomatis, setDendaOtomatis] = useState(0);
  const [hariTerlambat, setHariTerlambat] = useState(0);

  const isEditMode = !!(pengembalian && pengembalian.id);

  const selectedPeminjaman = peminjamanList.find((p) => p.id === formData.peminjamanId);

  // Hitung denda otomatis saat peminjaman dipilih
  useEffect(() => {
    if (!selectedPeminjaman?.tanggalKembali) {
      setDendaOtomatis(0);
      setHariTerlambat(0);
      return;
    }
    const today = new Date();
    const deadline = new Date(selectedPeminjaman.tanggalKembali);
    if (today > deadline) {
      const hari = Math.ceil((today.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
      setHariTerlambat(hari);
      const auto = hari * 5000;
      setDendaOtomatis(auto);
      if (!isEditMode) {
        setFormData((prev) => ({ ...prev, denda: auto }));
      }
    } else {
      setDendaOtomatis(0);
      setHariTerlambat(0);
      if (!isEditMode) {
        setFormData((prev) => ({ ...prev, denda: 0 }));
      }
    }
  }, [formData.peminjamanId, selectedPeminjaman]);

  useEffect(() => {
    if (pengembalian && pengembalian.id) {
      setFormData({
        id: pengembalian.id,
        peminjamanId: pengembalian.peminjamanId,
        kondisi: pengembalian.kondisi,
        denda: pengembalian.denda,
        catatan: pengembalian.catatan || '',
        diterimaOleh: pengembalian.diterimaOleh,
      });
    } else {
      setFormData({
        peminjamanId: 0,
        kondisi: 'baik',
        denda: 0,
        catatan: '',
        diterimaOleh: currentUserId,
      });
    }
  }, [pengembalian, isOpen, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode && formData.peminjamanId === 0) {
      alert('Pilih peminjaman terlebih dahulu');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl" type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Pilih Peminjaman */}
          {!isEditMode && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Peminjaman * <span className="text-xs font-normal text-gray-500">(hanya status "dipinjam")</span>
              </label>
              <select
                value={formData.peminjamanId}
                onChange={(e) => setFormData({ ...formData, peminjamanId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value={0}>Pilih Peminjaman</option>
                {peminjamanList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kodePeminjaman} — {p.user.username} | {p.alat.nama}
                  </option>
                ))}
              </select>

              {/* Info peminjaman yang dipilih */}
              {selectedPeminjaman && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm space-y-1">
                  <p><span className="text-gray-500">Alat:</span> [{selectedPeminjaman.alat.kodeAlat}] {selectedPeminjaman.alat.nama}</p>
                  <p><span className="text-gray-500">Jumlah:</span> {selectedPeminjaman.jumlah}</p>
                  <p>
                    <span className="text-gray-500">Deadline:</span>{' '}
                    {selectedPeminjaman.tanggalKembali
                      ? new Date(selectedPeminjaman.tanggalKembali).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                  {hariTerlambat > 0 && (
                    <p className="text-red-600 font-semibold">
                      ⚠️ Terlambat {hariTerlambat} hari — denda otomatis: Rp {dendaOtomatis.toLocaleString('id-ID')}
                    </p>
                  )}
                  {hariTerlambat === 0 && selectedPeminjaman.tanggalKembali && (
                    <p className="text-green-600">✓ Tepat waktu</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Edit mode: tampilkan info peminjaman read-only */}
          {isEditMode && pengembalian?.peminjaman && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <p className="font-medium">{pengembalian.peminjaman.kodePeminjaman}</p>
              <p><span className="text-gray-500">Peminjam:</span> {pengembalian.peminjaman.user?.username}</p>
              <p><span className="text-gray-500">Alat:</span> {pengembalian.peminjaman.alat?.nama}</p>
            </div>
          )}

          {/* Kondisi */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Kondisi Alat *</label>
            <div className="grid grid-cols-3 gap-2">
              {KONDISI_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, kondisi: opt.value })}
                  disabled={loading}
                  className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition ${
                    formData.kondisi === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {formData.kondisi === 'rusak' && (
              <p className="mt-1 text-xs text-red-600">⚠️ Status alat akan diubah menjadi "Rusak"</p>
            )}
          </div>

          {/* Denda */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Denda (Rp)
              {dendaOtomatis > 0 && !isEditMode && (
                <span className="ml-2 text-xs font-normal text-orange-500">
                  otomatis: Rp {dendaOtomatis.toLocaleString('id-ID')}
                </span>
              )}
            </label>
            <input
              type="number"
              value={formData.denda}
              onChange={(e) => setFormData({ ...formData, denda: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
              step={1000}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">Rp 5.000/hari untuk keterlambatan. Bisa diubah manual.</p>
          </div>

          {/* Catatan */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Catatan</label>
            <textarea
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Catatan kondisi / keterangan tambahan"
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
              {loading ? 'Menyimpan...' : isEditMode ? 'Update' : 'Proses Pengembalian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
