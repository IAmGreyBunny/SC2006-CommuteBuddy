// import { useState, useEffect, useRef, useCallback } from "react";
// import api from "../api";
// import "./LiveTracker.css";
// import { FaTrainSubway, FaBus, FaCar } from "react-icons/fa6";
// import { NavLink, useNavigate } from "react-router-dom";

// // Constants for display
// const homeLocation = { lat: 1.3491, lng: 103.7494 }; // Example: Bukit Batok area (NTU is ~1.3477, 103.6819)
// const BUS_ICON_URL = "/bus.svg"; // Assuming you have a bus.svg at the root or /src/assets/

// export default function LiveTracker() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [expandedStops, setExpandedStops] = useState({});
//   const [drawerHeight, setDrawerHeight] = useState(30);
//   const [isDragging, setIsDragging] = useState(false);
//   const [startY, setStartY] = useState(0);
//   const [nearbyBusStops, setNearbyBusStops] = useState([]);
//   const [selectedStopCode, setSelectedStopCode] = useState(null);
//   const [realTimeArrivals, setRealTimeArrivals] = useState({});
//   const [loadingStops, setLoadingStops] = useState(true);
//   const [loadingArrivals, setLoadingArrivals] = useState(false);
//   const [favorites, setFavorites] = useState([]); // To store user's bus stop favourites

//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markersRef = useRef([]);
//   const navigate = useNavigate();

//   // --- Helper functions ---

//   // Function to check if a stop is a favorite
//   const isFavorite = (stopCode) => favorites.some(fav => fav.route_id === stopCode && fav.route_type === 'bus');

//   // API: Fetch nearby bus stops (on load)
//   const fetchNearbyBusStops = useCallback(async () => {
//     setLoadingStops(true);
//     try {
//       // Using hardcoded NTU coordinates (latitude: 1.3483, longitude: 103.6831 - closer to South Spine)
//       // Or a central point like Jurong East: 1.3330, 103.7420
//       const lat = homeLocation.lat;
//       const lng = homeLocation.lng;
//       const radius = 1000; // 1km radius

//       const res = await api.get(`/api/nearby-bus-stops/?lat=${lat}&lng=${lng}&radius=${radius}`);
//       
//       if (res.data.success && res.data.stops) {
//         // Map the raw response to include required fields for the UI
//         const mappedStops = res.data.stops.map(stop => ({
//           code: stop.bus_stop_code,
//           name: stop.description || stop.road_name,
//           distance: `${(stop.distance * 1000).toFixed(0)} m`, // Convert km to meters
//           lat: stop.latitude,
//           lng: stop.longitude,
//           // Note: buses array will be fetched in another call (fetchBusArrivals)
//           buses: []
//         }));
//         setNearbyBusStops(mappedStops);
//         initializeMarkers(mappedStops);
//       } else {
//         console.error("Failed to fetch nearby bus stops:", res.data.error);
//       }
//     } catch (error) {
//       console.error("Error in fetchNearbyBusStops:", error);
//     } finally {
//       setLoadingStops(false);
//     }
//   }, []);


//   // API: Fetch real-time bus arrivals for a stop
//   const fetchBusArrivals = useCallback(async (stopCode) => {
//     setLoadingArrivals(true);
//     try {
//       const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
//       
//       if (res.data.success && res.data.data) {
//         setRealTimeArrivals(prev => ({
//           ...prev,
//           [stopCode]: res.data.data // Store processed service data
//         }));
//         
//         // Update the main nearbyBusStops list with the new data
//         setNearbyBusStops(prevStops => prevStops.map(stop => 
//           stop.code === stopCode ? { ...stop, buses: res.data.data } : stop
//         ));
//       } else {
//         console.error(`Failed to fetch arrivals for ${stopCode}:`, res.data.error);
//       }
//     } catch (error) {
//       console.error(`Error fetching arrivals for ${stopCode}:`, error);
//     } finally {
//       setLoadingArrivals(false);
//     }
//   }, []);

//   // API: Fetch user's favorite routes
//   const fetchFavorites = useCallback(async () => {
//     try {
//       const res = await api.get("/api/user/favourites/");
//       setFavorites(res.data);
//     } catch (error) {
//       console.error("Error fetching favorites:", error);
//     }
//   }, []);

//   // API: Add/Remove favorite
//   const toggleFavorite = async (stopCode, stopName) => {
//     const fav = isFavorite(stopCode);
//     try {
//       if (fav) {
//         // Remove favorite
//         const favouriteId = favorites.find(f => f.route_id === stopCode && f.route_type === 'bus').id;
//         await api.delete(`/api/user/favourites/remove/${favouriteId}/`);
//       } else {
//         // Add favorite
//         await api.post("/api/user/favourites/add/", {
//           route_type: 'bus',
//           route_id: stopCode,
//           nickname: stopName,
//         });
//       }
//       fetchFavorites(); // Refresh the list
//     } catch (error) {
//       console.error("Error toggling favorite:", error);
//       alert(`Failed to ${fav ? 'remove' : 'add'} favorite.`);
//     }
//   };

//   // --- Effects and Map Logic ---

//   // Initial data fetch
//   useEffect(() => {
//     fetchNearbyBusStops();
//     fetchFavorites();
//   }, [fetchNearbyBusStops, fetchFavorites]);

//   // Re-fetch arrivals if selected stop changes
//   useEffect(() => {
//     if (selectedStopCode) {
//       fetchBusArrivals(selectedStopCode);
//       // Set up auto-refresh every 20 seconds (matching backend cache)
//       const intervalId = setInterval(() => {
//         fetchBusArrivals(selectedStopCode);
//       }, 20000);
//       return () => clearInterval(intervalId);
//     }
//   }, [selectedStopCode, fetchBusArrivals]);

//   // Map initialization
//   useEffect(() => {
//     if (window.google && mapRef.current) {
//       initializeMap(nearbyBusStops);
//     } else if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
//       const script = document.createElement("script");
//       script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M`; // You must use your actual VITE_GOOGLE_MAPS_API_KEY here, replace with a proper ENV variable retrieval
//       script.async = true;
//       script.defer = true;
//       script.onload = () => initializeMap(nearbyBusStops);
//       document.head.appendChild(script);
//     }
//   }, [nearbyBusStops]); // Re-run when stops data is loaded

//   const initializeMap = (stops) => {
//     if (!window.google || !mapRef.current) return;

//     const map = new window.google.maps.Map(mapRef.current, {
//       center: homeLocation,
//       zoom: 15,
//       disableDefaultUI: false,
//       zoomControl: true,
//       mapTypeControl: false,
//       streetViewControl: false,
//       fullscreenControl: false,
//       styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
//     });

//     mapInstanceRef.current = map;
//     markersRef.current = []; // Clear previous markers

//     new window.google.maps.Marker({
//       position: homeLocation,
//       map,
//       icon: {
//         path: window.google.maps.SymbolPath.CIRCLE,
//         scale: 10,
//         fillColor: "#4285F4",
//         fillOpacity: 1,
//         strokeColor: "#ffffff",
//         strokeWeight: 3,
//       },
//       title: "Your Location",
//     });

//     stops.forEach((stop) => {
//       const marker = new window.google.maps.Marker({
//         position: { lat: stop.lat, lng: stop.lng },
//         map,
//         icon: {
//           // Using a simple colored circle or a custom SVG for bus stops
//           path: window.google.maps.SymbolPath.CIRCLE,
//           scale: 7,
//           fillColor: "#3bb59d", // Greenish color for bus/bus stop
//           fillOpacity: 0.8,
//           strokeColor: "#1a1a1a",
//           strokeWeight: 1,
//         },
//         title: stop.name,
//       });

//       const infoWindow = new window.google.maps.InfoWindow({
//         content: `<div style="font-weight: 600; color: #1a1a1a; padding: 4px 8px; margin: 0; line-height: 1;">${stop.name} (${stop.code})</div>`,
//         maxWidth: 200,
//       });

//       marker.addListener("click", () => {
//         markersRef.current.forEach((m) => m.infoWindow?.close());
//         infoWindow.open(map, marker);
//         setSelectedStopCode(stop.code);
//         setExpandedStops({ [stop.code]: true });
//         setDrawerHeight(60);
//         map.panTo({ lat: stop.lat - 0.003, lng: stop.lng });

//         setTimeout(() => {
//           document
//             .getElementById(`stop-${stop.code}`)
//             ?.scrollIntoView({ behavior: "smooth", block: "start" });
//         }, 300);
//       });

//       markersRef.current.push({ marker, infoWindow });
//     });
//   };

//   // --- UI Logic ---

//   // Drawer drag handlers (keeping your drag logic)
//   const handleTouchStart = (e) => {
//     setIsDragging(true);
//     setStartY(e.touches[0].clientY);
//   };
//   const handleTouchMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const currentY = e.touches[0].clientY;
//     const diff = startY - currentY;
//     const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//     setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
//     setStartY(currentY);
//   };
//   const handleTouchEnd = () => {
//     setIsDragging(false);
//     snapToPosition();
//   };
//   const handleMouseDown = (e) => {
//     setIsDragging(true);
//     setStartY(e.clientY);
//   };
//   const handleMouseMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const currentY = e.clientY;
//     const diff = startY - currentY;
//     const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//     setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
//     setStartY(currentY);
//   };
//   const handleMouseUp = () => {
//     setIsDragging(false);
//     snapToPosition();
//   };
//   const snapToPosition = () => {
//     if (drawerHeight < 40) setDrawerHeight(30);
//     else if (drawerHeight > 70) setDrawerHeight(85);
//     else setDrawerHeight(60);
//   };

//   useEffect(() => {
//     if (isDragging) {
//       document.addEventListener("mousemove", handleMouseMove);
//       document.addEventListener("mouseup", handleMouseUp);
//       return () => {
//         document.removeEventListener("mousemove", handleMouseMove);
//         document.removeEventListener("mouseup", handleMouseUp);
//       };
//     }
//   }, [isDragging, startY, drawerHeight]);


//   // Filter and sort stops for the list
//   const stopsToDisplay = nearbyBusStops
//     .filter(
//       (stop) =>
//         stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         stop.code.includes(searchTerm) ||
//         // Check against the fetched buses if available, otherwise skip this check
//         (realTimeArrivals[stop.code] || []).some(service => 
//           service.service_no.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//     )
//     .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));


//   // Toggles the expansion of a stop's details and triggers data fetch if needed
//   const toggleStopDetails = (stop) => {
//     const code = stop.code;
//     setExpandedStops(prev => ({ ...prev, [code]: !prev[code] }));
//     setSelectedStopCode(code); // Always set the selected stop code to fetch/refresh data

//     // Ensure map is centered when stop is clicked
//     if (mapInstanceRef.current) {
//       mapInstanceRef.current.panTo({ lat: stop.lat - 0.003, lng: stop.lng });
//     }
//   };

//   // Get UI styling for arrival times
//   const getArrivalColor = (time) =>
//     time <= 2 ? "#ef4444" : time <= 5 ? "#f59e0b" : "#3bb59d";

//   const getArrivalLabel = (time) =>
//     time === 0 ? "Arr" : time === 1 ? "1 min" : `${time} min`;

//   return (
//     <div className="container">
//       <div ref={mapRef} className="map-container" />

//       <div className="drawer" style={{ height: `${drawerHeight}vh` }}>
//         <div
//           className="drag-handle"
//           onTouchStart={handleTouchStart}
//           onTouchMove={handleTouchMove}
//           onTouchEnd={handleTouchEnd}
//           onMouseDown={handleMouseDown}
//         >
//           <div className="drag-bar" />
//         </div>

//         <div className="drawer-header">
//           <input
//             type="text"
//             placeholder="Search bus stop or bus number..."
//             className="search-input"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         {/* Transport Tabs - Use NavLink for routing */}
//         <div className="transport-tabs">
//           <NavLink to={"/NearbyCarparks"} className="transport-tab">
//             <span className="tab-icon"><FaCar /></span>
//             <span className="tab-label">Car</span>
//           </NavLink>
//           <NavLink to={"/LiveTracker"} className="transport-tab transport-tab-active">
//             <span className="tab-icon"><FaBus /></span>
//             <span className="tab-label">Bus</span>
//           </NavLink>
//           <NavLink to={"/CrowdDensity"} className="transport-tab">
//             <span className="tab-icon"><FaTrainSubway /></span>
//             <span className="tab-label">Train</span>
//           </NavLink>
//         </div>

//         <div className="content">
//           {loadingStops && <div className="search-info">Loading nearby stops...</div>}
//           {searchTerm && !loadingStops && (
//             <div className="search-info">
//               Found {stopsToDisplay.length} result{stopsToDisplay.length !== 1 ? "s" : ""}
//             </div>
//           )}

//           <div className="stops-list">
//             {!loadingStops && stopsToDisplay.length === 0 ? (
//               <div className="empty-state">
//                 <div className="empty-state-icon">🔍</div>
//                 <p className="empty-state-text">No matching bus stops found</p>
//               </div>
//             ) : (
//               stopsToDisplay.map((stop) => {
//                 const isStopExpanded = expandedStops[stop.code];
//                 const arrivals = realTimeArrivals[stop.code] || [];
//                 const totalBuses = arrivals.length > 0 ? arrivals.length : '—';
//                 const isFav = isFavorite(stop.code);

//                 return (
//                   <div
//                     key={stop.code}
//                     id={`stop-${stop.code}`}
//                     className={`stop-card ${selectedStopCode === stop.code ? "stop-card-selected" : ""}`}
//                   >
//                     <div
//                       className="stop-header"
//                       onClick={() => toggleStopDetails(stop)}
//                     >
//                         <div className="stop-left">
//                           <button 
//                             className="favorite-btn" 
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               toggleFavorite(stop.code, stop.name);
//                             }}
//                           >
//                             {isFav ? "⭐" : "☆"}
//                           </button>
//                           <div>
//                             <div className="stop-name-row">
//                               <h3 className="stop-name">{stop.name}</h3>
//                               <span className="stop-code">{stop.code}</span>
//                             </div>
//                             <div className="stop-meta">
//                               <span className="stop-distance">
//                                 {stop.distance}
//                               </span>
//                               <span className="stop-bus-count">
//                                 {totalBuses} services
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         <button className="expand-btn">
//                           {isStopExpanded ? "▲" : "▼"}
//                         </button>
//                     </div>

//                     {isStopExpanded && (
//                       <div className="bus-arrivals">
//                         {loadingArrivals && selectedStopCode === stop.code ? (
//                           <div className="loading-indicator">Loading arrivals...</div>
//                         ) : arrivals.length === 0 ? (
//                           <div className="empty-state-text" style={{ padding: '16px 0', textAlign: 'center', color: '#ef4444' }}>
//                             No buses arriving soon.
//                           </div>
//                         ) : (
//                           arrivals.map((bus, i) => (
//                             <div key={i} className="bus-row">
//                               <div className="bus-info">
//                                 <div className="bus-number">{bus.service_no}</div>
//                                 <div className="bus-destination">
//                                   → {bus.destination_code}
//                                 </div>
//                               </div>
//                               <div className="arrival-times">
//                                 {bus.buses.slice(0, 3).map((arrival, j) => (
//                                   <div key={j} className="arrival-block">
//                                     <div
//                                       className="arrival-time"
//                                       style={{
//                                         backgroundColor: getArrivalColor(arrival.waiting_time),
//                                       }}
//                                     >
//                                       {getArrivalLabel(arrival.waiting_time)}
//                                     </div>
//                                     <span className="bus-type-label">
//                                       {arrival.load_display.split(' ')[0]}
//                                     </span>
//                                   </div>
//                                 ))}
//                             </div>
//                             <button 
//                               className="favorite-btn" 
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 toggleFavorite(bus.service_no, `Bus ${bus.service_no} at ${stop.name}`);
//                               }}
//                             >
//                               {favorites.some(fav => fav.route_id === bus.service_no && fav.route_type === 'bus') ? "⭐" : "☆"}
//                             </button>
//                           </div>
//                           ))
//                         )}
//                       </div>
//                     )}
//                   </div>
//               )})
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






import React, { useState, useEffect, useRef, useCallback, useMemo} from "react";
import api from "../api";
import "./LiveTracker.css";
import { FaTrainSubway, FaBus, FaCar } from "react-icons/fa6";
import { NavLink, useNavigate } from "react-router-dom";

// NOTE: Replace with your actual key in a real project
const MAP_API_KEY = "AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M"; 
const API_POLL_INTERVAL = 5000;
const defaultLocation = { lat: 1.3521, lng: 103.8198 }; // Default: Central Singapore area

// --- Core Utility Functions (Moved outside component for stability) ---

/** Calculates remaining minutes based on the LTA's ISO timestamp. */
const getMinutesUntilArrival = (isoTimestamp) => {
    if (!isoTimestamp) return null;
    try {
        const arrivalTime = new Date(isoTimestamp);
        const currentTime = new Date();
        const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
        return Math.max(0, Math.floor(diffSeconds / 60)); 
    } catch (e) { return null; }
};

const getArrivalColor = (time) => time <= 2 ? "#ef4444" : time <= 5 ? "#f59e0b" : "#3bb59d";
const getArrivalLabel = (time) => {
    if (time === null) return "N/A";
    if (time === 0) return "Arr"; 
    if (time === 1) return "1 min";
    return `${time} min`;
};
const getBusIcon = (isFav) => ({
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 7,
    fillColor: isFav ? "#FFD700" : "#3bb59d",
    fillOpacity: 0.8,
    strokeColor: "#1a1a1a",
    strokeWeight: 1,
});


export default function LiveTracker() {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedStops, setExpandedStops] = useState({});
    const [drawerHeight, setDrawerHeight] = useState(30);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0); 

    const [nearbyBusStops, setNearbyBusStops] = useState([]);
    const [selectedStopCode, setSelectedStopCode] = useState(null);
    const [liveServicesData, setLiveServicesData] = useState({}); 
    
    const [loadingStops, setLoadingStops] = useState(true);
    const [loadingArrivals, setLoadingArrivals] = useState(false);
    const [favorites, setFavorites] = useState([]); 
    const [currentLocation, setCurrentLocation] = useState(null); 
    const [, setVisualTick] = useState(0); 

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]); 
    const navigate = useNavigate();

    // --- Favorites & UI Utilities ---
    const isFavorite = useCallback((routeId, routeType) => 
        favorites.some(fav => fav.route_id === routeId && fav.route_type === routeType), [favorites]);

    const fetchFavorites = useCallback(async () => {
        if (!localStorage.getItem('access')) return; 
        try {
            const res = await api.get("/api/user/favourites/");
            setFavorites(res.data.bus_favourites || []); 
        } catch (error) { console.error("Error fetching favorites:", error); setFavorites([]); }
    }, []);
    
    const toggleFavorite = async (e, routeId, routeType, nickname) => {
        e.stopPropagation();
        if (!localStorage.getItem('access')) { alert("You must be logged in to save favorites."); return; }
        
        const fav = favorites.find(fav => fav.route_id === routeId && fav.route_type === routeType);
        try {
            if (fav) { await api.delete(`/api/user/favourites/remove/${fav.id}/`); } 
            else { await api.post("/api/user/favourites/add/", { route_type: routeType, route_id: routeId, nickname: nickname }); }
            fetchFavorites(); 
        } catch (error) { alert(`Failed to ${fav ? 'remove' : 'add'} favorite.`); }
    };


    // --- GEOLOCATION & Map Initialization ---
    const getUserLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => { setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
                (err) => { setCurrentLocation(defaultLocation); },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setCurrentLocation(defaultLocation);
        }
    }, []);

    const initializeMap = useCallback((centerLocation, stops) => {
        if (!window.google || !mapRef.current) return;

        markersRef.current.forEach(m => m.marker?.setMap(null));
        markersRef.current = []; 

        const map = new window.google.maps.Map(mapRef.current, {
            center: centerLocation,
            zoom: 15,
            disableDefaultUI: true,
        });
        mapInstanceRef.current = map;

        // 1. Add User Location Marker
        new window.google.maps.Marker({
            position: centerLocation,
            map,
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#4285F4", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 },
            title: "Your Location",
        });

        // 2. Add Bus Stop Markers
        stops.forEach((stop) => {
            const marker = new window.google.maps.Marker({
                position: { lat: stop.latitude, lng: stop.longitude },
                map,
                icon: getBusIcon(isFavorite(stop.code, 'bus')),
                title: stop.name,
            });

            marker.addListener("click", () => {
                setSelectedStopCode(stop.code);
                setExpandedStops({ [stop.code]: true });
                setDrawerHeight(60);
                map.panTo({ lat: stop.latitude - 0.003, lng: stop.longitude });

                scrollToStop(stop.code);
            });
            markersRef.current.push({ marker, stop });
        });
    }, [isFavorite]);


    // --- API Calls (Stable Logic) ---
    const fetchNearbyBusStops = useCallback(async (location) => {
        if (!location) return; 
        setLoadingStops(true);
        try {
            const url = `/api/nearby-bus-stops/?lat=${location.lat}&lng=${location.lng}&radius=1000`;
            const res = await api.get(url);

            if (res.data.success && res.data.stops) {
                const mappedStops = res.data.stops.map(stop => ({
                    code: stop.bus_stop_code,
                    name: stop.description || stop.road_name,
                    //distance: stop.distance_km ? `${(stop.distance_km * 1000).toFixed(0)} m` : "N/A", 
                    ...stop
                }));
                setNearbyBusStops(mappedStops);
                
                if (mappedStops.length > 0) {
                    setSelectedStopCode(prevCode => prevCode || mappedStops[0].code);
                }
            } 
        } catch (error) { console.error("Error fetching nearby bus stops:", error); } 
        finally { setLoadingStops(false); }
    }, [initializeMap]);


    // 3. API: Fetch Search Results 
    const fetchSearchResults = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setNearbyBusStops([]); // Clear search to display nearby stops
            setLoadingStops(false);
            return;
        }
        setLoadingStops(true);
        try {
            const res = await api.get(`/api/search/bus-stops/?q=${query}`);
            
            if (res.data.success && res.data.results) {
                const mappedResults = res.data.results.map(stop => ({
                    code: stop.bus_stop_code,
                    name: stop.description || stop.road_name,
                    //distance: 'N/A', 
                    ...stop 
                }));
                setNearbyBusStops(mappedResults); // Use nearbyBusStops to display filtered list
            } else {
                setNearbyBusStops([]);
            }
        } catch (err) {
            console.error(`Search Connection Error: ${err.message}.`);
        } finally {
            setLoadingStops(false);
        }
    }, []);

    const fetchBusArrivals = useCallback(async (stopCode) => {
        if (!stopCode) return;
        if (!liveServicesData[stopCode]) setLoadingArrivals(true); 
        try {
            const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
            if (res.data.success) { setLiveServicesData(prev => ({ ...prev, [stopCode]: res.data.services || [] })); } 
        } catch (error) { console.error(`Error fetching arrivals for ${stopCode}:`, error); } 
        finally { setLoadingArrivals(false); }
    }, []);


    // --- EFFECTS ---

    // 1. Get Location and Favorites
    useEffect(() => {
        getUserLocation();
        fetchFavorites();
    }, [getUserLocation, fetchFavorites]);

    // 2. Fetch Nearby Stops / Update Map when Location or Stops Change
    useEffect(() => {
        if (currentLocation && searchTerm.length < 2) {
            fetchNearbyBusStops(currentLocation);
        }
    }, [currentLocation, fetchNearbyBusStops, searchTerm]); 
    
    // 2b. Trigger search separately for immediate feedback
    useEffect(() => {
        if (searchTerm.length >= 2) {
             fetchSearchResults(searchTerm);
        } else if (searchTerm.length === 0 && nearbyBusStops.length === 0 && currentLocation) {
            // Re-fetch nearby stops if search is cleared
            fetchNearbyBusStops(currentLocation || defaultLocation);
        }
    }, [searchTerm, fetchSearchResults, fetchNearbyBusStops, currentLocation, nearbyBusStops.length]);


    // 3. Google Maps Script Loader & Initializer
    useEffect(() => {
        if (currentLocation && nearbyBusStops.length > 0) {
            if (window.google) {
                initializeMap(currentLocation, nearbyBusStops);
            } else if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}`; 
                script.async = true;
                script.defer = true;
                script.onload = () => initializeMap(currentLocation, nearbyBusStops);
                document.head.appendChild(script);
            }
        }
    }, [currentLocation, nearbyBusStops, initializeMap]);


    // 4. API Polling (Stable)
    useEffect(() => {
        let apiIntervalId;
        if (selectedStopCode) {
            fetchBusArrivals(selectedStopCode); 
            apiIntervalId = setInterval(() => { fetchBusArrivals(selectedStopCode); }, API_POLL_INTERVAL); 
        }
        return () => { if (apiIntervalId) clearInterval(apiIntervalId); };
    }, [selectedStopCode, fetchBusArrivals]);

    // 5. Visual Countdown (Fast)
    useEffect(() => {
        const visualIntervalId = setInterval(() => { setVisualTick(prev => prev + 1); }, 1000); 
        return () => clearInterval(visualIntervalId);
    }, []);


    // --- RENDER LOGIC ---
    // The list displays the nearby stops (filtered by search term if active)
    const currentStopsList = nearbyBusStops.filter((stop) =>
        stop.name.toLowerCase().includes(searchTerm.toLowerCase()) || stop.code.includes(searchTerm)
    );

    const currentServices = liveServicesData[selectedStopCode] || [];

    const toggleStopDetails = (stop) => {
        const code = stop.code;
        setExpandedStops(prev => ({ ...prev, [code]: !prev[code] }));
        setSelectedStopCode(code); 
        if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat: stop.latitude - 0.003, lng: stop.longitude });
        }
        scrollToStop(code);
    };

    // --- SCROLL UTILITY ---
    const scrollToStop = (stopCode) => {
        // Use a short timeout to ensure the DOM has updated (especially after expansion/drawer movement)
        setTimeout(() => {
            const element = document.getElementById(`stop-${stopCode}`);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' // Scrolls the element to the top of the visible area
                });
            }
        }, 100); 
    };

    // Placeholder drag handlers (to avoid errors)
    const handleTouchStart = (e) => { setIsDragging(true); setStartY(e.touches[0].clientY); };
    const handleTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentY = e.touches[0].clientY;
        const diff = startY - currentY;
        const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
        setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
        setStartY(currentY);
    };
    const handleTouchEnd = () => { setIsDragging(false); }; // Simplified drag end
    const handleMouseDown = (e) => { setIsDragging(true); setStartY(e.clientY); };
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentY = e.clientY;
        const diff = startY - currentY;
        const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
        setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
        setStartY(currentY);
    };
    const handleMouseUp = () => { setIsDragging(false); };

    // useEffect(() => {
    //     // ... (Mount/unmount listeners for drag, simplified)
    // }, [isDragging]);
    useEffect(() => {
        if (isDragging) {
            // Attach global listeners for continuous dragging
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none'; // Prevent selection

        } else {
            // Remove global listeners when dragging stops
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="container">
            <div ref={mapRef} className="map-container" /> 

            <div className="drawer" style={{ height: `${drawerHeight}vh` }}>
                {/* Drag handle */}
                <div 
                    className="drag-handle"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    // onMouseMove={handleMouseMove}
                    // onMouseUp={handleMouseUp}
                >
                    <div className="drag-bar" />
                </div>

                <div className="drawer-header">
                    <input
                        type="text"
                        placeholder="Search bus stop or bus number..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Transport Tabs */}
                <div className="transport-tabs">
                    <NavLink to={"/NearbyCarparks"} className="transport-tab"><span className="tab-icon"><FaCar /></span><span className="tab-label">Car</span></NavLink>
                    <NavLink to={"/LiveTracker"} className="transport-tab transport-tab-active"><span className="tab-icon"><FaBus /></span><span className="tab-label">Bus</span></NavLink>
                    <NavLink to={"/CrowdDensity"} className="transport-tab"><span className="tab-icon"><FaTrainSubway /></span><span className="tab-label">Train</span></NavLink>
                </div>

                <div className="content">
                    {loadingStops && currentStopsList.length === 0 && <div className="search-info">Loading nearby stops...</div>}
                    
                    <div className="stops-list">
                        {currentStopsList.length === 0 ? (
                            <div className="empty-state"><div className="empty-state-icon">🔍</div><p className="empty-state-text">No matching stops found.</p></div>
                        ) : (
                          currentStopsList.map((stop) => {
                            const isStopExpanded = expandedStops[stop.code];
                            const services = liveServicesData[stop.code] || [];
                            const totalServices = services.length;
                            const isStopFav = isFavorite(stop.code, 'bus'); 

                            return (
                              <div key={stop.code} id={`stop-${stop.code}`} className={`stop-card ${selectedStopCode === stop.code ? "stop-card-selected" : ""}`}>
                                <div className="stop-header" onClick={() => toggleStopDetails(stop)}>
                                        <div className="stop-left">
                                            <button className="favorite-btn" onClick={(e) => {e.stopPropagation(); toggleFavorite(e, stop.code, 'bus', stop.name);}}>{isStopFav ? "⭐" : "☆"}</button>
                                            <div>
                                                <div className="stop-name-row">
                                                    <h3 className="stop-name">{stop.name}</h3>
                                                    <span className="stop-code">{stop.code}</span>
                                                </div>
                                                <div className="stop-meta">
                                                    {/* <span className="stop-distance">{stop.distance}</span> */}
                                                    <span className="stop-bus-count">{totalServices} services</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="expand-btn">{isStopExpanded ? "▲" : "▼"}</button>
                                </div>

                                {isStopExpanded && (
                                  <div className="bus-arrivals">
                                    {loadingArrivals && selectedStopCode === stop.code && services.length === 0 ? (
                                      <div className="loading-indicator">Loading arrivals...</div>
                                    ) : services.length === 0 ? (
                                      <div className="empty-state-text" style={{ padding: '16px 0', textAlign: 'center', color: '#ef4444' }}>No buses arriving soon.</div>
                                    ) : (
                                      services.map((service, i) => (
                                        <div key={i} className="bus-row">
                                          <div className="bus-info">
                                            <div className="bus-number">{service.service_no}</div>
                                            <div className="bus-destination">→ {service.buses[0]?.destination_code || 'N/A'}</div>
                                          </div>
                                          <div className="arrival-times">
                                            {service.buses.slice(0, 3).map((bus, j) => {
                                              const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
                                              return (
                                                  <div key={j} className="arrival-block">
                                                    <div className="arrival-time" style={{ backgroundColor: getArrivalColor(liveTime) }}>
                                                        **{getArrivalLabel(liveTime)}**                                     </div>
                                                    <span className="bus-type-label">{bus.load_display.split(' ')[0]}</span>
                                                  </div>
                                            )})}
                                          </div>
                                          <button 
                                              className="favorite-btn" 
                                              onClick={(e) => {e.stopPropagation(); toggleFavorite(e, service.service_no, 'bus', `Bus ${service.service_no} at ${stop.name}`);}}
                                          >
                                              {isFavorite(service.service_no, 'bus') ? "⭐" : "☆"}
                                          </button>
                                    </div>
                                  ))
                                )}
                            </div>
                            
                        )}
                    </div>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  );
}