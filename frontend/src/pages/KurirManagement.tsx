import React, { useEffect, useState } from 'react';
import { kurirAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

interface Kurir {
    id_kurir: number;
    nama_kurir: string;
    alamat_kurir: string;
}

const KurirManagement: React.FC = () => {
    const [kurirList, setKurirList] = useState<Kurir[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingKurir, setEditingKurir] = useState<Kurir | null>(null);
    const [formData, setFormData] = useState({ nama_kurir: '', alamat_kurir: '' });

    useEffect(() => {
        loadKurir();
    }, []);

    const loadKurir = async () => {
        try {
            const response = await kurirAPI.getAll();
            setKurirList(response.data);
        } catch (error) {
            console.error('Failed to load kurir:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingKurir) {
                await kurirAPI.update(editingKurir.id_kurir, formData);
            } else {
                await kurirAPI.create(formData);
            }
            loadKurir();
            closeModal();
        } catch (error) {
            console.error('Failed to save kurir:', error);
            alert('Gagal menyimpan data kurir');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kurir ini?')) {
            try {
                await kurirAPI.delete(id);
                loadKurir();
            } catch (error) {
                console.error('Failed to delete kurir:', error);
                alert('Gagal menghapus kurir');
            }
        }
    };

    const openModal = (kurir?: Kurir) => {
        if (kurir) {
            setEditingKurir(kurir);
            setFormData({ nama_kurir: kurir.nama_kurir, alamat_kurir: kurir.alamat_kurir });
        } else {
            setEditingKurir(null);
            setFormData({ nama_kurir: '', alamat_kurir: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingKurir(null);
        setFormData({ nama_kurir: '', alamat_kurir: '' });
    };

    const filteredKurir = kurirList.filter((kurir) =>
        kurir.nama_kurir.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kurir.alamat_kurir.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Kurir</h1>
                    <p className="text-gray-600 mt-1">Manajemen data kurir pengiriman</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center">
                    <FiPlus className="mr-2" />
                    Tambah Kurir
                </button>
            </div>

            {/* Search */}
            <div className="card mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari kurir..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nama Kurir</th>
                                <th>Alamat</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKurir.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        Tidak ada data kurir
                                    </td>
                                </tr>
                            ) : (
                                filteredKurir.map((kurir) => (
                                    <tr key={kurir.id_kurir}>
                                        <td>{kurir.id_kurir}</td>
                                        <td className="font-medium">{kurir.nama_kurir}</td>
                                        <td>{kurir.alamat_kurir}</td>
                                        <td>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openModal(kurir)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(kurir.id_kurir)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {editingKurir ? 'Edit Kurir' : 'Tambah Kurir'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Kurir
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama_kurir}
                                    onChange={(e) => setFormData({ ...formData, nama_kurir: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alamat
                                </label>
                                <textarea
                                    value={formData.alamat_kurir}
                                    onChange={(e) => setFormData({ ...formData, alamat_kurir: e.target.value })}
                                    className="input-field"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button type="submit" className="btn-primary flex-1">
                                    Simpan
                                </button>
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KurirManagement;
