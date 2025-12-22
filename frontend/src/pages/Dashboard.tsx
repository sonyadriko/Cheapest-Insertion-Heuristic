import React, { useEffect, useState } from 'react';
import { kurirAPI, pengirimanAPI, routeAPI } from '../services/api';
import { FiTruck, FiPackage, FiMap, FiTrendingUp, FiCheckCircle, FiNavigation } from 'react-icons/fi';
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
    const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
    const [myRoute, setMyRoute] = useState<any>(null);
    const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);

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
                // Kurir: Load deliveries and route
                setIsLoadingDeliveries(true);
                const [pengirimanRes, routeRes] = await Promise.all([
                    pengirimanAPI.getMyDeliveries(),
                    routeAPI.getMyRoute().catch(() => ({ data: { route: null, ordered_deliveries: [] } }))
                ]);

                const deliveries = routeRes.data.ordered_deliveries || pengirimanRes.data;
                setMyDeliveries(deliveries);
                setMyRoute(routeRes.data);

                const completed = deliveries.filter((p: any) => p.status?.status_kirim === 'Delivered');

                setStats({
                    totalKurir: 0,
                    totalPengiriman: 0,
                    unassignedPengiriman: 0,
                    totalRoutes: 0,
                    myDeliveries: deliveries.length,
                    completedDeliveries: completed.length,
                });
                setIsLoadingDeliveries(false);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            setIsLoadingDeliveries(false);
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
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                    <p className="text-gray-600 mt-2">Kelola Kurir dan Optimasi Rute Pengiriman</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.title} className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="text-white text-2xl" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/kurir" className="card hover:shadow-lg transition-shadow cursor-pointer">
                        <FiTruck className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kelola Kurir</h3>
                        <p className="text-gray-600 text-sm">
                            Tambah, edit, atau hapus data kurir
                        </p>
                    </Link>

                    <Link to="/pengiriman" className="card hover:shadow-lg transition-shadow cursor-pointer">
                        <FiPackage className="w-8 h-8 text-green-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kelola Pengiriman</h3>
                        <p className="text-gray-600 text-sm">
                            Tambah, edit, atau hapus data pengiriman
                        </p>
                    </Link>

                    <Link to="/route-optimization" className="card hover:shadow-lg transition-shadow cursor-pointer">
                        <FiMap className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimasi Rute</h3>
                        <p className="text-gray-600 text-sm">
                            Hitung dan optimasi rute pengiriman menggunakan CIH
                        </p>
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
                                        <p className="text-sm text-gray-600">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="text-white text-2xl" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/route-optimization" className="card hover:shadow-lg transition-shadow cursor-pointer">
                        <FiMap className="w-8 h-8 text-purple-600 mb-3" />
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
        const statCards = [
            {
                title: 'Pengiriman Saya',
                value: stats.myDeliveries,
                icon: FiPackage,
                color: 'blue',
                description: 'Total pengiriman yang ditugaskan',
            },
            {
                title: 'Selesai',
                value: stats.completedDeliveries,
                icon: FiCheckCircle,
                color: 'green',
                description: 'Pengiriman yang sudah selesai',
            },
            {
                title: 'Dalam Proses',
                value: stats.myDeliveries - stats.completedDeliveries,
                icon: FiTruck,
                color: 'yellow',
                description: 'Pengiriman yang sedang berlangsung',
            },
        ];

        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Kurir</h1>
                    <p className="text-gray-600 mt-1">Selamat datang, {user.nama}!</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        const colorClasses = {
                            blue: 'bg-blue-500',
                            green: 'bg-green-500',
                            yellow: 'bg-yellow-500',
                            purple: 'bg-purple-500',
                        }[card.color];

                        return (
                            <div key={index} className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">{card.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${colorClasses} rounded-lg flex items-center justify-center`}>
                                        <Icon className="text-white text-2xl" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Route Information */}
                {myRoute?.route && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <FiMap className="text-white text-2xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-900">Rute Optimal Tersedia</h3>
                                <p className="text-sm text-blue-700">
                                    Total Jarak: <strong>{myRoute.total_distance?.toFixed(2)} km</strong> •
                                    Ikuti urutan pengiriman di bawah untuk rute tercepat
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Deliveries List with Route Order */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {myRoute?.route ? '📍 Urutan Rute Pengiriman' : 'Daftar Pengiriman Saya'}
                    </h2>

                    {isLoadingDeliveries ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : myDeliveries.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FiPackage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">Belum ada pengiriman</p>
                            <p className="text-sm mt-2">Anda belum memiliki pengiriman yang ditugaskan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myDeliveries.map((delivery, index) => (
                                <div
                                    key={delivery.id_kirim}
                                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md transition-all border-l-4 border-primary-500"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Route Number */}
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    {delivery.nama_penerima}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${delivery.status?.status_kirim === 'Delivered'
                                                            ? 'bg-green-100 text-green-800'
                                                            : delivery.status?.status_kirim === 'In Progress'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {delivery.status?.status_kirim || 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2 flex items-start gap-2">
                                                <span className="text-gray-500">📍</span>
                                                <span>{delivery.alamat_penerima}</span>
                                            </p>
                                            {delivery.latitude_kirim && delivery.longitude_kirim && (
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Koordinat: {parseFloat(delivery.latitude_kirim).toFixed(6)}, {parseFloat(delivery.longitude_kirim).toFixed(6)}
                                                </p>
                                            )}

                                            {/* Navigation Button */}
                                            <button
                                                onClick={() => {
                                                    const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.latitude_kirim},${delivery.longitude_kirim}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
                                            >
                                                <FiNavigation className="text-lg" />
                                                Navigasi ke Lokasi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default Dashboard;
