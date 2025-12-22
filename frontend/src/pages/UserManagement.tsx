import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiKey } from 'react-icons/fi';

interface User {
    id_login: number;
    username_login: string;
    nama: string;
    status_login: string;
}

const UserManagement: React.FC = () => {
    const [userList, setUserList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username_login: '',
        password_login: '',
        confirm_password: '',
        nama: '',
        status_login: '',
    });
    const [passwordData, setPasswordData] = useState({
        new_password: '',
        confirm_password: '',
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userAPI.getAll();
            setUserList(response.data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password confirmation for new user
        if (!editingUser && formData.password_login !== formData.confirm_password) {
            alert('Password dan konfirmasi password tidak cocok');
            return;
        }

        // Validate password for edit if provided
        if (editingUser && formData.password_login && formData.password_login !== formData.confirm_password) {
            alert('Password dan konfirmasi password tidak cocok');
            return;
        }

        try {
            const data: any = {
                username_login: formData.username_login,
                nama: formData.nama,
                status_login: formData.status_login,
            };

            // Only include password if it's a new user or password is being changed
            if (!editingUser || formData.password_login) {
                data.password_login = formData.password_login;
            }

            if (editingUser) {
                await userAPI.update(editingUser.id_login, data);
            } else {
                await userAPI.create(data);
            }
            loadUsers();
            closeModal();
        } catch (error: any) {
            console.error('Failed to save user:', error);
            alert(error.response?.data?.error || 'Gagal menyimpan data user');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            try {
                await userAPI.delete(id);
                loadUsers();
            } catch (error: any) {
                console.error('Failed to delete user:', error);
                alert(error.response?.data?.error || 'Gagal menghapus user');
            }
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            alert('Password dan konfirmasi password tidak cocok');
            return;
        }

        if (!resetPasswordUser) return;

        try {
            await userAPI.resetPassword(resetPasswordUser.id_login, {
                new_password: passwordData.new_password
            });
            alert('Password berhasil direset');
            closePasswordModal();
        } catch (error: any) {
            console.error('Failed to reset password:', error);
            alert(error.response?.data?.error || 'Gagal reset password');
        }
    };

    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username_login: user.username_login,
                password_login: '',
                confirm_password: '',
                nama: user.nama,
                status_login: user.status_login,
            });
        } else {
            setEditingUser(null);
            setFormData({
                username_login: '',
                password_login: '',
                confirm_password: '',
                nama: '',
                status_login: '',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    const openPasswordModal = (user: User) => {
        setResetPasswordUser(user);
        setPasswordData({
            new_password: '',
            confirm_password: '',
        });
        setShowPasswordModal(true);
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setResetPasswordUser(null);
    };

    const filteredUsers = userList.filter((user) =>
        user.username_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status_login.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        const badges: { [key: string]: string } = {
            admin: 'bg-red-100 text-red-800',
            spv: 'bg-blue-100 text-blue-800',
            kurir: 'bg-green-100 text-green-800',
        };
        return badges[role] || 'bg-gray-100 text-gray-800';
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">Kelola User</h1>
                    <p className="text-gray-600 mt-1">Manajemen user sistem</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center">
                    <FiPlus className="mr-2" />
                    Tambah User
                </button>
            </div>

            {/* Search */}
            <div className="card mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari user..."
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
                                <th>Username</th>
                                <th>Nama</th>
                                <th>Role</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        Tidak ada data user
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id_login}>
                                        <td>{user.id_login}</td>
                                        <td className="font-medium">{user.username_login}</td>
                                        <td>{user.nama}</td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.status_login)}`}>
                                                {user.status_login.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => openPasswordModal(user)}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <FiKey />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id_login)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {editingUser ? 'Edit User' : 'Tambah User'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={formData.username_login}
                                    onChange={(e) => setFormData({ ...formData, username_login: e.target.value })}
                                    className="input-field"
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password {editingUser && '(Kosongkan jika tidak ingin mengubah)'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password_login}
                                    onChange={(e) => setFormData({ ...formData, password_login: e.target.value })}
                                    className="input-field"
                                    required={!editingUser}
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Konfirmasi Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                    className="input-field"
                                    required={!editingUser || !!formData.password_login}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    value={formData.status_login}
                                    onChange={(e) => setFormData({ ...formData, status_login: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">-- Pilih Role --</option>
                                    <option value="admin">Admin</option>
                                    <option value="spv">SPV (Supervisor)</option>
                                    <option value="kurir">Kurir</option>
                                </select>
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

            {/* Reset Password Modal */}
            {showPasswordModal && resetPasswordUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Reset Password
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Reset password untuk: <strong>{resetPasswordUser.nama}</strong> ({resetPasswordUser.username_login})
                        </p>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password Baru
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    className="input-field"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Konfirmasi Password Baru
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="submit" className="btn-primary flex-1">
                                    Reset Password
                                </button>
                                <button type="button" onClick={closePasswordModal} className="btn-secondary flex-1">
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

export default UserManagement;
