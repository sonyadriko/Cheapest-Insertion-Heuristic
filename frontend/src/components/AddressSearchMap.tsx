import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { FiMapPin, FiSearch } from 'react-icons/fi';

interface AddressSearchMapProps {
    onLocationSelect: (location: {
        address: string;
        lat: number;
        lng: number;
    }) => void;
    initialLocation?: { lat: number; lng: number };
    initialAddress?: string;
}

const AddressSearchMap: React.FC<AddressSearchMapProps> = ({
    onLocationSelect,
    initialLocation,
    initialAddress = '',
}) => {
    const [markerPosition, setMarkerPosition] = useState(
        initialLocation || { lat: -6.2088, lng: 106.8456 } // Default: Jakarta
    );
    const [selectedAddress, setSelectedAddress] = useState(initialAddress);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const mapContainerStyle = {
        width: '100%',
        height: '400px',
        borderRadius: '0.5rem',
    };

    const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
        setAutocomplete(autocomplete);
    }, []);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();

            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || '';

                setMarkerPosition({ lat, lng });
                setSelectedAddress(address);
                onLocationSelect({ address, lat, lng });

                // Pan map to new location
                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(15);
                }
            }
        }
    };

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            setMarkerPosition({ lat, lng });

            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address;
                    setSelectedAddress(address);
                    onLocationSelect({ address, lat, lng });
                } else {
                    // If reverse geocoding fails, still use coordinates
                    setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    onLocationSelect({ address: '', lat, lng });
                }
            });
        }
    }, [onLocationSelect]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiSearch className="inline mr-2" />
                    Cari Alamat
                </label>
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                    <input
                        type="text"
                        placeholder="Ketik alamat atau nama tempat..."
                        className="input-field"
                    />
                </Autocomplete>
                <p className="text-xs text-gray-500 mt-1">
                    Atau klik pada peta untuk memilih lokasi
                </p>
            </div>

            {/* Map */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={13}
                    onClick={onMapClick}
                    onLoad={onMapLoad}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                    }}
                >
                    <Marker
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={(e) => {
                            if (e.latLng) {
                                onMapClick({ latLng: e.latLng } as google.maps.MapMouseEvent);
                            }
                        }}
                    />
                </GoogleMap>
            </div>

            {/* Selected Location Info */}
            {selectedAddress && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <FiMapPin className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">Lokasi Terpilih</p>
                            <p className="text-sm text-green-700 mt-1">{selectedAddress}</p>
                            <p className="text-xs text-green-600 mt-1">
                                Koordinat: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressSearchMap;
