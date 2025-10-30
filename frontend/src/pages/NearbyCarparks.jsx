import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  Circle,
} from "@react-google-maps/api";
import { motion, useMotionValue } from "framer-motion";
import "./NearbyCarparks.css";

const containerStyle = { width: "100%", height: "100vh" };
const BASE_URL = "http://localhost:8000/api/carpark/get_carpark_in_bound/";

export default function NearbyCarparks() {
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

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
    version: "weekly",
  });

  // Fetch carparks within map bounds
  const fetchCarparksInBounds = useCallback(async (bounds) => {
    const { ne_lat, ne_lng, sw_lat, sw_lng } = bounds;
    try {
      const url = `${BASE_URL}?ne_lat=${ne_lat}&ne_lng=${ne_lng}&sw_lat=${sw_lat}&sw_lng=${sw_lng}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        const flattened = data[0].carparks.map((c) => ({
          id: c.id,
          name: c.name,
          lat: parseFloat(c.lat),
          lng: parseFloat(c.lng),
          available: c.availability?.[0]?.available_lots || 0,
          total: c.availability?.[0]?.total_lots || 1,
        }));
        setCarparks(flattened);
        setVisibleCarparks(flattened);
      } else {
        setCarparks([]);
        setVisibleCarparks([]);
      }
    } catch (error) {
      console.error("Error fetching carparks in bounds:", error);
    }
  }, []);

  // Calculate bounds from center + radius
  const fetchCarparksByRadius = useCallback(() => {
    if (!mapRef.current || !currentPosition) return;

    const center = currentPosition;
    const radiusInMeters = confirmedRadius * 1000;

    const ne = {
      lat: center.lat + radiusInMeters / 111320,
      lng:
        center.lng +
        radiusInMeters / (111320 * Math.cos((center.lat * Math.PI) / 180)),
    };

    const sw = {
      lat: center.lat - radiusInMeters / 111320,
      lng:
        center.lng -
        radiusInMeters / (111320 * Math.cos((center.lat * Math.PI) / 180)),
    };

    fetchCarparksInBounds({
      ne_lat: ne.lat,
      ne_lng: ne.lng,
      sw_lat: sw.lat,
      sw_lng: sw.lng,
    });
  }, [confirmedRadius, currentPosition, fetchCarparksInBounds]);

  // When user searches for a place
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const newLoc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCurrentPosition(newLoc);

      if (mapRef.current) {
        mapRef.current.panTo(newLoc);
        mapRef.current.setZoom(15);
      }
    }
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Refetch when radius or confirmed filters change
  useEffect(() => {
    fetchCarparksByRadius();
  }, [confirmedRadius, confirmedAvailable, confirmedTotal, fetchCarparksByRadius]);

  // Refetch when map bounds change (drag or zoom)
  const onBoundsChanged = () => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    fetchCarparksInBounds({
      ne_lat: ne.lat(),
      ne_lng: ne.lng(),
      sw_lat: sw.lat(),
      sw_lng: sw.lng(),
    });
  };

  if (!isLoaded) return <div className="loading">Loading map...</div>;

  const getMarkerColor = (ratio) =>
    ratio < 0.2 ? "#B22222" : ratio < 0.5 ? "#FF8C00" : "#006400";

  const filteredCarparks = visibleCarparks.filter(
    (c) => c.available >= confirmedAvailable && c.total >= confirmedTotal
  );

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || { lat: 1.3521, lng: 103.8198 }}
        zoom={currentPosition ? 14 : 12}
        onLoad={onMapLoad}
        onDragEnd={onBoundsChanged}
        onZoomChanged={onBoundsChanged}
      >
        {/* Carpark Markers */}
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

        {/* User Marker + radius */}
        {currentPosition && (
          <>
            <Marker position={currentPosition} />
            <Circle
              center={currentPosition}
              radius={confirmedRadius * 1000}
              options={{
                fillColor: "#0095FF33",
                strokeColor: "#0095FF",
                strokeOpacity: 0.8,
                fillOpacity: 0.15,
              }}
            />
          </>
        )}
      </GoogleMap>

      {/* Search bar */}
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

      {/* Bottom filter sheet */}
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

// Filters
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
  selectedMode,
  setSelectedMode,
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

 
// viewport implem
// import React, { useEffect, useState, useRef } from "react";
// import {
//   GoogleMap,
//   useJsApiLoader,
//   Marker,
//   Autocomplete,
//   Circle,
// } from "@react-google-maps/api";
// import { motion, useMotionValue } from "framer-motion";
// import { debounce } from "lodash";
// import "./NearbyCarparks.css";

// const containerStyle = { width: "100%", height: "100vh" };
// const BASE_URL = "http://localhost:8000/api/carpark/get_carpark_in_bound/";

// export default function NearbyCarparks() {
//   const [currentPosition, setCurrentPosition] = useState(null);
//   const [carparks, setCarparks] = useState([]);
//   const [visibleCarparks, setVisibleCarparks] = useState([]);
//   const [availableFilter, setAvailableFilter] = useState(0);
//   const [totalFilter, setTotalFilter] = useState(0);
//   const [confirmedAvailable, setConfirmedAvailable] = useState(0);
//   const [confirmedTotal, setConfirmedTotal] = useState(0);
//   const [searchRadius, setSearchRadius] = useState(2);
//   const [confirmedRadius, setConfirmedRadius] = useState(2);
//   const [selectedMode, setSelectedMode] = useState("car");

//   const autocompleteRef = useRef(null);
//   const mapRef = useRef(null);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//     libraries: ["places"],
//     version: "weekly",
//   });

//   // Fetch carparks within map bounds
//   async function fetchCarparksInBounds(bounds) {
//     const { ne_lat, ne_lng, sw_lat, sw_lng } = bounds;
//     try {
//       const url = `${BASE_URL}?ne_lat=${ne_lat}&ne_lng=${ne_lng}&sw_lat=${sw_lat}&sw_lng=${sw_lng}`;
//       const res = await fetch(url);
//       const data = await res.json();

//       if (data.length > 0) {
//         const flattened = data[0].carparks.map((c) => ({
//           id: c.id,
//           name: c.name,
//           lat: parseFloat(c.lat),
//           lng: parseFloat(c.lng),
//           available: c.availability?.[0]?.available_lots || 0,
//           total: c.availability?.[0]?.total_lots || 1,
//         }));
//         setCarparks(flattened);
//         setVisibleCarparks(flattened);
//       } else {
//         setCarparks([]);
//         setVisibleCarparks([]);
//       }
//     } catch (error) {
//       console.error("Error fetching carparks in bounds:", error);
//     }
//   }

//   // Debounced fetch to prevent too many API calls on map drag/zoom
//   const fetchCarparksDebounced = useRef(
//     debounce((bounds) => fetchCarparksInBounds(bounds), 500)
//   ).current;

//   // When user searches for a place
//   const handlePlaceChanged = () => {
//     const place = autocompleteRef.current.getPlace();
//     if (place && place.geometry) {
//       const newLoc = {
//         lat: place.geometry.location.lat(),
//         lng: place.geometry.location.lng(),
//       };
//       setCurrentPosition(newLoc);

//       if (mapRef.current) {
//         mapRef.current.panTo(newLoc);
//         mapRef.current.setZoom(15);

//         // Fetch carparks after search
//         const mapBounds = mapRef.current.getBounds();
//         if (mapBounds) {
//           const ne = mapBounds.getNorthEast();
//           const sw = mapBounds.getSouthWest();
//           fetchCarparksInBounds({
//             ne_lat: ne.lat(),
//             ne_lng: ne.lng(),
//             sw_lat: sw.lat(),
//             sw_lng: sw.lng(),
//           });
//         }
//       }
//     }
//   };

//   const onMapLoad = (map) => {
//     mapRef.current = map;
//   };

//   // Marker color based on availability ratio
//   const getMarkerColor = (ratio) =>
//     ratio < 0.2 ? "#B22222" : ratio < 0.5 ? "#FF8C00" : "#006400";

//   const filteredCarparks = visibleCarparks.filter(
//     (c) => c.available >= confirmedAvailable && c.total >= confirmedTotal
//   );

//   if (!isLoaded) return <div className="loading">Loading map...</div>;

//   return (
//     <div className="map-container">
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={currentPosition || { lat: 1.3521, lng: 103.8198 }}
//         zoom={currentPosition ? 14 : 12}
//         onLoad={onMapLoad}
//         onIdle={() => {
//           if (mapRef.current) {
//             const bounds = mapRef.current.getBounds();
//             if (bounds) {
//               const ne = bounds.getNorthEast();
//               const sw = bounds.getSouthWest();
//               fetchCarparksDebounced({
//                 ne_lat: ne.lat(),
//                 ne_lng: ne.lng(),
//                 sw_lat: sw.lat(),
//                 sw_lng: sw.lng(),
//               });
//             }
//           }
//         }}
//       >
//         {/* Carpark Markers */}
//         {filteredCarparks.map((c) => {
//           const ratio = c.available / c.total;
//           const color = getMarkerColor(ratio);
//           return (
//             <Marker
//               key={c.id}
//               position={{ lat: c.lat, lng: c.lng }}
//               label={{
//                 text: `${c.available}`,
//                 color: "white",
//                 fontWeight: "bold",
//                 fontSize: "14px",
//               }}
//               icon={{
//                 path: google.maps.SymbolPath.CIRCLE,
//                 fillColor: color,
//                 fillOpacity: 0.9,
//                 strokeColor: "white",
//                 strokeWeight: 2,
//                 scale: 20,
//               }}
//             />
//           );
//         })}

//         {/* User Marker + radius */}
//         {currentPosition && (
//           <>
//             <Marker position={currentPosition} />
//             <Circle
//               center={currentPosition}
//               radius={confirmedRadius * 1000}
//               options={{
//                 fillColor: "#0095FF33",
//                 strokeColor: "#0095FF",
//                 strokeOpacity: 0.8,
//                 fillOpacity: 0.15,
//               }}
//             />
//           </>
//         )}
//       </GoogleMap>

//       {/* Search bar */}
//       <div className="location-card">
//         <span className="location-icon">📍</span>
//         <Autocomplete
//           onLoad={(ref) => (autocompleteRef.current = ref)}
//           onPlaceChanged={handlePlaceChanged}
//         >
//           <input
//             type="text"
//             placeholder="Enter a location"
//             className="location-input"
//           />
//         </Autocomplete>
//       </div>

//       {/* Bottom filter sheet */}
//       <BottomSheet
//         availableFilter={availableFilter}
//         setAvailableFilter={setAvailableFilter}
//         totalFilter={totalFilter}
//         setTotalFilter={setTotalFilter}
//         confirmedAvailable={confirmedAvailable}
//         setConfirmedAvailable={setConfirmedAvailable}
//         confirmedTotal={confirmedTotal}
//         setConfirmedTotal={setConfirmedTotal}
//         searchRadius={searchRadius}
//         setSearchRadius={setSearchRadius}
//         confirmedRadius={confirmedRadius}
//         setConfirmedRadius={setConfirmedRadius}
//         selectedMode={selectedMode}
//         setSelectedMode={setSelectedMode}
//       />
//     </div>
//   );
// }

// // Filters BottomSheet
// function BottomSheet({
//   availableFilter,
//   setAvailableFilter,
//   totalFilter,
//   setTotalFilter,
//   confirmedAvailable,
//   setConfirmedAvailable,
//   confirmedTotal,
//   setConfirmedTotal,
//   searchRadius,
//   setSearchRadius,
//   confirmedRadius,
//   setConfirmedRadius,
//   selectedMode,
//   setSelectedMode,
// }) {
//   const y = useMotionValue(0);
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleConfirm = () => {
//     setConfirmedAvailable(availableFilter);
//     setConfirmedTotal(totalFilter);
//     setConfirmedRadius(searchRadius);
//     setIsExpanded(false);
//   };

//   return (
//     <motion.div
//       className="bottom-sheet"
//       drag="y"
//       dragConstraints={{ top: 0, bottom: 0 }}
//       style={{ y }}
//       onDragEnd={(e, info) => {
//         if (info.offset.y < -100) setIsExpanded(true);
//         else setIsExpanded(false);
//       }}
//       animate={{ y: isExpanded ? 0 : 0 }}
//       transition={{ type: "spring", stiffness: 0, damping: 30 }}
//     >
//       <div className="sheet-handle" />

//       <div className="transport-nav">
//         {["car", "bus", "train"].map((mode) => (
//           <div
//             key={mode}
//             className={`nav-item ${selectedMode === mode ? "active" : ""}`}
//             onClick={() => setSelectedMode(mode)}
//           >
//             {mode === "car" && "🚗"}
//             {mode === "bus" && "🚌"}
//             {mode === "train" && "🚆"}
//             <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
//           </div>
//         ))}
//       </div>

//       {isExpanded && (
//         <div className="filter-section">
//           <h3>Filter</h3>

//           <label>Available Lots: {availableFilter}+</label>
//           <input
//             type="range"
//             min="0"
//             max="200"
//             value={availableFilter}
//             onChange={(e) => setAvailableFilter(Number(e.target.value))}
//           />

//           <label>Total Lots: {totalFilter}+</label>
//           <input
//             type="range"
//             min="0"
//             max="300"
//             value={totalFilter}
//             onChange={(e) => setTotalFilter(Number(e.target.value))}
//           />

//           <label>Search Radius: {searchRadius} km</label>
//           <input
//             type="range"
//             min="1"
//             max="5"
//             step="0.5"
//             value={searchRadius}
//             onChange={(e) => setSearchRadius(Number(e.target.value))}
//           />

//           <button className="confirm-btn" onClick={handleConfirm}>
//             Confirm
//           </button>
//         </div>
//       )}
//     </motion.div>
//   );
// }

