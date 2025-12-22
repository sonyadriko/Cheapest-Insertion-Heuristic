import React, { useEffect, useState } from 'react';
import { kurirAPI, pengirimanAPI, routeAPI } from '../services/api';
import { FiMap, FiCheck, FiLoader } from 'react-icons/fi';
import RouteMap from '../components/RouteMap';

interface Kurir {
    id_kurir: number;
    nama_kurir: string;
    latitude_kurir?: number;
    longitude_kurir?: number;
}

interface Pengiriman {
    id_kirim: number;
    nama_penerima: string;
    alamat_penerima: string;
    latitude_kirim: number;
    longitude_kirim: number;
}

interface RouteSegment {
    from: string;
    to: string;
    from_name: string;
    to_name: string;
    distance: number;
}

interface DistanceMatrix {
    labels: string[];
    matrix: number[][];
}

interface RouteResult {
    route: number[];
    ordered_deliveries: Pengiriman[];
    total_distance: number;
    route_segments?: RouteSegment[];
    distance_matrix?: DistanceMatrix;
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
                            Pilih Pengiriman ({selectedPengiriman.length} dipilih)
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {pengirimanList.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">
                                    Tidak ada pengiriman yang belum ditugaskan
                                </p>
                            ) : (
                                pengirimanList.map((pengiriman) => (
                                    <div
                                        key={pengiriman.id_kirim}
                                        onClick={() => togglePengiriman(pengiriman.id_kirim)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPengiriman.includes(pengiriman.id_kirim)
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                checked={selectedPengiriman.includes(pengiriman.id_kirim)}
                                                onChange={() => { }}
                                                className="mt-1 mr-3"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {pengiriman.nama_penerima}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {pengiriman.alamat_penerima}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <button
                        onClick={handleCalculateRoute}
                        disabled={isCalculating || !selectedKurir || selectedPengiriman.length === 0}
                        className="btn-primary w-full flex items-center justify-center"
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
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-600 font-medium">Total Jarak</p>
                                            <p className="text-3xl font-bold text-blue-900 mt-1">
                                                {routeResult.total_distance.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">kilometer</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <FiMap className="text-white text-2xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-600 font-medium">Jumlah Pengiriman</p>
                                            <p className="text-3xl font-bold text-green-900 mt-1">
                                                {routeResult.ordered_deliveries.length}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">lokasi</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                            <FiCheck className="text-white text-2xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-purple-600 font-medium">Kurir</p>
                                            <p className="text-lg font-bold text-purple-900 mt-1 truncate">
                                                {routeResult.kurir.nama_kurir}
                                            </p>
                                            <p className="text-xs text-purple-600 mt-1">ditugaskan</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                                            {routeResult.kurir.nama_kurir.charAt(0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Route Details */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Urutan Pengiriman</h3>
                                <div className="space-y-3">
                                    {routeResult.ordered_deliveries.map((delivery, index) => (
                                        <div
                                            key={delivery.id_kirim}
                                            className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{delivery.nama_penerima}</p>
                                                <p className="text-sm text-gray-600 mt-1">{delivery.alamat_penerima}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    📍 {delivery.latitude_kirim.toFixed(6)}, {delivery.longitude_kirim.toFixed(6)}
                                                </p>
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

                            {/* Route Segments Table */}
                            {routeResult.route_segments && routeResult.route_segments.length > 0 && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Segmen Rute</h3>
                                    <div className="overflow-x-auto">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Arc</th>
                                                    <th>Dari</th>
                                                    <th>Ke</th>
                                                    <th className="text-right">Jarak (km)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {routeResult.route_segments.map((segment, index) => (
                                                    <tr key={index}>
                                                        <td className="font-mono">({segment.from}, {segment.to})</td>
                                                        <td className="text-sm">{segment.from_name}</td>
                                                        <td className="text-sm">{segment.to_name}</td>
                                                        <td className="text-right font-medium">{segment.distance.toFixed(3)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-primary-50 font-bold">
                                                    <td colSpan={3} className="text-right">Total Jarak</td>
                                                    <td className="text-right text-primary-600">
                                                        {routeResult.total_distance.toFixed(3)} km
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Distance Matrix */}
                            {routeResult.distance_matrix && routeResult.distance_matrix.labels && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Matriks Jarak</h3>
                                    <div className="overflow-x-auto">
                                        <table className="table text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="bg-gray-100"></th>
                                                    {routeResult.distance_matrix.labels.map((label) => (
                                                        <th key={label} className="bg-gray-100 text-center font-mono">
                                                            {label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {routeResult.distance_matrix.matrix.map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="bg-gray-100 font-mono font-bold">
                                                            {routeResult.distance_matrix!.labels[i]}
                                                        </td>
                                                        {row.map((distance, j) => (
                                                            <td
                                                                key={j}
                                                                className={`text-center font-mono ${i === j ? 'bg-gray-200 font-bold' : ''
                                                                    }`}
                                                            >
                                                                {distance === 0 ? '0' : distance.toFixed(3)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        * Jarak dalam kilometer, dihitung menggunakan Google Maps Distance Matrix API
                                    </p>
                                </div>
                            )}
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
