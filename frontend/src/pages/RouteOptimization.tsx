import React, { useEffect, useState } from 'react';
import { kurirAPI, pengirimanAPI, routeAPI } from '../services/api';
import { FiMap, FiCheck, FiLoader } from 'react-icons/fi';
import RouteMap from '../components/RouteMap';

interface Kurir {
    id_kurir: number;
    nama_kurir: string;
}

interface Pengiriman {
    id_kirim: number;
    nama_penerima: string;
    alamat_penerima: string;
    latitude_kirim: number;
    longitude_kirim: number;
}

interface RouteResult {
    route: number[];
    ordered_deliveries: Pengiriman[];
    total_distance: number;
    kurir: Kurir;
}

const RouteOptimization: React.FC = () => {
    const [kurirList, setKurirList] = useState<Kurir[]>([]);
    const [pengirimanList, setPengirimanList] = useState<Pengiriman[]>([]);
    const [selectedKurir, setSelectedKurir] = useState('');
    const [selectedPengiriman, setSelectedPengiriman] = useState<number[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [kurirRes, pengirimanRes] = await Promise.all([
                kurirAPI.getAll(),
                pengirimanAPI.getUnassigned(),
            ]);
            setKurirList(kurirRes.data);
            setPengirimanList(pengirimanRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const togglePengiriman = (id: number) => {
        if (selectedPengiriman.includes(id)) {
            setSelectedPengiriman(selectedPengiriman.filter((p) => p !== id));
        } else {
            setSelectedPengiriman([...selectedPengiriman, id]);
        }
    };

    const handleCalculateRoute = async () => {
        if (!selectedKurir || selectedPengiriman.length === 0) {
            alert('Pilih kurir dan minimal 1 pengiriman');
            return;
        }

        setIsCalculating(true);
        try {
            const response = await routeAPI.optimize({
                kurir_id: parseInt(selectedKurir),
                pengiriman_ids: selectedPengiriman,
            });
            setRouteResult(response.data);
            // Reload data to update unassigned list
            loadData();
            setSelectedPengiriman([]);
        } catch (error: any) {
            console.error('Failed to calculate route:', error);
            alert(error.response?.data?.error || 'Gagal menghitung rute');
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Optimasi Rute Pengiriman</h1>
                <p className="text-gray-600 mt-1">
                    Hitung rute terpendek menggunakan Cheapest Insertion Heuristic
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Selection */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Kurir Selection */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Kurir</h3>
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

                    {/* Pengiriman Selection */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Pilih Pengiriman ({selectedPengiriman.length})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {pengirimanList.length === 0 ? (
                                <p className="text-gray-500 text-sm">Tidak ada pengiriman yang belum ditugaskan</p>
                            ) : (
                                pengirimanList.map((p) => (
                                    <label
                                        key={p.id_kirim}
                                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${selectedPengiriman.includes(p.id_kirim)
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPengiriman.includes(p.id_kirim)}
                                            onChange={() => togglePengiriman(p.id_kirim)}
                                            className="mt-1 mr-3"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{p.nama_penerima}</p>
                                            <p className="text-sm text-gray-600 line-clamp-2">{p.alamat_penerima}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <button
                        onClick={handleCalculateRoute}
                        disabled={isCalculating || !selectedKurir || selectedPengiriman.length === 0}
                        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isCalculating ? (
                            <>
                                <FiLoader className="animate-spin mr-2" />
                                Menghitung...
                            </>
                        ) : (
                            <>
                                <FiMap className="mr-2" />
                                Hitung Rute Optimal
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel - Results */}
                <div className="lg:col-span-2">
                    {routeResult ? (
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Hasil Optimasi</h3>
                                    <div className="flex items-center text-green-600">
                                        <FiCheck className="mr-2" />
                                        <span className="font-medium">Berhasil</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Kurir</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {routeResult.kurir.nama_kurir}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Jarak</p>
                                        <p className="text-lg font-semibold text-primary-600">
                                            {routeResult.total_distance} km
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Route Order */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Urutan Pengiriman</h3>
                                <div className="space-y-3">
                                    {routeResult.ordered_deliveries.map((delivery, index) => (
                                        <div
                                            key={delivery.id}
                                            className="flex items-start p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{delivery.nama_penerima}</p>
                                                <p className="text-sm text-gray-600">{delivery.alamat_penerima}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Map */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualisasi Rute</h3>
                                <RouteMap
                                    deliveries={routeResult.ordered_deliveries}
                                    depot={
                                        routeResult.kurir.latitude_kurir && routeResult.kurir.longitude_kurir
                                            ? {
                                                lat: routeResult.kurir.latitude_kurir,
                                                lng: routeResult.kurir.longitude_kurir,
                                                nama: routeResult.kurir.nama_kurir
                                            }
                                            : undefined
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="card h-full flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <FiMap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium">Belum ada hasil</p>
                                <p className="text-sm mt-2">
                                    Pilih kurir dan pengiriman, lalu klik "Hitung Rute Optimal"
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RouteOptimization;
