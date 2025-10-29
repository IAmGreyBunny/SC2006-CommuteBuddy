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
// const AVAILABILITY_URL = "https://api.data.gov.sg/v1/transport/carpark-availability";
// const INFO_URL =
//   "https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09";
  const CARPARK_URL = "http://localhost:8000/api/carpark/get_carpark_list/";


export default function NearbyCarparks() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [carparks, setCarparks] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [availableFilter, setAvailableFilter] = useState(0);
  const [selectedMode, setSelectedMode] = useState("car");

  const autocompleteRef = useRef(null);
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

  // Fetch carpark data from API directly
  /*useEffect(() => {
    async function fetchData() {
      const [availabilityRes, infoRes] = await Promise.all([
        fetch(AVAILABILITY_URL, {
          headers: {
            "X-Api-Key":
              "v2:d02822dfdefd6bb28a284e21831b6a31633cb602c58b3daa8f92edd1cef8bad3:wgpuCpP5HYmJlLy_Vys2HiEREkGbROQ4",
          },
        }),
        fetch(INFO_URL),
      ]);
  */

  // Fetch carpark data from framework
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(CARPARK_URL);
        const data = await res.json();
  
        setCarparks(data);
      } catch (error) {
        console.error("Error fetching carpark data:", error);
      }
    }
  
    fetchData();
  }, []);  


      // const availabilityData = await availabilityRes.json();
      // const infoData = await infoRes.json();

    /*const infoMap = {};
      infoData.result.records.forEach((rec) => {
        infoMap[rec.car_park_no] = rec;
      });

      const merged = availabilityData.items[0].carpark_data.map((item, idx) => {
        const lots = item.carpark_info[0];
        return {
          id: item.carpark_number || `cp-${idx}`,
          available: parseInt(lots.lots_available),
          total: parseInt(lots.total_lots),
          // temporary random test coordinates
          lat: 1.35 + Math.random() * 0.01,
          lng: 103.82 + Math.random() * 0.01,
        };
      });      

      setCarparks(merged); 
    }

    fetchData();
  }, []); */


  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const newLoc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setSelectedPlace(newLoc);
      setCurrentPosition(newLoc); //moves map to new location
    }
  };

  if (!isLoaded || !currentPosition) {
    return <div className="loading">Loading map...</div>;
  }

  //<<markers>> works!!
// Red → if < 20% lots available
// Yellow → if 20–50% available
// Green → if > 50% available
  const getMarkerColor = (ratio) =>
    ratio < 0.2 ? "red" : ratio < 0.5 ? "yellow" : "green";

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={14}
      >
        {carparks.map((c) => {
          const ratio = c.available / c.total;
          const color = getMarkerColor(ratio);
          return (
            <Marker
              key={c.id}
              position={{
                lat: c.lat,   // used stored lat/lng instead of random values here
                lng: c.lng,
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 0.8,
                strokeColor: "white",
                strokeWeight: 1,
                scale: 10,
              }}
            />
          );
        })}
        <Marker position={currentPosition} />
      </GoogleMap>
  

      <div className="location-card">
        <span className="location-icon">📍</span>

        {/* autocomplete function */}
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input type="text" placeholder="Enter a location" className="location-input" />
        </Autocomplete>
      </div>

      <BottomSheet
        availableFilter={availableFilter}
        setAvailableFilter={setAvailableFilter}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
      />
    </div>
  );
}

function BottomSheet({ availableFilter, setAvailableFilter, selectedMode, setSelectedMode }) {
  const y = useMotionValue(0);
  const [isExpanded, setIsExpanded] = useState(false);

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
            onChange={(e) => setAvailableFilter(e.target.value)}
          />
          <label>Gantry Height: 1.8m+</label>
          <input type="range" min="1" max="3" step="0.1" defaultValue="1.8" />
          <label>Car Park Type:</label>
          <div className="checkbox-group">
            <label><input type="checkbox" /> Multi-Storey</label>
            <label><input type="checkbox" defaultChecked /> Surface</label>
            <label><input type="checkbox" /> Basement</label>
          </div>
        </div>
      )}
    </motion.div>
  );
}
