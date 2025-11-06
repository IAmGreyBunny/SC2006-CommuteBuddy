
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import api from "../api";
// import { FaTrainSubway, FaBus, FaCar, FaTriangleExclamation } from "react-icons/fa6";
// import { NavLink } from "react-router-dom";
// import "./CrowdDensity.css";

// // Constants
// const defaultLocation = { lat: 1.3521, lng: 103.8198 };
// const POLL_INTERVAL = 120000;

// // Utility Functions
// const lineColors = {
//     EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//     NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//     NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//     CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//     DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//     TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
// };

// const getDensityColor = (densityCode) => {
//     const code = String(densityCode)?.toUpperCase();
//     switch (code) {
//         case "L": return "#22c55e";
//         case "M": return "#eab308";
//         case "H": return "#ef4444";
//         default: return "#64748b";
//     }
// };

// const getDensityLabel = (densityCode) => {
//     const upperCode = String(densityCode)?.toUpperCase();
//     switch (upperCode) {
//         case "L": return "LOW";
//         case "M": return "MEDIUM";
//         case "H": return "HIGH";
//         default: return "UNKNOWN";
//     }
// };

// const getDensityRank = (densityCode) => {
//     const upperCode = String(densityCode)?.toUpperCase();
//     if (upperCode === 'H') return 3;
//     if (upperCode === 'M') return 2;
//     if (upperCode === 'L') return 1;
//     return 0;
// };

// const getDensityCodeFromRank = (rank) => {
//     if (rank === 3) return 'H';
//     if (rank === 2) return 'M';
//     if (rank === 1) return 'L';
//     return 'U';
// };

// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = (lat2 - lat1) * (Math.PI / 180);
//     const dLon = (lon2 - lon1) * (Math.PI / 180);
//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//               Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
//               Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
// };

// const findNearestStations = (allStations, location) => {
//     if (!location || allStations.length === 0) return [];
//     const stationsWithDistance = allStations.map(station => ({
//         ...station,
//         distance: calculateDistance(location.lat, location.lng, station.latitude, station.longitude),
//     }));
//     stationsWithDistance.sort((a, b) => a.distance - b.distance);
//     return stationsWithDistance.slice(0, 5);
// };

// // Simple marker icon with just line color
// const createMarkerIcon = (primaryColor) => {
//     return {
//         url: "data:image/svg+xml;charset=UTF-8," +
//             encodeURIComponent(`
//                 <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 30 15 30s15-21.716 15-30c0-8.284-6.716-15-15-15z" 
//                         fill="${primaryColor}" stroke="white" stroke-width="2"/>
//                     <circle cx="20" cy="15" r="8" fill="white"/>
//                     <text x="20" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="${primaryColor}">M</text>
//                 </svg>
//             `),
//         scaledSize: new window.google.maps.Size(40, 50),
//         anchor: new window.google.maps.Point(20, 50),
//     };
// };

// const CrowdDensity = () => {
//     // --- State Variables ---
//     const [stationList, setStationList] = useState([]);
//     const [mrtStations, setMrtStations] = useState([]);
//     const [nearestStations, setNearestStations] = useState([]);
//     const [userLocation, setUserLocation] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [serviceAlerts, setServiceAlerts] = useState(null);
//     const [selectedStation, setSelectedStation] = useState(null);
//     const [drawerHeight, setDrawerHeight] = useState(30);
//     const [isDragging, setIsDragging] = useState(false);
//     const [startY, setStartY] = useState(0);
    
//     const [loadingStations, setLoadingStations] = useState(true);
//     const [loadingCrowd, setLoadingCrowd] = useState(false);
//     const [fetchError, setFetchError] = useState(null);
//     const [favorites, setFavorites] = useState([]);
    
//     const isFetchingRef = useRef(false);
//     const mapRef = useRef(null);
//     const mapInstanceRef = useRef(null);
//     const markersRef = useRef([]);

//     // --- Geolocation ---
//     const getUserLocation = useCallback(() => {
//         if (!navigator.geolocation) {
//             setFetchError("Geolocation not supported. Using default center point.");
//             setUserLocation(defaultLocation);
//             return;
//         }

//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const location = { lat: position.coords.latitude, lng: position.coords.longitude };
//                 setUserLocation(location);
//                 setFetchError(null);
//             },
//             (error) => {
//                 setFetchError(`Geolocation failed: ${error.message}. Using default center point.`);
//                 setUserLocation(defaultLocation);
//             }
//         );
//     }, []);

//     // --- API Calls ---
//     const fetchServiceAlerts = useCallback(async () => {
//         try {
//             const res = await api.get("/api/mrt-service-alerts/");
//             if (res.data.success && res.data.data?.value) {
//                 setServiceAlerts(res.data.data.value);
//             }
//         } catch (err) {
//             console.error("Error fetching MRT alerts:", err);
//         }
//     }, []);

//     const fetchAllCrowdData = useCallback(async (allStations) => {
//         if (isFetchingRef.current || allStations.length === 0) return;

//         isFetchingRef.current = true;
//         setLoadingCrowd(true);
        
//         const crowdDataMap = {};
//         const allLines = Object.keys(lineColors);
        
//         try {
//             const crowdFetchPromises = allLines.map(async (lineCode) => {
//                 try {
//                     const res = await api.get(`/api/mrt-crowd/${lineCode}/`);
//                     const crowdArray = res.data.data?.value || res.data || [];
                    
//                     if (Array.isArray(crowdArray)) {
//                         crowdArray.forEach(crowd => {
//                             const stationCode = crowd.Station;
//                             const crowdLevel = getDensityCodeFromRank(getDensityRank(crowd.CrowdLevel || 'U'));
//                             if (stationCode) {
//                                 if (!crowdDataMap[stationCode]) crowdDataMap[stationCode] = [];
//                                 crowdDataMap[stationCode].push({ 
//                                     line: lineCode, 
//                                     crowdLevel,
//                                     time: crowd.StartTime || new Date().toISOString()
//                                 });
//                             }
//                         });
//                     }
//                 } catch (error) {
//                     console.error(`Error fetching crowd for ${lineCode}:`, error.message);
//                 }
//             });

//             await Promise.all(crowdFetchPromises);

//             const combinedList = allStations.map(station => {
//                 const crowdDetails = crowdDataMap[station.code] || [];
//                 const maxRank = crowdDetails.reduce((max, detail) => Math.max(max, getDensityRank(detail.crowdLevel)), 0);
//                 return { 
//                     ...station, 
//                     maxCrowdLevel: getDensityCodeFromRank(maxRank),
//                     crowdDetails 
//                 };
//             });
            
//             setStationList(combinedList);

//             if (userLocation) {
//                 const nearest = findNearestStations(combinedList, userLocation);
//                 setNearestStations(nearest);
//             } else {
//                 setNearestStations(combinedList.slice(0, 5));
//             }
            
//         } catch (error) {
//             setFetchError("Failed to fetch crowd data. Please try again.");
//         } finally {
//             setLoadingCrowd(false);
//             isFetchingRef.current = false;
//         }
//     }, [userLocation]);

//     const fetchMrtStations = useCallback(async () => {
//         setLoadingStations(true);
//         setFetchError(null);

//         try {
//             const res = await api.get("/api/mrt-stations/");
            
//             let dataToMap = res.data;
//             if (!Array.isArray(dataToMap) && res.data.data) {
//                 dataToMap = res.data.data;
//             }
            
//             const mappedStations = dataToMap.map(station => ({
//                 name: station.name,
//                 code: station.station_code,
//                 latitude: station.latitude,
//                 longitude: station.longitude,
//                 lines: station.lines || [],
//             }));

//             setMrtStations(mappedStations);
//         } catch (error) {
//             setFetchError(`Failed to fetch station list: ${error.message}`);
//         } finally {
//             setLoadingStations(false);
//         }
//     }, []);

//     const fetchFavorites = useCallback(async () => {
//         try {
//             const res = await api.get("/api/user/favourites/");
//             setFavorites(res.data.bus_favourites || []);
//         } catch (error) {
//             console.error("Error fetching favorites:", error);
//             setFavorites([]);
//         }
//     }, []);

//     const toggleFavorite = async (stationCode, stationName) => {
//         if (!localStorage.getItem('access')) {
//             alert("You must be logged in to save favorites.");
//             return;
//         }
        
//         const fav = favorites.find(fav => fav.route_id === stationCode && fav.route_type === 'mrt');
//         try {
//             if (fav) {
//                 await api.delete(`/api/user/favourites/remove/${fav.id}/`);
//             } else {
//                 await api.post("/api/user/favourites/add/", {
//                     route_type: 'mrt',
//                     route_id: stationCode,
//                     nickname: stationName,
//                 });
//             }
//             fetchFavorites();
//         } catch (error) {
//             alert(`Failed to ${fav ? 'remove' : 'add'} favorite.`);
//         }
//     };

//     // --- Map Functions ---
//     const initializeMap = useCallback(() => {
//         if (!window.google || !mapRef.current || mrtStations.length === 0) return;

//         const map = new window.google.maps.Map(mapRef.current, {
//             center: userLocation || defaultLocation,
//             zoom: 13,
//             disableDefaultUI: false,
//             zoomControl: true,
//             mapTypeControl: false,
//             streetViewControl: false,
//             fullscreenControl: false,
//             styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
//         });

//         mapInstanceRef.current = map;
//         markersRef.current = [];

//         // Add user location marker
//         if (userLocation) {
//             new window.google.maps.Marker({
//                 position: userLocation,
//                 map,
//                 icon: {
//                     path: window.google.maps.SymbolPath.CIRCLE,
//                     scale: 10,
//                     fillColor: "#4285F4",
//                     fillOpacity: 1,
//                     strokeColor: "#ffffff",
//                     strokeWeight: 3
//                 },
//                 title: "Your Location",
//             });
//         }

//         // Add station markers with line colors only
//         mrtStations.forEach((station) => {
//             const primaryLine = station.lines.find(l => ['NSL', 'EWL', 'NEL'].includes(l.line_code)) || station.lines[0];
//             const primaryColor = primaryLine ? lineColors[primaryLine.line_code]?.color || "#64748b" : "#64748b";

//             const marker = new window.google.maps.Marker({
//                 position: { lat: station.latitude, lng: station.longitude },
//                 map,
//                 icon: createMarkerIcon(primaryColor),
//                 title: `${station.name} (${station.code})`,
//             });

//             // SIMPLE CLICK HANDLER - JUST SEARCH FOR THE STATION
//             marker.addListener("click", () => {
//                 console.log("Map marker clicked:", station.code, station.name);
//                 setSearchTerm(station.code); // Search by station code
//                 setSelectedStation(null); // Make sure we're in list view
//                 setDrawerHeight(60); // Open drawer
                
//                 // Pan to the station
//                 map.panTo({ lat: station.latitude - 0.003, lng: station.longitude });
//             });

//             markersRef.current.push({ marker, stationCode: station.code });
//         });
//     }, [mrtStations, userLocation]);

//     // --- Effects ---
//     useEffect(() => {
//         getUserLocation();
//         fetchMrtStations();
//         fetchServiceAlerts();
//         fetchFavorites();
//     }, [getUserLocation, fetchMrtStations, fetchServiceAlerts, fetchFavorites]);

//     useEffect(() => {
//         let intervalId;
        
//         if (mrtStations.length > 0 && userLocation) {
//             fetchAllCrowdData(mrtStations);
            
//             intervalId = setInterval(() => {
//                 fetchAllCrowdData(mrtStations);
//             }, POLL_INTERVAL);
//         }

//         return () => clearInterval(intervalId);
//     }, [mrtStations, userLocation, fetchAllCrowdData]);

//     // Initialize map when stations and user location are ready
//     useEffect(() => {
//         if (mrtStations.length > 0 && userLocation) {
//             // Load Google Maps if not already loaded
//             if (!window.google) {
//                 const script = document.createElement("script");
//                 script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M`;
//                 script.async = true;
//                 script.defer = true;
//                 script.onload = () => initializeMap();
//                 document.head.appendChild(script);
//             } else {
//                 initializeMap();
//             }
//         }
//     }, [mrtStations, userLocation, initializeMap]);

//     // --- Drawer Handlers ---
//     const handleTouchStart = (e) => {
//         setIsDragging(true);
//         setStartY(e.touches[0].clientY);
//     };

//     const handleTouchMove = (e) => {
//         if (!isDragging) return;
//         e.preventDefault();
//         const currentY = e.touches[0].clientY;
//         const diff = startY - currentY;
//         const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//         setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
//         setStartY(currentY);
//     };

//     const handleTouchEnd = () => {
//         setIsDragging(false);
//     };

//     const handleMouseDown = (e) => {
//         setIsDragging(true);
//         setStartY(e.clientY);
//     };

//     const handleMouseMove = (e) => {
//         if (!isDragging) return;
//         e.preventDefault();
//         const currentY = e.clientY;
//         const diff = startY - currentY;
//         const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//         setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
//         setStartY(currentY);
//     };

//     const handleMouseUp = () => {
//         setIsDragging(false);
//     };

//     useEffect(() => {
//         if (isDragging) {
//             document.addEventListener('mousemove', handleMouseMove);
//             document.addEventListener('mouseup', handleMouseUp);
//             document.body.style.userSelect = 'none';
//         } else {
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//             document.body.style.userSelect = '';
//         }

//         return () => {
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//             document.body.style.userSelect = '';
//         };
//     }, [isDragging]);

//     // --- Render Logic ---
//     const filteredStations = stationList.filter(station =>
//         station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         station.code.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     const displayList = searchTerm ? filteredStations : nearestStations;
//     const title = searchTerm 
//         ? `Search Results (${displayList.length})`
//         : `Nearest Stations (${displayList.length})`;

//     const getStationGradient = (stationLines) => {
//         const colors = stationLines.map(line => lineColors[line.line_code]?.color).filter(Boolean);
//         if (colors.length === 1) {
//             return { background: colors[0] };
//         } else if (colors.length > 1) {
//             return { 
//                 background: `linear-gradient(135deg, ${colors.join(', ')})`
//             };
//         }
//         return { background: "#475569" };
//     };

//     const isFavorite = (stationCode) => {
//         return favorites.some(fav => fav.route_id === stationCode && fav.route_type === 'mrt');
//     };

//     return (
//         <div className="crowd-container">
//             <div ref={mapRef} className="crowd-map"></div>
            
//             <div className="drawer" style={{ height: `${drawerHeight}vh` }}>
//                 <div 
//                     className="drag-handle"
//                     onTouchStart={handleTouchStart}
//                     onTouchMove={handleTouchMove}
//                     onTouchEnd={handleTouchEnd}
//                     onMouseDown={handleMouseDown}
//                 >
//                     <div className="drag-bar" />
//                 </div>

//                 <div className="transport-tabs">
//                     <NavLink to={"/NearbyCarparks"} className="transport-tab">
//                         <span className="tab-icon"><FaCar /></span>
//                         <span className="tab-label">Car</span>
//                     </NavLink>
//                     <NavLink to={"/LiveTracker"} className="transport-tab">
//                         <span className="tab-icon"><FaBus /></span>
//                         <span className="tab-label">Bus</span>
//                     </NavLink>
//                     <NavLink to={"/CrowdDensity"} className="transport-tab transport-tab-active">
//                         <span className="tab-icon"><FaTrainSubway /></span>
//                         <span className="tab-label">Train</span>
//                     </NavLink>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
//                     {/* Search Bar */}
//                     <input 
//                         type="text"
//                         placeholder="Search MRT by name or code (e.g., Jurong East, NS1)"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={{
//                             width: '100%', padding: '10px', margin: '10px 0',
//                             borderRadius: '4px', border: '1px solid #ccc',
//                             boxSizing: 'border-box'
//                         }}
//                     />

//                     {/* Error Display */}
//                     {fetchError && (
//                         <div style={{ 
//                             backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
//                             borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
//                         }}>
//                             <FaTriangleExclamation style={{ marginRight: '8px' }} />
//                             {fetchError}
//                         </div>
//                     )}

//                     {/* Service Alerts */}
//                     {serviceAlerts && serviceAlerts.Status !== 1 && (
//                         <div style={{ 
//                             backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', 
//                             borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' 
//                         }}>
//                             ⚠️ Service Alert: {serviceAlerts.Message?.[0]?.Content || "Check LTA for details."}
//                         </div>
//                     )}

//                     {loadingStations || loadingCrowd ? (
//                         <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
//                             Loading Stations and Crowd Data...
//                         </div>
//                     ) : selectedStation ? (
//                         // Station Details View
//                         <div className="station-details">
//                             <header style={{ 
//                                 ...getStationGradient(selectedStation.lines),
//                                 padding: '20px', 
//                                 borderRadius: '16px',
//                                 color: 'white',
//                                 marginBottom: '16px',
//                             }}>
//                                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
//                                     <h2>{selectedStation.name}</h2>
//                                     <button 
//                                         className="favorite-btn" 
//                                         onClick={() => toggleFavorite(selectedStation.code, selectedStation.name)}
//                                         style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'white'}}
//                                     >
//                                         {isFavorite(selectedStation.code) ? "⭐" : "☆"}
//                                     </button>
//                                 </div>
//                                 <p style={{ margin: '4px 0', fontSize: '14px', opacity: 0.8 }}>
//                                     {selectedStation.lines.map(l => l.line_code).join(" • ")}
//                                 </p>
//                                 <span
//                                     className="crowd-badge"
//                                     style={{
//                                         backgroundColor: getDensityColor(selectedStation.maxCrowdLevel),
//                                         color: 'white',
//                                         marginTop: '10px'
//                                     }}
//                                 >
//                                     Overall Crowd: {getDensityLabel(selectedStation.maxCrowdLevel)}
//                                 </span>
//                             </header>

//                             <button 
//                                 onClick={() => setSelectedStation(null)}
//                                 style={{
//                                     padding: '8px 16px',
//                                     marginBottom: '16px',
//                                     backgroundColor: '#f3f4f6',
//                                     border: '1px solid #d1d5db',
//                                     borderRadius: '8px',
//                                     cursor: 'pointer'
//                                 }}
//                             >
//                                 ← Back to Station List
//                             </button>

//                             <h3>Live Platform Crowd Status</h3>
//                             {selectedStation.crowdDetails?.length === 0 ? (
//                                 <div className="empty-state-text" style={{ padding: '20px 0', textAlign: 'center', color: '#64748b' }}>
//                                     No real-time crowd data available for this station.
//                                 </div>
//                             ) : (
//                                 selectedStation.crowdDetails?.map((data, index) => (
//                                     <div key={index} style={{
//                                         backgroundColor: '#f9fafb',
//                                         borderRadius: '12px',
//                                         padding: '16px',
//                                         marginBottom: '12px',
//                                         borderLeft: `5px solid ${lineColors[data.line]?.color || '#64748b'}`
//                                     }}>
//                                         <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: lineColors[data.line]?.color || '#64748b' }}>
//                                             {lineColors[data.line]?.name || data.line}
//                                         </p>
//                                         <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
//                                             Time: {new Date(data.time).toLocaleTimeString()}
//                                         </p>
//                                         <span
//                                             className="crowd-badge"
//                                             style={{ backgroundColor: getDensityColor(data.crowdLevel), color: 'white' }}
//                                         >
//                                             {getDensityLabel(data.crowdLevel)}
//                                         </span>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     ) : (
//                         // Station List View
//                         <div className="station-list-container">
//                             <h2>{title}</h2>
                            
//                             {displayList.length === 0 ? (
//                                 <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
//                                     {searchTerm 
//                                         ? "No stations match your search term."
//                                         : "Could not find nearest stations. Try searching."
//                                     }
//                                 </p>
//                             ) : (
//                                 displayList.map(station => (
//                                     <div 
//                                         key={station.code} 
//                                         id={`station-${station.code}`}
//                                         className="list-item"
//                                         onClick={() => setSelectedStation(station)}
//                                         style={{
//                                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                             padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                             borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer',
//                                             borderLeft: `4px solid ${lineColors[station.lines[0]?.line_code]?.color || '#64748b'}`
//                                         }}
//                                     >
//                                         <div style={{flexGrow: 1}}>
//                                             <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
//                                                 {station.name} ({station.code})
//                                             </h4>
//                                             <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                                 Lines: {station.lines.map(l => l.line_code).join(" • ")}
//                                                 {station.distance !== undefined && 
//                                                     <span style={{ marginLeft: '10px', fontStyle: 'italic', color: '#4b5563' }}>
//                                                         ({station.distance.toFixed(2)} km away)
//                                                     </span>
//                                                 }
//                                             </p>
//                                         </div>
//                                         <span
//                                             className="crowd-badge"
//                                             style={{ 
//                                                 backgroundColor: getDensityColor(station.maxCrowdLevel),
//                                                 color: 'white',
//                                                 padding: '4px 8px',
//                                                 borderRadius: '9999px',
//                                                 fontSize: '12px',
//                                                 fontWeight: '700'
//                                             }}
//                                         >
//                                             {getDensityLabel(station.maxCrowdLevel)}
//                                         </span>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CrowdDensity;




import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../api";
import { FaTrainSubway, FaBus, FaCar, FaTriangleExclamation } from "react-icons/fa6";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./CrowdDensity.css";

// Constants
const defaultLocation = { lat: 1.3521, lng: 103.8198 };
const POLL_INTERVAL = 120000;

// Utility Functions
const lineColors = {
    EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
    NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
    NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
    CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
    DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
    TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
};

const getDensityColor = (densityCode) => {
    const code = String(densityCode)?.toUpperCase();
    switch (code) {
        case "L": return "#22c55e";
        case "M": return "#eab308";
        case "H": return "#ef4444";
        default: return "#64748b";
    }
};

const getDensityLabel = (densityCode) => {
    const upperCode = String(densityCode)?.toUpperCase();
    switch (upperCode) {
        case "L": return "LOW";
        case "M": return "MEDIUM";
        case "H": return "HIGH";
        default: return "UNKNOWN";
    }
};

const getDensityRank = (densityCode) => {
    const upperCode = String(densityCode)?.toUpperCase();
    if (upperCode === 'H') return 3;
    if (upperCode === 'M') return 2;
    if (upperCode === 'L') return 1;
    return 0;
};

const getDensityCodeFromRank = (rank) => {
    if (rank === 3) return 'H';
    if (rank === 2) return 'M';
    if (rank === 1) return 'L';
    return 'U';
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const findNearestStations = (allStations, location) => {
    if (!location || allStations.length === 0) return [];
    const stationsWithDistance = allStations.map(station => ({
        ...station,
        distance: calculateDistance(location.lat, location.lng, station.latitude, station.longitude),
    }));
    stationsWithDistance.sort((a, b) => a.distance - b.distance);
    return stationsWithDistance.slice(0, 5);
};

// Simple marker icon with just line color
const createMarkerIcon = (primaryColor) => {
    return {
        url: "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
                <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 30 15 30s15-21.716 15-30c0-8.284-6.716-15-15-15z" 
                        fill="${primaryColor}" stroke="white" stroke-width="2"/>
                    <circle cx="20" cy="15" r="8" fill="white"/>
                    <text x="20" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="${primaryColor}">M</text>
                </svg>
            `),
        scaledSize: new window.google.maps.Size(40, 50),
        anchor: new window.google.maps.Point(20, 50),
    };
};

const CrowdDensity = () => {
    // --- State Variables ---
    const [stationList, setStationList] = useState([]);
    const [mrtStations, setMrtStations] = useState([]);
    const [nearestStations, setNearestStations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceAlerts, setServiceAlerts] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [drawerHeight, setDrawerHeight] = useState(30);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    
    const [loadingStations, setLoadingStations] = useState(true);
    const [loadingCrowd, setLoadingCrowd] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    
    const isFetchingRef = useRef(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access navigation state

    // --- Geolocation ---
    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setFetchError("Geolocation not supported. Using default center point.");
            setUserLocation(defaultLocation);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                setUserLocation(location);
                setFetchError(null);
            },
            (error) => {
                setFetchError(`Geolocation failed: ${error.message}. Using default center point.`);
                setUserLocation(defaultLocation);
            }
        );
    }, []);

    // --- API Calls ---
    const fetchServiceAlerts = useCallback(async () => {
        try {
            const res = await api.get("/api/mrt-service-alerts/");
            if (res.data.success && res.data.data?.value) {
                setServiceAlerts(res.data.data.value);
            }
        } catch (err) {
            console.error("Error fetching MRT alerts:", err);
        }
    }, []);

    const fetchAllCrowdData = useCallback(async (allStations) => {
        if (isFetchingRef.current || allStations.length === 0) return;

        isFetchingRef.current = true;
        setLoadingCrowd(true);
        
        const crowdDataMap = {};
        const allLines = Object.keys(lineColors);
        
        try {
            const crowdFetchPromises = allLines.map(async (lineCode) => {
                try {
                    const res = await api.get(`/api/mrt-crowd/${lineCode}/`);
                    const crowdArray = res.data.data?.value || res.data || [];
                    
                    if (Array.isArray(crowdArray)) {
                        crowdArray.forEach(crowd => {
                            const stationCode = crowd.Station;
                            const crowdLevel = getDensityCodeFromRank(getDensityRank(crowd.CrowdLevel || 'U'));
                            if (stationCode) {
                                if (!crowdDataMap[stationCode]) crowdDataMap[stationCode] = [];
                                crowdDataMap[stationCode].push({ 
                                    line: lineCode, 
                                    crowdLevel,
                                    time: crowd.StartTime || new Date().toISOString()
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching crowd for ${lineCode}:`, error.message);
                }
            });

            await Promise.all(crowdFetchPromises);

            const combinedList = allStations.map(station => {
                const crowdDetails = crowdDataMap[station.code] || [];
                const maxRank = crowdDetails.reduce((max, detail) => Math.max(max, getDensityRank(detail.crowdLevel)), 0);
                return { 
                    ...station, 
                    maxCrowdLevel: getDensityCodeFromRank(maxRank),
                    crowdDetails 
                };
            });
            
            setStationList(combinedList);

            if (userLocation) {
                const nearest = findNearestStations(combinedList, userLocation);
                setNearestStations(nearest);
            } else {
                setNearestStations(combinedList.slice(0, 5));
            }
            
        } catch (error) {
            setFetchError("Failed to fetch crowd data. Please try again.");
        } finally {
            setLoadingCrowd(false);
            isFetchingRef.current = false;
        }
    }, [userLocation]);

    const fetchMrtStations = useCallback(async () => {
        setLoadingStations(true);
        setFetchError(null);

        try {
            const res = await api.get("/api/mrt-stations/");
            
            let dataToMap = res.data;
            if (!Array.isArray(dataToMap) && res.data.data) {
                dataToMap = res.data.data;
            }
            
            const mappedStations = dataToMap.map(station => ({
                name: station.name,
                code: station.station_code,
                latitude: station.latitude,
                longitude: station.longitude,
                lines: station.lines || [],
            }));

            setMrtStations(mappedStations);
        } catch (error) {
            setFetchError(`Failed to fetch station list: ${error.message}`);
        } finally {
            setLoadingStations(false);
        }
    }, []);

    const fetchFavorites = useCallback(async () => {
        try {
            const res = await api.get("/api/user/favourites/");
            setFavorites(res.data.bus_favourites || []);
        } catch (error) {
            console.error("Error fetching favorites:", error);
            setFavorites([]);
        }
    }, []);

    const toggleFavorite = async (stationCode, stationName) => {
        if (!localStorage.getItem('access')) {
            alert("You must be logged in to save favorites.");
            return;
        }
        
        const fav = favorites.find(fav => fav.route_id === stationCode && fav.route_type === 'mrt');
        try {
            if (fav) {
                await api.delete(`/api/user/favourites/remove/${fav.id}/`);
            } else {
                await api.post("/api/user/favourites/add/", {
                    route_type: 'mrt',
                    route_id: stationCode,
                    nickname: stationName,
                });
            }
            fetchFavorites();
        } catch (error) {
            alert(`Failed to ${fav ? 'remove' : 'add'} favorite.`);
        }
    };

    // --- Map Functions ---
    const initializeMap = useCallback(() => {
        if (!window.google || !mapRef.current || mrtStations.length === 0) return;

        const map = new window.google.maps.Map(mapRef.current, {
            center: userLocation || defaultLocation,
            zoom: 13,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
        });

        mapInstanceRef.current = map;
        markersRef.current = [];

        // Add user location marker
        if (userLocation) {
            new window.google.maps.Marker({
                position: userLocation,
                map,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 3
                },
                title: "Your Location",
            });
        }

        // Add station markers with line colors only
        mrtStations.forEach((station) => {
            const primaryLine = station.lines.find(l => ['NSL', 'EWL', 'NEL'].includes(l.line_code)) || station.lines[0];
            const primaryColor = primaryLine ? lineColors[primaryLine.line_code]?.color || "#64748b" : "#64748b";

            const marker = new window.google.maps.Marker({
                position: { lat: station.latitude, lng: station.longitude },
                map,
                icon: createMarkerIcon(primaryColor),
                title: `${station.name} (${station.code})`,
            });

            marker.addListener("click", () => {
                console.log("Map marker clicked:", station.code, station.name);
                setSearchTerm(station.code);
                setSelectedStation(null);
                setDrawerHeight(60);
                
                map.panTo({ lat: station.latitude - 0.003, lng: station.longitude });
            });

            markersRef.current.push({ marker, stationCode: station.code });
        });
    }, [mrtStations, userLocation]);

    // --- Effects ---
    useEffect(() => {
        getUserLocation();
        fetchMrtStations();
        fetchServiceAlerts();
        fetchFavorites();

        if (location.state?.targetType === 'mrt' && location.state.targetCode) {
            const favStationCode = location.state.targetCode;

            // Set the search term to immediately filter the list
            setSearchTerm(favStationCode);
            setDrawerHeight(60); 

            // Clear the state after use
            navigate(location.pathname, { replace: true, state: {} });
        }

    }, [getUserLocation, fetchMrtStations, fetchServiceAlerts, fetchFavorites, location.state?.targetCode, navigate]);

    useEffect(() => {
        let intervalId;
        
        if (mrtStations.length > 0 && userLocation) {
            fetchAllCrowdData(mrtStations);
            
            intervalId = setInterval(() => {
                fetchAllCrowdData(mrtStations);
            }, POLL_INTERVAL);
        }

        return () => clearInterval(intervalId);
    }, [mrtStations, userLocation, fetchAllCrowdData]);

    useEffect(() => {
        if (mrtStations.length > 0 && userLocation) {
            if (!window.google) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M`;
                script.async = true;
                script.defer = true;
                script.onload = () => initializeMap();
                document.head.appendChild(script);
            } else {
                initializeMap();
            }
        }
    }, [mrtStations, userLocation, initializeMap]);

    // --- Drawer Handlers ---
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentY = e.touches[0].clientY;
        const diff = startY - currentY;
        const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
        setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
        setStartY(currentY);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartY(e.clientY);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentY = e.clientY;
        const diff = startY - currentY;
        const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
        setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
        setStartY(currentY);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

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
    }, [isDragging]);

    // --- Render Logic ---
    const filteredStations = stationList.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (searchTerm && filteredStations.length === 1 && filteredStations[0].code.toLowerCase() === searchTerm.toLowerCase()) {
            setSelectedStation(filteredStations[0]);
        }
    }, [searchTerm, filteredStations]);
    
    const displayList = searchTerm ? filteredStations : nearestStations;
    const title = searchTerm 
        ? `Search Results (${displayList.length})`
        : `Nearest Stations (${displayList.length})`;

    const getStationGradient = (stationLines) => {
        const colors = stationLines.map(line => lineColors[line.line_code]?.color).filter(Boolean);
        if (colors.length === 1) {
            return { background: colors[0] };
        } else if (colors.length > 1) {
            return { 
                background: `linear-gradient(135deg, ${colors.join(', ')})`
            };
        }
        return { background: "#475569" };
    };

    const isFavorite = (stationCode) => {
        return favorites.some(fav => fav.route_id === stationCode && fav.route_type === 'mrt');
    };

    return (
        <div className="crowd-container">
            {/* Back to Home Button */}
            <button 
                className="back-to-home-btn" 
                onClick={() => navigate('/Home')}
            >
                ← Back to Home
            </button>

            <div ref={mapRef} className="crowd-map"></div>
            
            <div className="drawer" style={{ height: `${drawerHeight}vh` }}>
                <div 
                    className="drag-handle"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                >
                    <div className="drag-bar" />
                </div>

                <div className="transport-tabs">
                    <NavLink to={"/NearbyCarparks"} className="transport-tab">
                        <span className="tab-icon"><FaCar /></span>
                        <span className="tab-label">Car</span>
                    </NavLink>
                    <NavLink to={"/LiveTracker"} className="transport-tab">
                        <span className="tab-icon"><FaBus /></span>
                        <span className="tab-label">Bus</span>
                    </NavLink>
                    <NavLink to={"/CrowdDensity"} className="transport-tab transport-tab-active">
                        <span className="tab-icon"><FaTrainSubway /></span>
                        <span className="tab-label">Train</span>
                    </NavLink>
                </div>

                <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
                    {/* Search Bar */}
                    <input 
                        type="text"
                        placeholder="Search MRT by name or code (e.g., Jurong East, NS1)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '10px', margin: '10px 0',
                            borderRadius: '4px', border: '1px solid #ccc',
                            boxSizing: 'border-box'
                        }}
                    />

                    {/* Error Display */}
                    {fetchError && (
                        <div style={{ 
                            backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
                            borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
                        }}>
                            <FaTriangleExclamation style={{ marginRight: '8px' }} />
                            {fetchError}
                        </div>
                    )}

                    {/* Service Alerts */}
                    {serviceAlerts && serviceAlerts.Status !== 1 && (
                        <div style={{ 
                            backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', 
                            borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' 
                        }}>
                            ⚠️ Service Alert: {serviceAlerts.Message?.[0]?.Content || "Check LTA for details."}
                        </div>
                    )}

                    {loadingStations || loadingCrowd ? (
                        <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
                            Loading Stations and Crowd Data...
                        </div>
                    ) : selectedStation ? (
                        // Station Details View
                        <div className="station-details">
                            <header style={{ 
                                ...getStationGradient(selectedStation.lines),
                                padding: '20px', 
                                borderRadius: '16px',
                                color: 'white',
                                marginBottom: '16px',
                            }}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <h2>{selectedStation.name}</h2>
                                    <button 
                                        className="favorite-btn" 
                                        onClick={() => toggleFavorite(selectedStation.code, selectedStation.name)}
                                        style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'white'}}
                                    >
                                        {isFavorite(selectedStation.code) ? "⭐" : "☆"}
                                    </button>
                                </div>
                                <p style={{ margin: '4px 0', fontSize: '14px', opacity: 0.8 }}>
                                    {selectedStation.lines.map(l => l.line_code).join(" • ")}
                                </p>
                                <span
                                    className="crowd-badge"
                                    style={{
                                        backgroundColor: getDensityColor(selectedStation.maxCrowdLevel),
                                        color: 'white',
                                        marginTop: '10px'
                                    }}
                                >
                                    Overall Crowd: {getDensityLabel(selectedStation.maxCrowdLevel)}
                                </span>
                            </header>

                            <button 
                                onClick={() => setSelectedStation(null)}
                                style={{
                                    padding: '8px 16px',
                                    marginBottom: '16px',
                                    backgroundColor: '#f3f4f6',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Back to Station List
                            </button>

                            <h3>Live Platform Crowd Status</h3>
                            {selectedStation.crowdDetails?.length === 0 ? (
                                <div className="empty-state-text" style={{ padding: '20px 0', textAlign: 'center', color: '#64748b' }}>
                                    No real-time crowd data available for this station.
                                </div>
                            ) : (
                                selectedStation.crowdDetails?.map((data, index) => (
                                    <div key={index} style={{
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        marginBottom: '12px',
                                        borderLeft: `5px solid ${lineColors[data.line]?.color || '#64748b'}`
                                    }}>
                                        <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: lineColors[data.line]?.color || '#64748b' }}>
                                            {lineColors[data.line]?.name || data.line}
                                        </p>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                                            Time: {new Date(data.time).toLocaleTimeString()}
                                        </p>
                                        <span
                                            className="crowd-badge"
                                            style={{ backgroundColor: getDensityColor(data.crowdLevel), color: 'white' }}
                                        >
                                            {getDensityLabel(data.crowdLevel)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        // Station List View
                        <div className="station-list-container">
                            <h2>{title}</h2>
                            
                            {displayList.length === 0 ? (
                                <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                                    {searchTerm 
                                        ? "No stations match your search term."
                                        : "Could not find nearest stations. Try searching."
                                    }
                                </p>
                            ) : (
                                displayList.map(station => (
                                    <div 
                                        key={station.code} 
                                        id={`station-${station.code}`}
                                        className="list-item"
                                        onClick={() => setSelectedStation(station)}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
                                            borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer',
                                            borderLeft: `4px solid ${lineColors[station.lines[0]?.line_code]?.color || '#64748b'}`
                                        }}
                                    >
                                        <div style={{flexGrow: 1}}>
                                            <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
                                                {station.name} ({station.code})
                                            </h4>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                                                Lines: {station.lines.map(l => l.line_code).join(" • ")}
                                                {station.distance !== undefined && 
                                                    <span style={{ marginLeft: '10px', fontStyle: 'italic', color: '#4b5563' }}>
                                                        ({station.distance.toFixed(2)} km away)
                                                    </span>
                                                }
                                            </p>
                                        </div>
                                        <span
                                            className="crowd-badge"
                                            style={{ 
                                                backgroundColor: getDensityColor(station.maxCrowdLevel),
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: '700'
                                            }}
                                        >
                                            {getDensityLabel(station.maxCrowdLevel)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrowdDensity;





