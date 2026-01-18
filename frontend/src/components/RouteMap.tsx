import React from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

interface Delivery {
    id_kirim: number;
    nama_penerima: string;
    alamat_penerima: string;
    latitude_kirim: number | string;
    longitude_kirim: number | string;
}

interface DepotLocation {
    lat: number;
    lng: number;
    nama: string;
}

interface RouteMapProps {
    deliveries: Delivery[];
    depot?: DepotLocation;
}

// Helper function to safely convert to number
const toNumber = (val: number | string | undefined): number => {
    if (val === undefined || val === null) return 0;
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(num) ? 0 : num;
};

const RouteMap: React.FC<RouteMapProps> = ({ deliveries, depot }) => {
    if (deliveries.length === 0) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">No delivery locations to display</p>
            </div>
        );
    }

    // Convert delivery coordinates to numbers
    const deliveryPoints = deliveries.map(d => ({
        lat: toNumber(d.latitude_kirim),
        lng: toNumber(d.longitude_kirim),
        id: d.id_kirim,
        nama: d.nama_penerima
    }));

    // Calculate center of map (include depot if available)
    const allPoints = depot
        ? [
            { lat: Number(depot.lat), lng: Number(depot.lng) },
            ...deliveries.map(d => ({ lat: Number(d.latitude_kirim), lng: Number(d.longitude_kirim) }))
        ]
        : deliveries.map(d => ({ lat: Number(d.latitude_kirim), lng: Number(d.longitude_kirim) }));

    // Filter out invalid points
    const validPoints = allPoints.filter(p => !isNaN(p.lat) && !isNaN(p.lng));

    const center = validPoints.length > 0 ? {
        lat: validPoints.reduce((sum, p) => sum + p.lat, 0) / validPoints.length,
        lng: validPoints.reduce((sum, p) => sum + p.lng, 0) / validPoints.length,
    } : { lat: -6.2, lng: 106.8 }; // Default fallback

    // Create path for polyline
    const path = depot
        ? [
            { lat: Number(depot.lat), lng: Number(depot.lng) },
            ...deliveries.map((d) => ({ lat: Number(d.latitude_kirim), lng: Number(d.longitude_kirim) })),
            { lat: Number(depot.lat), lng: Number(depot.lng) }
        ]
        : deliveries.map((d) => ({ lat: Number(d.latitude_kirim), lng: Number(d.longitude_kirim) }));

    const mapContainerStyle = {
        width: '100%',
        height: '500px',
        borderRadius: '0.5rem',
    };

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
            }}
        >
            {/* Depot Marker (Home/Start Point) */}
            {depot && (
                <Marker
                    key="depot"
                    position={{ lat: Number(depot.lat), lng: Number(depot.lng) }}
                    label={{
                        text: '🏠',
                        fontSize: '24px',
                    }}
                    title={`Depot: ${depot.nama}`}
                />
            )}

            {/* Delivery Markers */}
            {deliveryPoints.map((point, index) => (
                <Marker
                    key={`delivery-${point.id}`}
                    position={{ lat: point.lat, lng: point.lng }}
                    label={{
                        text: (index + 1).toString(),
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                    title={`${index + 1}. ${point.nama}`}
                />
            ))}

            {/* Route Polyline */}
            <Polyline
                key="route-path"
                path={path}
                options={{
                    strokeColor: '#0284c7',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                }}
            />
        </GoogleMap>
    );
};

export default RouteMap;

