import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { motion, useMotionValue } from "framer-motion";
import "./NearbyCarparks.css";

const containerStyle = { width: "100%", height: "100vh" };
const CARPARK_URL = "http://localhost:8000/api/carpark/get_carpark_list/";

export default function NearbyCarparks() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [carparks, setCarparks] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [availableFilter, setAvailableFilter] = useState(0);
  const [totalFilter, setTotalFilter] = useState(0);
  const [confirmedAvailable, setConfirmedAvailable] = useState(0);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [selectedMode, setSelectedMode] = useState("car");

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
    version: "weekly",
  });

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Location access denied.")
    );
  }, []);

  // Fetch carpark data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(CARPARK_URL);
        const data = await res.json();

        console.log("Raw API response:", data);

        if (data.length > 0) {
          const flattened = data[0].carparks.map((c) => ({
            id: c.id,
            name: c.name,
            lat: parseFloat(c.lat),
            lng: parseFloat(c.lng),
            available: c.availability[0]?.available_lots || 0,
            total: c.availability[0]?.total_lots || 1,
          }));

          console.log("Processed carparks:", flattened);
          setCarparks(flattened);
        }
      } catch (error) {
        console.error("Error fetching carpark data:", error);
      }
    }

    fetchData();
  }, []);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const newLoc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setSelectedPlace(newLoc);
      setCurrentPosition(newLoc);
    }
  };

  if (!isLoaded || !currentPosition) {
    return <div className="loading">Loading map...</div>;
  }

  const getMarkerColor = (ratio) =>
    ratio < 0.2 ? "#ab3030" : ratio < 0.5 ? "#e3ba27" : "#2f7040";

  // Apply confirmed filters
  const filteredCarparks = carparks.filter(
    (c) => c.available >= confirmedAvailable && c.total >= confirmedTotal
  );

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={14}
        onLoad={(map) => {
          mapRef.current = map;
          const bounds = new window.google.maps.LatLngBounds();
          filteredCarparks.forEach((c) => {
            if (!isNaN(c.lat) && !isNaN(c.lng)) {
              bounds.extend({ lat: c.lat, lng: c.lng });
            }
          });
          bounds.extend(currentPosition);
          map.fitBounds(bounds);
        }}
      >
        {filteredCarparks.map((c) => {
          const ratio = c.available / c.total;
          const color = getMarkerColor(ratio);
          return (
            <Marker
              key={c.id}
              position={{ lat: c.lat, lng: c.lng }}
              label={{
                text: `${c.available}`,
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 0.9,
                strokeColor: "white",
                strokeWeight: 2,
                scale: 20,
              }}
            />
          );
        })}
        <Marker position={currentPosition} />
      </GoogleMap>

      <div className="location-card">
        <span className="location-icon">📍</span>
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            type="text"
            placeholder="Enter a location"
            className="location-input"
          />
        </Autocomplete>
      </div>

      <BottomSheet
        availableFilter={availableFilter}
        setAvailableFilter={setAvailableFilter}
        totalFilter={totalFilter}
        setTotalFilter={setTotalFilter}
        confirmedAvailable={confirmedAvailable}
        setConfirmedAvailable={setConfirmedAvailable}
        confirmedTotal={confirmedTotal}
        setConfirmedTotal={setConfirmedTotal}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
      />
    </div>
  );
}

function BottomSheet({
  availableFilter,
  setAvailableFilter,
  totalFilter,
  setTotalFilter,
  confirmedAvailable,
  setConfirmedAvailable,
  confirmedTotal,
  setConfirmedTotal,
  selectedMode,
  setSelectedMode,
}) {
  const y = useMotionValue(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleConfirm = () => {
    setConfirmedAvailable(availableFilter);
    setConfirmedTotal(totalFilter);
    setIsExpanded(false);
  };

  return (
    <motion.div
      className="bottom-sheet"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      style={{ y }}
      onDragEnd={(e, info) => {
        if (info.offset.y < -100) setIsExpanded(true);
        else setIsExpanded(false);
      }}
      animate={{ y: isExpanded ? 0 : 0 }}
      transition={{ type: "spring", stiffness: 0, damping: 30 }}
    >
      <div className="sheet-handle" />

      <div className="transport-nav">
        {["car", "bus", "train"].map((mode) => (
          <div
            key={mode}
            className={`nav-item ${selectedMode === mode ? "active" : ""}`}
            onClick={() => setSelectedMode(mode)}
          >
            {mode === "car" && "🚗"}
            {mode === "bus" && "🚌"}
            {mode === "train" && "🚆"}
            <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
          </div>
        ))}
      </div>

      {isExpanded && (
        <div className="filter-section">
          <h3>Filter</h3>
          <label>Available Lots: {availableFilter}+</label>
          <input
            type="range"
            min="0"
            max="200"
            value={availableFilter}
            onChange={(e) => setAvailableFilter(Number(e.target.value))}
          />

          <label>Total Lots: {totalFilter}+</label>
          <input
            type="range"
            min="0"
            max="300"
            value={totalFilter}
            onChange={(e) => setTotalFilter(Number(e.target.value))}
          />

          <button className="confirm-btn" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      )}
    </motion.div>
  );
}
