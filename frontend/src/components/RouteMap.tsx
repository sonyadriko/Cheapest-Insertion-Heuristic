import React from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

interface Delivery {
    id: number;
    nama_penerima: string;
    alamat_penerima: string;
    lat: number;
    lng: number;
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

const RouteMap: React.FC<RouteMapProps> = ({ deliveries, depot }) => {
    if (deliveries.length === 0) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">No delivery locations to display</p>
            </div>
        );
    }

    // Calculate center of map (include depot if available)
    const allPoints = depot
        ? [depot, ...deliveries]
        : deliveries;

    const center = {
        lat: allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length,
        lng: allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length,
    };

    // Create path for polyline (depot -> deliveries -> back to depot)
    const path = depot
        ? [{ lat: depot.lat, lng: depot.lng }, ...deliveries.map((d) => ({ lat: d.lat, lng: d.lng })), { lat: depot.lat, lng: depot.lng }]
        : deliveries.map((d) => ({ lat: d.lat, lng: d.lng }));

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
                    position={{ lat: depot.lat, lng: depot.lng }}
                    label={{
                        text: '🏠',
                        fontSize: '24px',
                    }}
                    title={`Depot: ${depot.nama}`}
                />
            )}

            {/* Delivery Markers */}
            {deliveries.map((delivery, index) => (
                <Marker
                    key={delivery.id}
                    position={{ lat: delivery.lat, lng: delivery.lng }}
                    label={{
                        text: (index + 1).toString(),
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                    title={`${index + 1}. ${delivery.nama_penerima}`}
                />
            ))}

            {/* Route Polyline */}
            <Polyline
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
