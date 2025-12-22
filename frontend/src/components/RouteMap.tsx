import React from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

interface Delivery {
    id_kirim: number;
    nama_penerima: string;
    alamat_penerima: string;
    latitude_kirim: number;
    longitude_kirim: number;
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
        ? [depot, ...deliveries.map(d => ({ lat: d.latitude_kirim, lng: d.longitude_kirim }))]
        : deliveries.map(d => ({ lat: d.latitude_kirim, lng: d.longitude_kirim }));

    const center = {
        lat: allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length,
        lng: allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length,
    };

    // Create path for polyline (depot -> deliveries -> back to depot)
    const path = depot
        ? [
            { lat: depot.lat, lng: depot.lng },
            ...deliveries.map((d) => ({ lat: d.latitude_kirim, lng: d.longitude_kirim })),
            { lat: depot.lat, lng: depot.lng }
        ]
        : deliveries.map((d) => ({ lat: d.latitude_kirim, lng: d.longitude_kirim }));

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
                    key={`delivery-${delivery.id_kirim}`}
                    position={{ lat: delivery.latitude_kirim, lng: delivery.longitude_kirim }}
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
