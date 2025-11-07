import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  Circle,
} from "@react-google-maps/api";
import { motion, useMotionValue } from "framer-motion";
import "./NearbyCarparks.css";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { FaCar, FaBus, FaTrainSubway } from "react-icons/fa6";
import api from "../api";

const containerStyle = { width: "100%", height: "100vh" };
const BASE_URL =
  "http://localhost:8000/api/carpark/get_carpark_within_radius/";

export default function NearbyCarparks() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPosition, setCurrentPosition] = useState(null);
  const [carparks, setCarparks] = useState([]);
  const [visibleCarparks, setVisibleCarparks] = useState([]);
  const [availableFilter, setAvailableFilter] = useState(0);
  const [totalFilter, setTotalFilter] = useState(0);
  const [confirmedAvailable, setConfirmedAvailable] = useState(0);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [searchRadius, setSearchRadius] = useState(2);
  const [confirmedRadius, setConfirmedRadius] = useState(2);
  const [selectedMode, setSelectedMode] = useState("car");
  const [selectedCarpark, setSelectedCarpark] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const circleRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
    version: "weekly",
  });

  useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const initialLoc = { lat: latitude, lng: longitude };
        setCurrentPosition(initialLoc);
        mapRef.current?.panTo(initialLoc);
        mapRef.current?.setZoom(15);
        fetchCarparksNearby(initialLoc);
      },
      (err) => {
        console.error("Error getting current location:", err);
        // fallback to Singapore center if permission denied
        const fallback = { lat: 1.3521, lng: 103.8198 };
        setCurrentPosition(fallback);
      }
    );
  } else {
    console.error("Geolocation not supported by this browser.");
    const fallback = { lat: 1.3521, lng: 103.8198 };
    setCurrentPosition(fallback);
  }
}, [isLoaded]);
  useEffect(() => {
  if (!mapRef.current || !currentPosition) return;

  // Remove old circle if exists
  if (circleRef.current) {
    circleRef.current.setMap(null);
  }

  // Create a new circle
  const newCircle = new window.google.maps.Circle({
    map: mapRef.current,
    center: currentPosition,
    radius: confirmedRadius * 1000,
    strokeColor: "#0095FF33",
    fillColor: "#0095FF",
    fillOpacity: 0.15,
  });

  circleRef.current = newCircle;

  // Optional cleanup when unmounting
  return () => {
    newCircle.setMap(null);
  };
}, [currentPosition, confirmedRadius]);

  const fetchCarparksNearby = async (center) => {
    const { lat, lng } = center;
    const RADIUS = confirmedRadius * 1000;
    try {
      const url = `${BASE_URL}?center_lat=${lat}&center_lng=${lng}&radius=${RADIUS}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        const flattened = data.flatMap((source) =>
          source.carparks.map((c) => ({
            id: c.id,
            name: c.name,
            lat: parseFloat(c.lat),
            lng: parseFloat(c.lng),
            available: c.availability?.[0]?.available_lots || 0,
            total: c.availability?.[0]?.total_lots || 1,
          }))
        );
        setCarparks(flattened);
        setVisibleCarparks(flattened);
      } else {
        setCarparks([]);
        setVisibleCarparks([]);
      }
    } catch (error) {
      console.error("Error fetching carparks:", error);
    }
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const newLoc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCurrentPosition(newLoc);
      mapRef.current?.panTo(newLoc);
      mapRef.current?.setZoom(15);

      fetchCarparksNearby(newLoc);
    }
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const getMarkerColor = (ratio) =>
    ratio < 0.2 ? "#B22222" : ratio < 0.5 ? "#FF8C00" : "#006400";

  function getDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const filteredCarparks = visibleCarparks.filter((c) => {
    if (!currentPosition) return false;
    const distance = getDistanceKm(
      currentPosition.lat,
      currentPosition.lng,
      c.lat,
      c.lng
    );
    return (
      distance <= confirmedRadius &&
      c.available >= confirmedAvailable &&
      c.total >= confirmedTotal
    );
  });

  useEffect(() => {
    if (currentPosition && location.state?.newSourceAdded) {
      fetchCarparksNearby(currentPosition);
    }
  }, [location.state?.newSourceAdded]);

  if (!isLoaded) return <div className="loading">Loading map...</div>;

  return (
    <div className="map-container">
      <div className="top-buttons">
        <button className="back-home-btn" onClick={() => navigate("/home")}>
          ← Back to Home
        </button>
        <button
          className="add-source-btn"
          onClick={() =>
            navigate("/CarparkSourceForm", { state: { fromNearby: true } })
          }
        >
          + Add Carpark Source
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || { lat: 1.3521, lng: 103.8198 }}
        zoom={currentPosition ? 14 : 12}
        onLoad={onMapLoad}
      >
        {filteredCarparks.map((c) => {
          const ratio = c.available / c.total;
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
                fillColor: getMarkerColor(ratio),
                fillOpacity: 0.9,
                strokeColor: "white",
                strokeWeight: 2,
                scale: 20,
              }}
              onClick={() => {
                setSelectedCarpark(c);
                setShowModal(true);
              }}
            />
          );
        })}

        {currentPosition && <Marker position={currentPosition} />}
      </GoogleMap>

      {showModal && selectedCarpark && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Favourite Carpark</h3>
            <p>Do you want to add <strong>{selectedCarpark.name}</strong> to your favourites?</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm"
                onClick={async () => {
                  if (!selectedCarpark) return;

                  try {
                    console.log("Posting favourite:", selectedCarpark.id); //debug
                    await api.post("http://localhost:8000/api/carpark/add_favourite/", { carpark: selectedCarpark.id });

                    setShowModal(false);
                    alert(`${selectedCarpark.name} added to favourites!`);
                  } catch (err) {
                    console.error("Error adding favourite:", err.response?.data || err);

                    if (err.response?.status === 401) {
                      alert("You must log in to add favourites!");
                      navigate("/login"); 
                    } else if (err.response?.status === 400) {
                      alert("Bad request. Make sure this carpark is valid or not already in favourites.");
                    } else {
                      alert("An unexpected error occurred. Please try again.");
                    }
                  }
                }}
              >
                Add
              </button>


            </div>
          </div>
        </div>
      )}

      <div className="location-card"></div>
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
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
        confirmedRadius={confirmedRadius}
        setConfirmedRadius={setConfirmedRadius}
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
  searchRadius,
  setSearchRadius,
  confirmedRadius,
  setConfirmedRadius,
}) {
  const y = useMotionValue(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleConfirm = () => {
    setConfirmedAvailable(availableFilter);
    setConfirmedTotal(totalFilter);
    setConfirmedRadius(searchRadius);
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
    >
      <div className="sheet-handle" />

      <div className="transport-tabs">
        <NavLink to={"/NearbyCarparks"} 
        className="transport-tab transport-tab-active">
          <span className="tab-icon"><FaCar /></span>
          <span className="tab-label">Car</span>
        </NavLink>
        <NavLink to={"/LiveTracker"} 
        className="transport-tab">
          <span className="tab-icon"><FaBus /></span>
          <span className="tab-label">Bus</span>
        </NavLink>
        <NavLink
          to={"/CrowdDensity"}
          className="transport-tab"
        >
          <span className="tab-icon"><FaTrainSubway /></span>
          <span className="tab-label">Train</span>
        </NavLink>
      </div>

      {isExpanded && (
        <div className="filter-section">
          <h3>Filter Options</h3>

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

          <label>Search Radius: {searchRadius} km</label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
          />

          <button className="confirm-btn" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      )}
    </motion.div>
  );
}
