'use client';

import { useState, useEffect } from 'react';
import LayoutWrapper from '@/app/components/LayoutWrapper';
import KategoriModal from '@/app/components/KategoriModal';

interface Kategori {
  id: number;
  nama: string;
  deskripsi: string | undefined;
  createdAt: string;
}

export default function KategoriPage() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchKategori = async () => {
    try {
      const response = await fetch('/api/admin/kategori', {
        headers: getHeaders(),
      });
      const result = await response.json();
      if (result.success) {
        setKategori(result.data);
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const handleCreate = async (data: any) => {
    const response = await fetch('/api/admin/kategori', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      fetchKategori();
      alert('Kategori berhasil dibuat');
    } else {
      alert(result.message);
    }
  };

  const handleUpdate = async (data: any) => {
    const response = await fetch(`/api/admin/kategori/${data.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      fetchKategori();
      alert('Kategori berhasil diupdate');
    } else {
      alert(result.message);
    }
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/admin/kategori/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await response.json();
    if (result.success) {
      fetchKategori();
      alert('Kategori berhasil dihapus');
    } else {
      alert(result.message);
    }
    setDeleteConfirm(null);
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
          <h1 className="text-2xl font-bold">Kelola Kategori Alat</h1>
          <button
            onClick={() => {
              setSelectedKategori(null);
              setModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <span>+</span> Tambah Kategori
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibuat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {kategori.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{item.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.deskripsi || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        setSelectedKategori(item);
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

        {kategori.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Belum ada data kategori</p>
          </div>
        )}
      </div>

      <KategoriModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={selectedKategori ? handleUpdate : handleCreate}
        kategori={selectedKategori}
        title={selectedKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        existingNames={kategori.map(k => k.nama)}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus kategori ini? 
              {kategori.find(k => k.id === deleteConfirm)?.nama}
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