// import React, { useState, useEffect, useRef, useCallback, useMemo} from "react";
// import api from "../api";
// import "./LiveTracker.css";
// import { FaTrainSubway, FaBus, FaCar } from "react-icons/fa6";
// import { NavLink, useNavigate } from "react-router-dom";

// // NOTE: Replace with your actual key in a real project
// const MAP_API_KEY = "AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M"; 
// const API_POLL_INTERVAL = 5000;
// const defaultLocation = { lat: 1.3521, lng: 103.8198 }; // Default: Central Singapore area

// // --- Core Utility Functions (Moved outside component for stability) ---

// /** Calculates remaining minutes based on the LTA's ISO timestamp. */
// const getMinutesUntilArrival = (isoTimestamp) => {
//     if (!isoTimestamp) return null;
//     try {
//         const arrivalTime = new Date(isoTimestamp);
//         const currentTime = new Date();
//         const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
//         return Math.max(0, Math.floor(diffSeconds / 60)); 
//     } catch (e) { return null; }
// };

// const getArrivalColor = (time) => time <= 2 ? "#ef4444" : time <= 5 ? "#f59e0b" : "#3bb59d";
// const getArrivalLabel = (time) => {
//     if (time === null) return "N/A";
//     if (time === 0) return "Arr"; 
//     if (time === 1) return "1 min";
//     return `${time} min`;
// };
// const getBusIcon = (isFav) => ({
//     path: window.google.maps.SymbolPath.CIRCLE,
//     scale: 7,
//     fillColor: isFav ? "#FFD700" : "#3bb59d",
//     fillOpacity: 0.8,
//     strokeColor: "#1a1a1a",
//     strokeWeight: 1,
// });


// export default function LiveTracker() {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [expandedStops, setExpandedStops] = useState({});
//     const [drawerHeight, setDrawerHeight] = useState(30);
//     const [isDragging, setIsDragging] = useState(false);
//     const [startY, setStartY] = useState(0); 

//     const [nearbyBusStops, setNearbyBusStops] = useState([]);
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [liveServicesData, setLiveServicesData] = useState({}); 
//     
//     const [loadingStops, setLoadingStops] = useState(true);
//     const [loadingArrivals, setLoadingArrivals] = useState(false);
//     const [favorites, setFavorites] = useState([]); 
//     const [currentLocation, setCurrentLocation] = useState(null); 
//     const [, setVisualTick] = useState(0); 

//     const mapRef = useRef(null);
//     const mapInstanceRef = useRef(null);
//     const markersRef = useRef([]); 
//     const navigate = useNavigate();

//     // --- Favorites & UI Utilities ---
//     const isFavorite = useCallback((routeId, routeType) => 
//         favorites.some(fav => fav.route_id === routeId && fav.route_type === routeType), [favorites]);

//     const fetchFavorites = useCallback(async () => {
//         if (!localStorage.getItem('access')) return; 
//         try {
//             const res = await api.get("/api/user/favourites/");
//             setFavorites(res.data.bus_favourites || []); 
//         } catch (error) { console.error("Error fetching favorites:", error); setFavorites([]); }
//     }, []);
    
//     const toggleFavorite = async (e, routeId, routeType, nickname) => {
//         e.stopPropagation();
//         if (!localStorage.getItem('access')) { alert("You must be logged in to save favorites."); return; }
        
//         const fav = favorites.find(fav => fav.route_id === routeId && fav.route_type === routeType);
//         try {
//             if (fav) { await api.delete(`/api/user/favourites/remove/${fav.id}/`); } 
//             else { await api.post("/api/user/favourites/add/", { route_type: routeType, route_id: routeId, nickname: nickname }); }
//             fetchFavorites(); 
//         } catch (error) { alert(`Failed to ${fav ? 'remove' : 'add'} favorite.`); }
//     };


//     // --- GEOLOCATION & Map Initialization ---
//     const getUserLocation = useCallback(() => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => { setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
//                 (err) => { setCurrentLocation(defaultLocation); },
//                 { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
//             );
//         } else {
//             setCurrentLocation(defaultLocation);
//         }
//     }, []);

//     const initializeMap = useCallback((centerLocation, stops) => {
//         if (!window.google || !mapRef.current) return;

//         markersRef.current.forEach(m => m.marker?.setMap(null));
//         markersRef.current = []; 

//         const map = new window.google.maps.Map(mapRef.current, {
//             center: centerLocation,
//             zoom: 15,
//             disableDefaultUI: true,
//         });
//         mapInstanceRef.current = map;

//         // 1. Add User Location Marker
//         new window.google.maps.Marker({
//             position: centerLocation,
//             map,
//             icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#4285F4", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 },
//             title: "Your Location",
//         });

//         // 2. Add Bus Stop Markers
//         stops.forEach((stop) => {
//             const marker = new window.google.maps.Marker({
//                 position: { lat: stop.latitude, lng: stop.longitude },
//                 map,
//                 icon: getBusIcon(isFavorite(stop.code, 'bus')),
//                 title: stop.name,
//             });
//   // Touch handlers
//   const handleTouchStart = (e) => {
//     setIsDragging(true);
//     setStartY(e.touches[0].clientY);
//   };
//   const handleTouchMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const currentY = e.touches[0].clientY;
//     const diff = startY - currentY;
//     const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//     setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
//     setStartY(currentY);
//   };
//   const handleTouchEnd = () => {
//     setIsDragging(false);
//     snapToPosition();
//   };

//   // Mouse handlers (for desktop)
//   const handleMouseDown = (e) => {
//     setIsDragging(true);
//     setStartY(e.clientY);
//   };
//   const handleMouseMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const currentY = e.clientY;
//     const diff = startY - currentY;
//     const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//     setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
//     setStartY(currentY);
//   };
//   const handleMouseUp = () => {
//     setIsDragging(false);
//     snapToPosition();
//   };

//             marker.addListener("click", () => {
//                 setSelectedStopCode(stop.code);
//                 setExpandedStops({ [stop.code]: true });
//                 setDrawerHeight(60);
//                 map.panTo({ lat: stop.latitude - 0.003, lng: stop.longitude });

//                 scrollToStop(stop.code);
//             });
//             markersRef.current.push({ marker, stop });
//         });
//     }, [isFavorite]);


//     // --- API Calls (Stable Logic) ---
//     const fetchNearbyBusStops = useCallback(async (location) => {
//         if (!location) return; 
//         setLoadingStops(true);
//         try {
//             const url = `/api/nearby-bus-stops/?lat=${location.lat}&lng=${location.lng}&radius=1000`;
//             const res = await api.get(url);

//             if (res.data.success && res.data.stops) {
//                 const mappedStops = res.data.stops.map(stop => ({
//                     code: stop.bus_stop_code,
//                     name: stop.description || stop.road_name,
//                     //distance: stop.distance_km ? `${(stop.distance_km * 1000).toFixed(0)} m` : "N/A", 
//                     ...stop
//                 }));
//                 setNearbyBusStops(mappedStops);
//                 
//                 if (mappedStops.length > 0) {
//                     setSelectedStopCode(prevCode => prevCode || mappedStops[0].code);
//                 }
//             } 
//         } catch (error) { console.error("Error fetching nearby bus stops:", error); } 
//         finally { setLoadingStops(false); }
//     }, [initializeMap]);


//     // 3. API: Fetch Search Results 
//     const fetchSearchResults = useCallback(async (query) => {
//         if (!query || query.length < 2) {
//             setNearbyBusStops([]); // Clear search to display nearby stops
//             setLoadingStops(false);
//             return;
//         }
//         setLoadingStops(true);
//         try {
//             const res = await api.get(`/api/search/bus-stops/?q=${query}`);
            
//             if (res.data.success && res.data.results) {
//                 const mappedResults = res.data.results.map(stop => ({
//                     code: stop.bus_stop_code,
//                     name: stop.description || stop.road_name,
//                     //distance: 'N/A', 
//                     ...stop 
//                 }));
//                 setNearbyBusStops(mappedResults); // Use nearbyBusStops to display filtered list
//             } else {
//                 setNearbyBusStops([]);
//             }
//         } catch (err) {
//             console.error(`Search Connection Error: ${err.message}.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);

//     const fetchBusArrivals = useCallback(async (stopCode) => {
//         if (!stopCode) return;
//         if (!liveServicesData[stopCode]) setLoadingArrivals(true); 
//         try {
//             const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
//             if (res.data.success) { setLiveServicesData(prev => ({ ...prev, [stopCode]: res.data.services || [] })); } 
//         } catch (error) { console.error(`Error fetching arrivals for ${stopCode}:`, error); } 
//         finally { setLoadingArrivals(false); }
//     }, []);


//     // --- EFFECTS ---

//     // 1. Get Location and Favorites
//     useEffect(() => {
//         getUserLocation();
//         fetchFavorites();
//     }, [getUserLocation, fetchFavorites]);

//     // 2. Fetch Nearby Stops / Update Map when Location or Stops Change
//     useEffect(() => {
//         if (currentLocation && searchTerm.length < 2) {
//             fetchNearbyBusStops(currentLocation);
//         }
//     }, [currentLocation, fetchNearbyBusStops, searchTerm]); 
    
//     // 2b. Trigger search separately for immediate feedback
//     useEffect(() => {
//         if (searchTerm.length >= 2) {
//              fetchSearchResults(searchTerm);
//         } else if (searchTerm.length === 0 && nearbyBusStops.length === 0 && currentLocation) {
//             // Re-fetch nearby stops if search is cleared
//             fetchNearbyBusStops(currentLocation || defaultLocation);
//         }
//     }, [searchTerm, fetchSearchResults, fetchNearbyBusStops, currentLocation, nearbyBusStops.length]);
//         {/* Transport Tabs */}
//         <div className="transport-tabs">
//           <NavLink to={"/NearbyCarparks"} className="transport-tab">
//             <span className="tab-icon"><FaCar /></span>
//             <span className="tab-label">Car</span>
//           </NavLink>
//           <NavLink className="transport-tab transport-tab-active">
//             <span className="tab-icon"><FaBus /></span>
//             <span className="tab-label">Bus</span>
//           </NavLink>
//           <NavLink to={"/CrowdDensity"} className="transport-tab">
//             <span className="tab-icon"><FaTrainSubway/></span>
//             <span className="tab-label">Train</span>
//           </NavLink>
//         </div>


//     // 3. Google Maps Script Loader & Initializer
//     useEffect(() => {
//         if (currentLocation && nearbyBusStops.length > 0) {
//             if (window.google) {
//                 initializeMap(currentLocation, nearbyBusStops);
//             } else if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
//                 const script = document.createElement("script");
//                 script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}`; 
//                 script.async = true;
//                 script.defer = true;
//                 script.onload = () => initializeMap(currentLocation, nearbyBusStops);
//                 document.head.appendChild(script);
//             }
//         }
//     }, [currentLocation, nearbyBusStops, initializeMap]);


//     // 4. API Polling (Stable)
//     useEffect(() => {
//         let apiIntervalId;
//         if (selectedStopCode) {
//             fetchBusArrivals(selectedStopCode); 
//             apiIntervalId = setInterval(() => { fetchBusArrivals(selectedStopCode); }, API_POLL_INTERVAL); 
//         }
//         return () => { if (apiIntervalId) clearInterval(apiIntervalId); };
//     }, [selectedStopCode, fetchBusArrivals]);

//     // 5. Visual Countdown (Fast)
//     useEffect(() => {
//         const visualIntervalId = setInterval(() => { setVisualTick(prev => prev + 1); }, 1000); 
//         return () => clearInterval(visualIntervalId);
//     }, []);


//     // --- RENDER LOGIC ---
//     // The list displays the nearby stops (filtered by search term if active)
//     const currentStopsList = nearbyBusStops.filter((stop) =>
//         stop.name.toLowerCase().includes(searchTerm.toLowerCase()) || stop.code.includes(searchTerm)
//     );

//     const currentServices = liveServicesData[selectedStopCode] || [];

//     const toggleStopDetails = (stop) => {
//         const code = stop.code;
//         setExpandedStops(prev => ({ ...prev, [code]: !prev[code] }));
//         setSelectedStopCode(code); 
//         if (mapInstanceRef.current) {
//             mapInstanceRef.current.panTo({ lat: stop.latitude - 0.003, lng: stop.longitude });
//         }
//         scrollToStop(code);
//     };

//     // --- SCROLL UTILITY ---
//     const scrollToStop = (stopCode) => {
//         // Use a short timeout to ensure the DOM has updated (especially after expansion/drawer movement)
//         setTimeout(() => {
//             const element = document.getElementById(`stop-${stopCode}`);
//             if (element) {
//                 element.scrollIntoView({ 
//                     behavior: 'smooth', 
//                     block: 'start' // Scrolls the element to the top of the visible area
//                 });
//             }
//         }, 100); 
//     };

//     // Placeholder drag handlers (to avoid errors)
//     const handleTouchStart = (e) => { setIsDragging(true); setStartY(e.touches[0].clientY); };
//     const handleTouchMove = (e) => {
//         if (!isDragging) return;
//         e.preventDefault();
//         const currentY = e.touches[0].clientY;
//         const diff = startY - currentY;
//         const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//         setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
//         setStartY(currentY);
//     };
//     const handleTouchEnd = () => { setIsDragging(false); }; // Simplified drag end
//     const handleMouseDown = (e) => { setIsDragging(true); setStartY(e.clientY); };
//     const handleMouseMove = (e) => {
//         if (!isDragging) return;
//         e.preventDefault();
//         const currentY = e.clientY;
//         const diff = startY - currentY;
//         const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//         setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
//         setStartY(currentY);
//     };
//     const handleMouseUp = () => { setIsDragging(false); };

//     // useEffect(() => {
//     //     // ... (Mount/unmount listeners for drag, simplified)
//     // }, [isDragging]);
//     useEffect(() => {
//         if (isDragging) {
//             // Attach global listeners for continuous dragging
//             document.addEventListener('mousemove', handleMouseMove);
//             document.addEventListener('mouseup', handleMouseUp);
//             document.body.style.userSelect = 'none'; // Prevent selection

//         } else {
//             // Remove global listeners when dragging stops
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//             document.body.style.userSelect = '';
//         }

//         return () => {
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//             document.body.style.userSelect = '';
//         };
//     }, [isDragging, handleMouseMove, handleMouseUp]);

//     return (
//         <div className="container">
//             <div ref={mapRef} className="map-container" /> 

//             <div className="drawer" style={{ height: `${drawerHeight}vh` }}>
//                 {/* Drag handle */}
//                 <div 
//                     className="drag-handle"
//                     onTouchStart={handleTouchStart}
//                     onTouchMove={handleTouchMove}
//                     onTouchEnd={handleTouchEnd}
//                     onMouseDown={handleMouseDown}
//                     // onMouseMove={handleMouseMove}
//                     // onMouseUp={handleMouseUp}
//                 >
//                     <div className="drag-bar" />
//                 </div>

//                 <div className="drawer-header">
//                     <input
//                         type="text"
//                         placeholder="Search bus stop or bus number..."
//                         className="search-input"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>

//                 {/* Transport Tabs */}
//                 <div className="transport-tabs">
//                     <NavLink to={"/NearbyCarparks"} className="transport-tab"><span className="tab-icon"><FaCar /></span><span className="tab-label">Car</span></NavLink>
//                     <NavLink to={"/LiveTracker"} className="transport-tab transport-tab-active"><span className="tab-icon"><FaBus /></span><span className="tab-label">Bus</span></NavLink>
//                     <NavLink to={"/CrowdDensity"} className="transport-tab"><span className="tab-icon"><FaTrainSubway /></span><span className="tab-label">Train</span></NavLink>
//                 </div>

//                 <div className="content">
//                     {loadingStops && currentStopsList.length === 0 && <div className="search-info">Loading nearby stops...</div>}
//                     
//                     <div className="stops-list">
//                         {currentStopsList.length === 0 ? (
//                             <div className="empty-state"><div className="empty-state-icon">🔍</div><p className="empty-state-text">No matching stops found.</p></div>
//                         ) : (
//                           currentStopsList.map((stop) => {
//                             const isStopExpanded = expandedStops[stop.code];
//                             const services = liveServicesData[stop.code] || [];
//                             const totalServices = services.length;
//                             const isStopFav = isFavorite(stop.code, 'bus'); 

//                             return (
//                               <div key={stop.code} id={`stop-${stop.code}`} className={`stop-card ${selectedStopCode === stop.code ? "stop-card-selected" : ""}`}>
//                                 <div className="stop-header" onClick={() => toggleStopDetails(stop)}>
//                                         <div className="stop-left">
//                                             <button className="favorite-btn" onClick={(e) => {e.stopPropagation(); toggleFavorite(e, stop.code, 'bus', stop.name);}}>{isStopFav ? "⭐" : "☆"}</button>
//                                             <div>
//                                                 <div className="stop-name-row">
//                                                     <h3 className="stop-name">{stop.name}</h3>
//                                                     <span className="stop-code">{stop.code}</span>
//                                                 </div>
//                                                 <div className="stop-meta">
//                                                     {/* <span className="stop-distance">{stop.distance}</span> */}
//                                                     <span className="stop-bus-count">{totalServices} services</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <button className="expand-btn">{isStopExpanded ? "▲" : "▼"}</button>
//                                 </div>

//                                 {isStopExpanded && (
//                                   <div className="bus-arrivals">
//                                     {loadingArrivals && selectedStopCode === stop.code && services.length === 0 ? (
//                                       <div className="loading-indicator">Loading arrivals...</div>
//                                     ) : services.length === 0 ? (
//                                       <div className="empty-state-text" style={{ padding: '16px 0', textAlign: 'center', color: '#ef4444' }}>No buses arriving soon.</div>
//                                     ) : (
//                                       services.map((service, i) => (
//                                         <div key={i} className="bus-row">
//                                           <div className="bus-info">
//                                             <div className="bus-number">{service.service_no}</div>
//                                             <div className="bus-destination">→ {service.buses[0]?.destination_code || 'N/A'}</div>
//                                           </div>
//                                           <div className="arrival-times">
//                                             {service.buses.slice(0, 3).map((bus, j) => {
//                                               const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
//                                               return (
//                                                   <div key={j} className="arrival-block">
//                                                     <div className="arrival-time" style={{ backgroundColor: getArrivalColor(liveTime) }}>
//                                                         **{getArrivalLabel(liveTime)}**                                     </div>
//                                                     <span className="bus-type-label">{bus.load_display.split(' ')[0]}</span>
//                                                   </div>
//                                             )})}
//                                           </div>
//                                           <button 
//                                               className="favorite-btn" 
//                                               onClick={(e) => {e.stopPropagation(); toggleFavorite(e, service.service_no, 'bus', `Bus ${service.service_no} at ${stop.name}`);}}
//                                           >
//                                               {isFavorite(service.service_no, 'bus') ? "⭐" : "☆"}
//                                           </button>
//                                     </div>
//                                   ))
//                                 )}
//                             </div>
//                             
//                         )}
//                     </div>
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
            setNearbyBusStops([]);
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
                    ...stop 
                }));
                setNearbyBusStops(mappedResults);
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
        setTimeout(() => {
            const element = document.getElementById(`stop-${stopCode}`);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
            }
        }, 100); 
    };

    // Drag handlers
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
    const handleTouchEnd = () => { setIsDragging(false); };
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

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
        } else {
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
            {/* Back to Home Button */}
            <button 
                className="back-to-home-btn" 
                onClick={() => navigate('/Home')}
            >
                ← Back to Home
            </button>
            
            <div ref={mapRef} className="map-container" /> 

            <div className="drawer" style={{ height: `${drawerHeight}vh` }}>
                {/* Drag handle */}
                <div 
                    className="drag-handle"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
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
                                                        {getArrivalLabel(liveTime)}
                                                    </div>
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
                            )
                          })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

