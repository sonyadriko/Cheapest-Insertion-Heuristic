import React from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

interface Delivery {
    id: number;
    nama_penerima: string;
    alamat_penerima: string;
    lat: number;
    lng: number;
}

interface RouteMapProps {
    deliveries: Delivery[];
}

const RouteMap: React.FC<RouteMapProps> = ({ deliveries }) => {
    if (deliveries.length === 0) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">No delivery locations to display</p>
            </div>
        );
    }

    // Calculate center of map
    const center = {
        lat: deliveries.reduce((sum, d) => sum + d.lat, 0) / deliveries.length,
        lng: deliveries.reduce((sum, d) => sum + d.lng, 0) / deliveries.length,
    };

    // Create path for polyline
    const path = deliveries.map((d) => ({ lat: d.lat, lng: d.lng }));

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
            {/* Markers */}
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
