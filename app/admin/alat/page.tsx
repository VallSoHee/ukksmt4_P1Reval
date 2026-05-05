'use client';

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/app/components/LayoutWrapper';
import AlatModal from '@/app/components/AlatModal';

interface Kategori {
  id: number;
  nama: string;
}

interface Alat {
  id: number;
  kodeAlat: string;
  nama: string;
  deskripsi: string | undefined;
  stok: number;
  status: string;
  kategoriId: number;
  kategori?: Kategori;
  createdAt: string;
}

export default function AlatPage() {
  const [alat, setAlat] = useState<Alat[]>([]);  // ✅ Perbaiki: harus array
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);  // ✅ Perbaiki: state modal
  const [selectedAlat, setSelectedAlat] = useState<Alat | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchData = async () => {
    try {
      const [alatRes, kategoriRes] = await Promise.all([
        fetch('/api/admin/alat', { headers: getHeaders() }),
        fetch('/api/admin/kategori', { headers: getHeaders() }),
      ]);
      
      const alatResult = await alatRes.json();
      const kategoriResult = await kategoriRes.json();
      
      if (alatResult.success) setAlat(alatResult.data);
      if (kategoriResult.success) setKategoriList(kategoriResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    const response = await fetch('/api/admin/alat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      fetchData();
      alert('Alat berhasil dibuat');
    } else {
      alert(result.message);
    }
  };

  const handleUpdate = async (data: any) => {
    const response = await fetch(`/api/admin/alat/${data.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      fetchData();
      alert('Alat berhasil diupdate');
    } else {
      alert(result.message);
    }
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/admin/alat/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await response.json();
    if (result.success) {
      fetchData();
      alert('Alat berhasil dihapus');
    } else {
      alert(result.message);
    }
    setDeleteConfirm(null);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      tersedia: 'bg-green-100 text-green-700',
      dipinjam: 'bg-yellow-100 text-yellow-700',
      rusak: 'bg-red-100 text-red-700',
      perbaikan: 'bg-orange-100 text-orange-700',
    };
    const labels: Record<string, string> = {
      tersedia: 'Tersedia',
      dipinjam: 'Dipinjam',
      rusak: 'Rusak',
      perbaikan: 'Perbaikan',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>
        {labels[status]}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kelola Alat</h1>
          <button
            onClick={() => {
              setSelectedAlat(null);
              setModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <span>+</span> Tambah Alat
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Alat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alat.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{item.id}</td>
                  <td className="px-6 py-4 text-sm font-mono">{item.kodeAlat}</td>
                  <td className="px-6 py-4 text-sm font-medium">{item.nama}</td>
                  <td className="px-6 py-4 text-sm">{item.kategori?.nama || '-'}</td>
                  <td className="px-6 py-4 text-sm">{item.stok}</td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        setSelectedAlat(item);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {alat.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Belum ada data alat</p>
          </div>
        )}
      </div>

      <AlatModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={selectedAlat ? handleUpdate : handleCreate}
        alat={selectedAlat}
        kategoriList={kategoriList}
        title={selectedAlat ? 'Edit Alat' : 'Tambah Alat Baru'}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus alat ini? Tindakan ini tidak dapat dibatalkan.
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