import React, { useEffect, useState } from 'react';
import { kurirAPI, pengirimanAPI, routeAPI } from '../services/api';
import { FiTruck, FiPackage, FiMap, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalKurir: 0,
        totalPengiriman: 0,
        unassignedPengiriman: 0,
        totalRoutes: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
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
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Sistem Penentuan Rute Pengiriman dengan Cheapest Insertion Heuristic
                </p>
            </div>

            {/* Stats Grid */}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/kurir" className="card hover:shadow-lg transition-shadow">
                    <FiTruck className="w-8 h-8 text-primary-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Kelola Kurir
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Tambah, edit, atau hapus data kurir
                    </p>
                </Link>

                <Link to="/pengiriman" className="card hover:shadow-lg transition-shadow">
                    <FiPackage className="w-8 h-8 text-primary-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Kelola Pengiriman
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Tambah, edit, atau hapus data pengiriman
                    </p>
                </Link>

                <Link to="/route" className="card hover:shadow-lg transition-shadow">
                    <FiMap className="w-8 h-8 text-primary-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Optimasi Rute
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Hitung rute pengiriman terpendek
                    </p>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
