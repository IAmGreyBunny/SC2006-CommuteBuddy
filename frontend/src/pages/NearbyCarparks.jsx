import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import "./NearbyCarparks.css";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

export default function NearbyCarparks() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const autocompleteRef = useRef(null);

  // Load Google Maps API with Places library
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"], //we are gna use our own key right so << to replace >>
  });

  // Get user location when page loads
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => alert("Location access denied.")
    );
  }, []);

  // Handle place selection from autocomplete
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setSelectedPlace(newLocation);
      setCurrentPosition(newLocation);
    }
  };

  if (!isLoaded || !currentPosition) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={14}
      >
        <Marker position={currentPosition} />
      </GoogleMap>

      <div className="location-card">
        <span className="location-icon">📍</span>
        <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={handlePlaceChanged}>
          <input
            type="text"
            placeholder="Enter a location"
            className="location-input"
          />
        </Autocomplete>
      </div>

      {/* Bottom navigation */}
      <div className="bottom-nav">
        <div className="nav-item active">
          🚗 <span>Car</span>
        </div>
        <div className="nav-item">
          🚌 <span>Bus</span>
        </div>
        <div className="nav-item">
          🚆 <span>Train</span>
        </div>
      </div>
    </div>
  );
}
