import React, { useEffect, useState } from 'react';
import { kurirAPI, routeAPI } from '../services/api';
import { FiTruck, FiPackage, FiMap, FiNavigation, FiCalendar, FiEye } from 'react-icons/fi';
import RouteMap from '../components/RouteMap';

interface Kurir {
    id_kurir: number;
    nama_kurir: string;
    alamat_kurir?: string;
    latitude_kurir?: number;
    longitude_kurir?: number;
}

interface Delivery {
    id_kirim: number;
    nama_penerima: string;
    alamat_penerima: string;
    latitude_kirim: number;
    longitude_kirim: number;
    tanggal_kirim?: string;
    status?: {
        id_status: number;
        status_kirim: string;
    };
}

interface RouteData {
    kurir: Kurir;
    route: any;
    ordered_deliveries: Delivery[];
    total_distance: number;
    tanggal_rute?: string;
}

const SPVKurirView: React.FC = () => {
    const [kurirList, setKurirList] = useState<Kurir[]>([]);
    const [selectedKurir, setSelectedKurir] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadKurirList();
    }, []);

    useEffect(() => {
        if (selectedKurir) {
            loadKurirRoute();
        }
    }, [selectedKurir, selectedDate]);

    const loadKurirList = async () => {
        try {
            const response = await kurirAPI.getAll();
            setKurirList(response.data);
        } catch (error) {
            console.error('Failed to load kurir list:', error);
        }
    };

    const loadKurirRoute = async () => {
        if (!selectedKurir) return;

        setIsLoading(true);
        try {
            const response = await routeAPI.getKurirRoute(parseInt(selectedKurir), selectedDate);
            setRouteData(response.data);
        } catch (error) {
            console.error('Failed to load kurir route:', error);
            setRouteData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedKurirData = kurirList.find(k => k.id_kurir === parseInt(selectedKurir));

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Lihat Rute Kurir</h1>
                <p className="text-gray-600 mt-1">
                    Pantau pengiriman dan rute kurir per tanggal
                </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Date Filter */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                        <FiCalendar className="text-primary-600" />
                        <h3 className="font-semibold text-gray-900">Pilih Tanggal</h3>
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Kurir Filter */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                        <FiTruck className="text-primary-600" />
                        <h3 className="font-semibold text-gray-900">Pilih Kurir</h3>
                    </div>
                    <select
                        value={selectedKurir}
                        onChange={(e) => setSelectedKurir(e.target.value)}
                        className="input-field"
                    >
                        <option value="">-- Pilih Kurir --</option>
                        {kurirList.map((kurir) => (
                            <option key={kurir.id_kurir} value={kurir.id_kurir}>
                                {kurir.nama_kurir}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            )}

            {/* No Kurir Selected */}
            {!selectedKurir && !isLoading && (
                <div className="card text-center py-12">
                    <FiEye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Kurir untuk Melihat Rute</h3>
                    <p className="text-gray-500">
                        Pilih kurir dan tanggal di atas untuk melihat daftar pengiriman dan rute
                    </p>
                </div>
            )}

            {/* Route Data Display */}
            {selectedKurir && !isLoading && routeData && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Kurir</p>
                                    <p className="text-xl font-bold text-blue-900 mt-1">
                                        {routeData.kurir.nama_kurir}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <FiTruck className="text-white text-2xl" />
                                </div>
                            </div>
                        </div>

                        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Total Pengiriman</p>
                                    <p className="text-3xl font-bold text-green-900 mt-1">
                                        {routeData.ordered_deliveries.length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                    <FiPackage className="text-white text-2xl" />
                                </div>
                            </div>
                        </div>

                        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Total Jarak</p>
                                    <p className="text-3xl font-bold text-purple-900 mt-1">
                                        {routeData.total_distance?.toFixed(2) || 0}
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1">kilometer</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <FiMap className="text-white text-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery List */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            📍 Urutan Rute Pengiriman
                        </h2>

                        {routeData.ordered_deliveries.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FiPackage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium">Belum ada pengiriman</p>
                                <p className="text-sm mt-2">
                                    Tidak ada pengiriman untuk kurir ini pada tanggal {selectedDate}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {routeData.ordered_deliveries.map((delivery, index) => (
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
                                                        Koordinat: {parseFloat(String(delivery.latitude_kirim)).toFixed(6)}, {parseFloat(String(delivery.longitude_kirim)).toFixed(6)}
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

                    {/* Map Visualization */}
                    {routeData.ordered_deliveries.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualisasi Rute</h3>
                            <RouteMap
                                deliveries={routeData.ordered_deliveries.map(d => ({
                                    id_kirim: d.id_kirim,
                                    nama_penerima: d.nama_penerima,
                                    alamat_penerima: d.alamat_penerima,
                                    latitude_kirim: d.latitude_kirim,
                                    longitude_kirim: d.longitude_kirim
                                }))}
                                depot={
                                    selectedKurirData?.latitude_kurir && selectedKurirData?.longitude_kurir
                                        ? {
                                            lat: selectedKurirData.latitude_kurir,
                                            lng: selectedKurirData.longitude_kurir,
                                            nama: selectedKurirData.nama_kurir
                                        }
                                        : undefined
                                }
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SPVKurirView;
