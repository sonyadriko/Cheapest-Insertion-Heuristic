import React, { useEffect, useState } from 'react';
import { pengirimanAPI, kurirAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMapPin } from 'react-icons/fi';

interface Pengiriman {
    id_kirim: number;
    nama_penerima: string;
    alamat_penerima: string;
    latitude_kirim: number;
    longitude_kirim: number;
    id_kirim_kurir: number | null;
    kurir: { nama_kurir: string } | null;
}

interface Kurir {
    id_kurir: number;
    nama_kurir: string;
}

const PengirimanManagement: React.FC = () => {
    const [pengirimanList, setPengirimanList] = useState<Pengiriman[]>([]);
    const [kurirList, setKurirList] = useState<Kurir[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPengiriman, setEditingPengiriman] = useState<Pengiriman | null>(null);
    const [formData, setFormData] = useState({
        nama_penerima: '',
        alamat_penerima: '',
        latitude_kirim: '',
        longitude_kirim: '',
        id_kirim_kurir: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pengirimanRes, kurirRes] = await Promise.all([
                pengirimanAPI.getAll(),
                kurirAPI.getAll(),
            ]);
            setPengirimanList(pengirimanRes.data);
            setKurirList(kurirRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                nama_penerima: formData.nama_penerima,
                alamat_penerima: formData.alamat_penerima,
                latitude_kirim: parseFloat(formData.latitude_kirim),
                longitude_kirim: parseFloat(formData.longitude_kirim),
                id_kirim_kurir: formData.id_kirim_kurir ? parseInt(formData.id_kirim_kurir) : null,
            };

            if (editingPengiriman) {
                await pengirimanAPI.update(editingPengiriman.id_kirim, data);
            } else {
                await pengirimanAPI.create(data);
            }
            loadData();
            closeModal();
        } catch (error) {
            console.error('Failed to save pengiriman:', error);
            alert('Gagal menyimpan data pengiriman');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengiriman ini?')) {
            try {
                await pengirimanAPI.delete(id);
                loadData();
            } catch (error) {
                console.error('Failed to delete pengiriman:', error);
                alert('Gagal menghapus pengiriman');
            }
        }
    };

    const openModal = (pengiriman?: Pengiriman) => {
        if (pengiriman) {
            setEditingPengiriman(pengiriman);
            setFormData({
                nama_penerima: pengiriman.nama_penerima,
                alamat_penerima: pengiriman.alamat_penerima,
                latitude_kirim: pengiriman.latitude_kirim.toString(),
                longitude_kirim: pengiriman.longitude_kirim.toString(),
                id_kirim_kurir: pengiriman.id_kirim_kurir?.toString() || '',
            });
        } else {
            setEditingPengiriman(null);
            setFormData({
                nama_penerima: '',
                alamat_penerima: '',
                latitude_kirim: '',
                longitude_kirim: '',
                id_kirim_kurir: '',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPengiriman(null);
    };

    const filteredPengiriman = pengirimanList.filter((p) =>
        p.nama_penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.alamat_penerima.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Pengiriman</h1>
                    <p className="text-gray-600 mt-1">Manajemen data pengiriman</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center">
                    <FiPlus className="mr-2" />
                    Tambah Pengiriman
                </button>
            </div>

            {/* Search */}
            <div className="card mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari pengiriman..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Penerima</th>
                            <th>Alamat</th>
                            <th>Koordinat</th>
                            <th>Kurir</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPengiriman.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                    Tidak ada data pengiriman
                                </td>
                            </tr>
                        ) : (
                            filteredPengiriman.map((p) => (
                                <tr key={p.id_kirim}>
                                    <td>{p.id_kirim}</td>
                                    <td className="font-medium">{p.nama_penerima}</td>
                                    <td className="max-w-xs truncate">{p.alamat_penerima}</td>
                                    <td>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <FiMapPin className="mr-1" />
                                            {p.latitude_kirim.toFixed(4)}, {p.longitude_kirim.toFixed(4)}
                                        </div>
                                    </td>
                                    <td>
                                        {p.kurir ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                {p.kurir.nama_kurir}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                Belum ditugaskan
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openModal(p)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id_kirim)}
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {editingPengiriman ? 'Edit Pengiriman' : 'Tambah Pengiriman'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Penerima
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nama_penerima}
                                        onChange={(e) => setFormData({ ...formData, nama_penerima: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kurir (Opsional)
                                    </label>
                                    <select
                                        value={formData.id_kirim_kurir}
                                        onChange={(e) => setFormData({ ...formData, id_kirim_kurir: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Belum ditugaskan</option>
                                        {kurirList.map((kurir) => (
                                            <option key={kurir.id_kurir} value={kurir.id_kurir}>
                                                {kurir.nama_kurir}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alamat Penerima
                                </label>
                                <textarea
                                    value={formData.alamat_penerima}
                                    onChange={(e) => setFormData({ ...formData, alamat_penerima: e.target.value })}
                                    className="input-field"
                                    rows={2}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude_kirim}
                                        onChange={(e) => setFormData({ ...formData, latitude_kirim: e.target.value })}
                                        className="input-field"
                                        placeholder="-6.200000"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude_kirim}
                                        onChange={(e) => setFormData({ ...formData, longitude_kirim: e.target.value })}
                                        className="input-field"
                                        placeholder="106.816666"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
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

export default PengirimanManagement;
