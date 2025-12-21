import React, { useEffect, useState } from 'react';
import { kurirAPI, pengirimanAPI, routeAPI } from '../services/api';
import { FiTruck, FiPackage, FiMap, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalKurir: 0,
        totalPengiriman: 0,
        unassignedPengiriman: 0,
        totalRoutes: 0,
        myDeliveries: 0,
        completedDeliveries: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        try {
            if (user?.status_login === 'admin' || user?.status_login === 'spv') {
                // Admin & SPV: Load all stats
                const [kurirRes, pengirimanRes, unassignedRes, routeRes] = await Promise.all([
                    kurirAPI.getAll(),
                    pengirimanAPI.getAll(),
                    pengirimanAPI.getUnassigned(),
                    routeAPI.getHistory(),
                ]);

                setStats({
                    totalKurir: kurirRes.data.length,
                    totalPengiriman: pengirimanRes.data.length,
                    unassignedPengiriman: unassignedRes.data.length,
                    totalRoutes: routeRes.data.length,
                    myDeliveries: 0,
                    completedDeliveries: 0,
                });
            } else if (user?.status_login === 'kurir') {
                // Kurir: Load only their deliveries
                const pengirimanRes = await pengirimanAPI.getAll();
                const myDeliveries = pengirimanRes.data.filter(
                    (p: any) => p.kurir?.nama_kurir === user.nama
                );
                const completed = myDeliveries.filter((p: any) => p.status?.status_kirim === 'Delivered');

                setStats({
                    totalKurir: 0,
                    totalPengiriman: 0,
                    unassignedPengiriman: 0,
                    totalRoutes: 0,
                    myDeliveries: myDeliveries.length,
                    completedDeliveries: completed.length,
                });
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Admin Dashboard
    if (user?.status_login === 'admin') {
        const statCards = [
            {
                title: 'Total Kurir',
                value: stats.totalKurir,
                icon: FiTruck,
                color: 'bg-blue-500',
                link: '/kurir',
            },
            {
                title: 'Total Pengiriman',
                value: stats.totalPengiriman,
                icon: FiPackage,
                color: 'bg-green-500',
                link: '/pengiriman',
            },
            {
                title: 'Belum Ditugaskan',
                value: stats.unassignedPengiriman,
                icon: FiTrendingUp,
                color: 'bg-orange-500',
                link: '/pengiriman',
            },
            {
                title: 'Rute Dioptimasi',
                value: stats.totalRoutes,
                icon: FiMap,
                color: 'bg-purple-500',
                link: '/route',
            },
        ];

        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                    <p className="text-gray-600 mt-2">
                        Sistem Penentuan Rute Pengiriman dengan Cheapest Insertion Heuristic
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={stat.title}
                                to={stat.link}
                                className="card hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/kurir" className="card hover:shadow-lg transition-shadow">
                        <FiTruck className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kelola Kurir</h3>
                        <p className="text-gray-600 text-sm">Tambah, edit, atau hapus data kurir</p>
                    </Link>

                    <Link to="/pengiriman" className="card hover:shadow-lg transition-shadow">
                        <FiPackage className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kelola Pengiriman</h3>
                        <p className="text-gray-600 text-sm">Tambah, edit, atau hapus data pengiriman</p>
                    </Link>

                    <Link to="/route" className="card hover:shadow-lg transition-shadow">
                        <FiMap className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimasi Rute</h3>
                        <p className="text-gray-600 text-sm">Hitung rute pengiriman terpendek</p>
                    </Link>
                </div>
            </div>
        );
    }

    // SPV Dashboard
    if (user?.status_login === 'spv') {
        const statCards = [
            {
                title: 'Total Kurir',
                value: stats.totalKurir,
                icon: FiTruck,
                color: 'bg-blue-500',
            },
            {
                title: 'Total Pengiriman',
                value: stats.totalPengiriman,
                icon: FiPackage,
                color: 'bg-green-500',
            },
            {
                title: 'Belum Ditugaskan',
                value: stats.unassignedPengiriman,
                icon: FiTrendingUp,
                color: 'bg-orange-500',
            },
            {
                title: 'Rute Dioptimasi',
                value: stats.totalRoutes,
                icon: FiMap,
                color: 'bg-purple-500',
            },
        ];

        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Supervisor</h1>
                    <p className="text-gray-600 mt-2">Monitoring dan Optimasi Rute Pengiriman</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.title} className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/route" className="card hover:shadow-lg transition-shadow">
                        <FiMap className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimasi Rute</h3>
                        <p className="text-gray-600 text-sm">
                            Hitung dan optimasi rute pengiriman menggunakan CIH
                        </p>
                    </Link>

                    <div className="card bg-primary-50 border-primary-200">
                        <FiCheckCircle className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Akses SPV</h3>
                        <p className="text-gray-600 text-sm">
                            Anda dapat melihat data dan melakukan optimasi rute
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Kurir Dashboard
    if (user?.status_login === 'kurir') {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Kurir</h1>
                    <p className="text-gray-600 mt-2">Selamat datang, {user.nama}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pengiriman Saya</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.myDeliveries}</p>
                            </div>
                            <div className="bg-blue-500 p-3 rounded-lg">
                                <FiPackage className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Selesai</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedDeliveries}</p>
                            </div>
                            <div className="bg-green-500 p-3 rounded-lg">
                                <FiCheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-blue-50 border-blue-200">
                    <FiTruck className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Informasi Kurir</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        Anda dapat melihat daftar pengiriman yang ditugaskan kepada Anda.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-gray-600">
                            <strong>Nama:</strong> {user.nama}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            <strong>Total Pengiriman:</strong> {stats.myDeliveries} paket
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            <strong>Status:</strong>{' '}
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Aktif
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Dashboard;
