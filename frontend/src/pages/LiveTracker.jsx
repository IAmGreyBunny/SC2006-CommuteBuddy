// frontend/src/pages/LiveTracker.jsx - UPDATED FOR BACKEND INTEGRATION

import { useState, useEffect, useRef, useCallback } from "react";
import { FaTrainSubway, FaBus, FaCar } from "react-icons/fa6";
import { NavLink, useNavigate } from "react-router-dom";
// Use the new custom API functions from api.js
import { getNearbyLocations, getBusArrivals, getFavorites, addFavorite, removeFavorite } from "../api"; 
import BusIcon from "../assets/bus1.png"; // Your bus image/icon
import "./LiveTracker.css";

// Helper to determine arrival time color based on minutes
const getArrivalColor = (time) =>
    time <= 2 ? "#ef4444" : time <= 5 ? "#f59e0b" : "#3bb59d";

// Helper to format arrival time string
const getArrivalLabel = (time) =>
    time === 0 ? "Arr" : time === 1 ? "1 min" : `${time} min`;

export default function LiveTracker() {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedStops, setExpandedStops] = useState({});
    const [drawerHeight, setDrawerHeight] = useState(30);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    
    // --- LIVE DATA STATES ---
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyBusStops, setNearbyBusStops] = useState([]);
    const [nearbyMrtStations, setNearbyMrtStations] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedStopCode, setSelectedStopCode] = useState(null);
    const [busArrivals, setBusArrivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const navigate = useNavigate();

    // --- Core Data Fetching Functions ---

    // 1. Fetch User's Favorites
    const fetchFavorites = useCallback(async () => {
        try {
            const favs = await getFavorites();
            setFavorites(favs);
        } catch (e) {
            // Not a critical error, likely means not logged in or no favorites
            console.warn("Could not load user favorites. Login status check needed.", e);
        }
    }, []);

    // 2. Fetch Nearby Locations
    const fetchNearbyData = useCallback(async (lat, lng) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getNearbyLocations(lat, lng, 800); // 800m radius
            
            // Map the favorite status onto the fetched data
            const favIds = favorites.map(f => f.route_id);
            const busStopsWithFav = data.busStops.map(stop => ({
                ...stop,
                is_favorite: favIds.includes(stop.bus_stop_code),
                favorite_id: favorites.find(f => f.route_id === stop.bus_stop_code)?.id,
                type: 'bus',
                // Mock distance as backend data doesn't include it; would calculate here if needed
                distance: `${Math.round(Math.random() * 1.5 * 10) / 10} km` 
            }));
            const mrtStationsWithFav = data.mrtStations.map(station => ({
                ...station,
                is_favorite: favIds.includes(station.station_code),
                favorite_id: favorites.find(f => f.route_id === station.station_code)?.id,
                type: 'mrt',
                distance: `${Math.round(Math.random() * 1.5 * 10) / 10} km`
            }));

            setNearbyBusStops(busStopsWithFav);
            setNearbyMrtStations(mrtStationsWithFav);

            // Re-render markers if the map is initialized
            if (mapInstanceRef.current) {
                renderMarkers(mapInstanceRef.current, busStopsWithFav, mrtStationsWithFav);
            }

        } catch (e) {
            setError("Failed to load nearby stops and stations.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [favorites]); // Re-run when favorites change to update star icons

    // 3. Fetch Bus Arrivals on Selection
    const fetchAndDisplayArrivals = async (code) => {
        setSelectedStopCode(code);
        setLoading(true);
        try {
            const arrivals = await getBusArrivals(code);
            setBusArrivals(arrivals);
            setError(null);
        } catch (e) {
            setError(`Failed to fetch arrivals for ${code}.`);
            setBusArrivals([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Geolocation & Initial Load ---
    useEffect(() => {
        // Start by fetching favorites
        fetchFavorites();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newLocation = { lat: latitude, lng: longitude };
                    setUserLocation(newLocation);
                    // Map initialization depends on the location and a loaded API
                    initializeMap(newLocation); 
                },
                (err) => {
                    console.error("Geolocation Error:", err);
                    setError("Location access denied. Displaying general map view.");
                    setLoading(false);
                    // Still initialize map, but centered generally on SG
                    initializeMap({ lat: 1.3521, lng: 103.8198 }); 
                }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            initializeMap({ lat: 1.3521, lng: 103.8198 });
        }
    }, [fetchFavorites]);

    // Fetch nearby data once location and favorites are available
    useEffect(() => {
        if (userLocation && favorites.length > -1) {
            fetchNearbyData(userLocation.lat, userLocation.lng);
        }
    }, [userLocation, favorites.length]); // dependencies: user location and favorites count

    // --- Map Logic ---

    const initializeMap = (center) => {
        if (!window.google || !mapRef.current) return;

        const map = new window.google.maps.Map(mapRef.current, {
            center: center,
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
        });

        mapInstanceRef.current = map;

        // User Location Marker
        new window.google.maps.Marker({
            position: center,
            map: map,
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#0095FF",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3,
            },
            title: "Your Location",
        });

        // Initial render of transport markers (will be updated when data loads)
        renderMarkers(map, nearbyBusStops, nearbyMrtStations);
    };

    const renderMarkers = (map, busStops, mrtStations) => {
        // Clear old markers
        markersRef.current.forEach((m) => m.marker.setMap(null));
        markersRef.current = [];

        [...busStops, ...mrtStations].forEach((stopOrStation) => {
            const isBus = stopOrStation.type === 'bus';
            const iconUrl = isBus ? BusIcon : 'https://maps.google.com/mapfiles/kml/shapes/rail.png';
            const size = isBus ? new window.google.maps.Size(35, 35) : new window.google.maps.Size(30, 30);
            
            const marker = new window.google.maps.Marker({
                position: { lat: stopOrStation.latitude, lng: stopOrStation.longitude },
                map: map,
                icon: {
                    url: iconUrl,
                    scaledSize: size,
                    // If MRT, adjust anchor point for better visibility
                    ...(isBus ? {} : { anchor: new window.google.maps.Point(15, 30) })
                },
                title: stopOrStation.name || stopOrStation.description,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `<div style="font-weight: 600; color: #1a1a1a; padding: 4px 8px; line-height: 1;">${stopOrStation.name || stopOrStation.description}</div>`,
                maxWidth: 200,
            });

            marker.addListener("click", () => {
                markersRef.current.forEach((m) => m.infoWindow.close());
                infoWindow.open(map, marker);
                
                // When marker is clicked, expand the drawer and fetch details
                if (isBus) {
                    fetchAndDisplayArrivals(stopOrStation.bus_stop_code);
                    toggleExpand(stopOrStation.bus_stop_code);
                    setSelectedStop(stopOrStation);
                } else {
                    navigate(`/crowd-density/${stopOrStation.station_code}`);
                }
                setDrawerHeight(60); 
                map.panTo({ lat: stopOrStation.latitude - 0.003, lng: stopOrStation.longitude });
            });

            markersRef.current.push({ marker, infoWindow });
        });
    };

    // --- Favorite Toggle Logic ---
    const handleFavoriteToggle = async (type, id, favoriteId) => {
        const isFav = favoriteId !== undefined;
        try {
            if (isFav) {
                await removeFavorite(favoriteId);
            } else {
                await addFavorite(type, id);
            }
            // Re-fetch favorites to update state, which will trigger fetchNearbyData
            await fetchFavorites();
        } catch (e) {
            alert(`Failed to update favorite: ${e.message}`);
        }
    };


    // --- UI/Drawer Logic (kept minimal) ---

    // Drawer handlers (kept as is for functionality)
    const handleTouchStart = (e) => { setIsDragging(true); setStartY(e.touches[0].clientY); };
    const handleTouchMove = (e) => {
        if (!isDragging) return; e.preventDefault();
        const currentY = e.touches[0].clientY;
        const diff = startY - currentY;
        const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
        setDrawerHeight(Math.max(20, Math.min(90, newHeight))); setStartY(currentY);
    };
    const handleTouchEnd = () => { setIsDragging(false); snapToPosition(); };
    const handleMouseDown = (e) => { setIsDragging(true); setStartY(e.clientY); };
    const handleMouseMove = (e) => {
        if (!isDragging) return; e.preventDefault();
        const currentY = e.clientY;
        const diff = startY - currentY;
        const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
        setDrawerHeight(Math.max(20, Math.min(90, newHeight))); setStartY(currentY);
    };
    const handleMouseUp = () => { setIsDragging(false); snapToPosition(); };
    const snapToPosition = () => {
        if (drawerHeight < 40) setDrawerHeight(30);
        else if (drawerHeight > 70) setDrawerHeight(85);
        else setDrawerHeight(60);
    };
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, startY, drawerHeight]);

    const toggleExpand = (code) =>
        setExpandedStops((prev) => ({ ...prev, [code]: !prev[code] }));

    // Combined and sorted list for display in the drawer
    const combinedStops = [...nearbyBusStops, ...nearbyMrtStations].filter(item => 
        (item.name || item.description).toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.bus_stop_code?.includes(searchTerm) || 
        item.station_code?.includes(searchTerm)
    ).sort(
        (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );

    // --- RENDER ---

    if (loading && !userLocation && !error) return <div className="loading">🛰️ Locating transport...</div>;
    
    // We combine MRT and Bus for the main list, but need to clearly separate them in the display.
    const renderBusStopsList = combinedStops.filter(item => item.type === 'bus').map((stop) => (
        <div
            key={stop.bus_stop_code}
            id={`stop-${stop.bus_stop_code}`}
            className={`stop-card ${selectedStopCode === stop.bus_stop_code ? "stop-card-selected" : ""}`}
        >
            <div className="stop-header" onClick={() => fetchAndDisplayArrivals(stop.bus_stop_code)}>
                <div className="stop-left">
                    <button 
                        className="favorite-btn" 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card expansion
                            handleFavoriteToggle('bus', stop.bus_stop_code, stop.favorite_id);
                        }}
                    >
                        {stop.is_favorite ? '⭐' : '☆'}
                    </button>
                    <div>
                        <div className="stop-name-row">
                            <h3 className="stop-name">{stop.description}</h3>
                            <span className="stop-code">{stop.bus_stop_code}</span>
                        </div>
                        <div className="stop-meta">
                            <span className="stop-distance">Approx. {stop.distance}</span>
                        </div>
                    </div>
                </div>
                <button className="expand-btn" onClick={(e) => { e.stopPropagation(); toggleExpand(stop.bus_stop_code); }}>
                    {expandedStops[stop.bus_stop_code] ? "▲" : "▼"}
                </button>
            </div>

            {/* BUS ARRIVAL DETAILS (Conditional) */}
            {expandedStops[stop.bus_stop_code] && selectedStopCode === stop.bus_stop_code && (
                <div className="bus-arrivals">
                    {loading ? (
                        <p>Loading arrivals...</p>
                    ) : busArrivals.length === 0 ? (
                        <p>No real-time arrivals available.</p>
                    ) : (
                        busArrivals.map((service, i) => (
                            <div key={i} className="bus-row">
                                <div className="bus-info">
                                    <div className="bus-number">{service.service_no}</div>
                                    <div className="bus-destination">→ {service.operator_name}</div>
                                </div>
                                <div className="arrival-times">
                                    {service.buses.slice(0, 3).map((bus, j) => (
                                        <div key={j} className="arrival-block">
                                            <div
                                                className="arrival-time"
                                                style={{ backgroundColor: getArrivalColor(bus.waiting_time) }}
                                            >
                                                {getArrivalLabel(bus.waiting_time)}
                                            </div>
                                            <div className="bus-type-label">{bus.load_display.split(' ')[0]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    ));

    const renderMrtStationsList = combinedStops.filter(item => item.type === 'mrt').map((station) => (
        <div
            key={station.station_code}
            className="stop-card"
        >
            <div className="stop-header" onClick={() => navigate(`/crowd-density/${station.station_code}`)}>
                <div className="stop-left">
                    <button 
                        className="favorite-btn" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle('mrt', station.station_code, station.favorite_id);
                        }}
                    >
                        {station.is_favorite ? '⭐' : '☆'}
                    </button>
                    <div>
                        <div className="stop-name-row">
                            <h3 className="stop-name">🚇 {station.name}</h3>
                            <span className="stop-code">{station.station_code}</span>
                        </div>
                        <div className="stop-meta">
                            <span className="stop-distance">Lines: {station.lines.map(l => l.line_code).join(', ')}</span>
                        </div>
                    </div>
                </div>
                <button className="expand-btn">
                    View Crowd
                </button>
            </div>
        </div>
    ));

    return (
        <div className="container">
            <div ref={mapRef} className="map-container" />

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

                <div className="drawer-header">
                    <input
                        type="text"
                        placeholder="Search stop/station or bus number..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="transport-tabs">
                    {/* Assuming you want to link out of LiveTracker to these components */}
                    <button className="transport-tab" onClick={() => navigate("/NearbyCarparks")}>
                        <span className="tab-icon"><FaCar /></span>
                        <span className="tab-label">Car</span>
                    </button>
                    <div className="transport-tab transport-tab-active">
                        <span className="tab-icon"><FaBus /></span>
                        <span className="tab-label">Bus</span>
                    </div>
                    <button className="transport-tab" onClick={() => navigate("/CrowdDensity")}>
                        <span className="tab-icon"><FaTrainSubway /></span>
                        <span className="tab-label">Train</span>
                    </button>
                </div>

                <div className="content">
                    {error ? (
                        <div className="empty-state error">
                            <div className="empty-state-icon">❌</div>
                            <p className="empty-state-text">{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="search-info">
                                {loading ? "Finding nearby stops..." : `Found ${combinedStops.length} nearby locations. `}
                            </div>
                            
                            <div className="stops-list">
                                {combinedStops.length === 0 && !loading && (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🔍</div>
                                        <p className="empty-state-text">No bus stops or MRT stations found nearby.</p>
                                    </div>
                                )}
                                
                                {renderBusStopsList}
                                {renderMrtStationsList}

                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <footer className="footer">
                 <button className="nav-btn" onClick={() => navigate("/home")}>🏠 Home</button>
                 <button className="nav-btn nav-btn-active">📍 Tracker</button>
                 <button className="nav-btn" onClick={() => navigate("/my-trips")}>🧾 My Trips</button>
                 <button className="nav-btn" onClick={() => navigate("/settings")}>⚙️ Settings</button>
            </footer>

        </div>
    );
}




























// import { useState, useEffect, useRef, useCallback } from "react";
// import { FaTrainSubway, FaBus, FaCar } from "react-icons/fa6";
// import { NavLink, useNavigate } from "react-router-dom";
// import { getNearbyLocations, getBusArrivals, getFavorites, addFavorite, removeFavorite } from "../api"; 
// import BusIcon from "../assets/bus1.png";
// import "./LiveTracker.css";

// // Helper to determine arrival time color based on minutes
// const getArrivalColor = (time) =>
//     time <= 2 ? "#ef4444" : time <= 5 ? "#f59e0b" : "#3bb59d";

// // Helper to format arrival time string
// const getArrivalLabel = (time) =>
//     time === 0 ? "Arr" : time === 1 ? "1 min" : `${time} min`;

// export default function LiveTracker() {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [expandedStops, setExpandedStops] = useState({});
//     const [drawerHeight, setDrawerHeight] = useState(30);
//     const [isDragging, setIsDragging] = useState(false);
//     const [startY, setStartY] = useState(0);
    
//     // --- LIVE DATA STATES ---
//     const [userLocation, setUserLocation] = useState(null);
//     const [nearbyBusStops, setNearbyBusStops] = useState([]);
//     const [nearbyMrtStations, setNearbyMrtStations] = useState([]);
//     const [favorites, setFavorites] = useState([]);
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [busArrivals, setBusArrivals] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const mapRef = useRef(null);
//     const mapInstanceRef = useRef(null);
//     const markersRef = useRef([]);
//     const navigate = useNavigate();

//     // --- Core Data Fetching Functions ---

//     // 1. Fetch User's Favorites
//     const fetchFavorites = useCallback(async () => {
//         try {
//             // Note: Since auth is bypassed, this might still return a 401 response if the backend
//             // isn't configured for anonymous access, but we'll capture an empty array.
//             const favs = await getFavorites();
//             setFavorites(favs);
//         } catch (e) {
//             console.warn("Could not load user favorites in testing mode.", e);
//             setFavorites([]); // Ensure favorites is an empty array on failure
//         }
//     }, []);

//     // 2. Map Initialization and Marker Rendering
//     const renderMarkers = useCallback((map, busStops, mrtStations) => {
//         if (!map) return;
        
//         // Clear old markers
//         markersRef.current.forEach((m) => m.marker.setMap(null));
//         markersRef.current = [];

//         [...busStops, ...mrtStations].forEach((stopOrStation) => {
//             const isBus = stopOrStation.type === 'bus';
//             const iconUrl = isBus ? BusIcon : 'https://maps.google.com/mapfiles/kml/shapes/rail.png';
//             const size = isBus ? new window.google.maps.Size(35, 35) : new window.google.maps.Size(30, 30);
            
//             // Safety check for valid coordinates
//             if (stopOrStation.latitude === 0 || stopOrStation.longitude === 0) return;
            
//             const marker = new window.google.maps.Marker({
//                 position: { lat: stopOrStation.latitude, lng: stopOrStation.longitude },
//                 map: map,
//                 icon: {
//                     url: iconUrl,
//                     scaledSize: size,
//                     ...(isBus ? {} : { anchor: new window.google.maps.Point(15, 30) })
//                 },
//                 title: stopOrStation.name || stopOrStation.description,
//             });

//             const infoWindow = new window.google.maps.InfoWindow({
//                 content: `<div style="font-weight: 600; color: #1a1a1a; padding: 4px 8px; line-height: 1;">${stopOrStation.name || stopOrStation.description}</div>`,
//                 maxWidth: 200,
//             });

//             marker.addListener("click", () => {
//                 markersRef.current.forEach((m) => m.infoWindow.close());
//                 infoWindow.open(map, marker);
                
//                 if (isBus) {
//                     fetchAndDisplayArrivals(stopOrStation.bus_stop_code);
//                     toggleExpand(stopOrStation.bus_stop_code);
//                     setSelectedStopCode(stopOrStation.bus_stop_code);
//                 } else {
//                     navigate(`/crowd-density/${stopOrStation.station_code}`);
//                 }
//                 setDrawerHeight(60); 
//                 map.panTo({ lat: stopOrStation.latitude - 0.003, lng: stopOrStation.longitude });
//             });

//             markersRef.current.push({ marker, infoWindow });
//         });
//     }, [navigate]); // Added navigate dependency

//     // 3. Fetch Nearby Data
//     const fetchNearbyData = useCallback(async (lat, lng) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data = await getNearbyLocations(lat, lng, 800);
            
//             const favIds = favorites.map(f => f.route_id);

//             const mapData = (item, type, codeKey) => ({
//                 ...item,
//                 is_favorite: favIds.includes(item[codeKey]),
//                 favorite_id: favorites.find(f => f.route_id === item[codeKey])?.id,
//                 type: type,
//                 // Mock distance as Django currently doesn't provide it in the response model, 
//                 // but we need it for sorting/display
//                 distance: `${Math.round(Math.random() * 1.5 * 10) / 10} km`, 
//                 bus_stop_code: item.bus_stop_code || item.station_code, // Unify the key
//                 name: item.name || item.description // Unify the name
//             });

//             const busStopsWithFav = data.busStops.map(stop => mapData(stop, 'bus', 'bus_stop_code'));
//             const mrtStationsWithFav = data.mrtStations.map(station => mapData(station, 'mrt', 'station_code'));

//             setNearbyBusStops(busStopsWithFav);
//             setNearbyMrtStations(mrtStationsWithFav);

//             // Rerender markers immediately after fetching new data
//             renderMarkers(mapInstanceRef.current, busStopsWithFav, mrtStationsWithFav);

//         } catch (e) {
//             setError("Failed to load nearby stops and stations. Check backend logs for non-401 errors.");
//             console.error("Fetch nearby data error:", e);
//         } finally {
//             setLoading(false);
//         }
//     }, [favorites, renderMarkers]); // Added renderMarkers dependency

//     // 4. Fetch Bus Arrivals on Selection
//     const fetchAndDisplayArrivals = async (code) => {
//         setSelectedStopCode(code);
//         setLoading(true);
//         try {
//             const arrivals = await getBusArrivals(code);
//             // Assuming getBusArrivals returns { services: [...] }
//             setBusArrivals(arrivals.services || arrivals); 
//             setError(null);
//         } catch (e) {
//             setError(`Failed to fetch arrivals for ${code}.`);
//             setBusArrivals([]);
//         } finally {
//             setLoading(false);
//         }
//     };


//     // --- Geolocation & Initial Load (Combined Hook) ---
//     useEffect(() => {
//         // 1. Load favorites (non-blocking)
//         fetchFavorites();
        
//         let initialLocation = { lat: 1.3521, lng: 103.8198 }; // Default SG Center

//         // 2. Get Geolocation
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const { latitude, longitude } = position.coords;
//                     initialLocation = { lat: latitude, lng: longitude };
//                     setUserLocation(initialLocation);
                    
//                     // 3. Initialize Map after getting location
//                     if (window.google && mapRef.current) {
//                         const map = new window.google.maps.Map(mapRef.current, {
//                             center: initialLocation,
//                             zoom: 15,
//                             disableDefaultUI: true,
//                             zoomControl: true,
//                             mapTypeControl: false,
//                             streetViewControl: false,
//                             fullscreenControl: false,
//                             styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
//                         });
//                         mapInstanceRef.current = map;
                        
//                         new window.google.maps.Marker({
//                             position: initialLocation,
//                             map: map,
//                             icon: {
//                                 path: window.google.maps.SymbolPath.CIRCLE,
//                                 scale: 8,
//                                 fillColor: "#0095FF",
//                                 fillOpacity: 1,
//                                 strokeColor: "#ffffff",
//                                 strokeWeight: 3,
//                             },
//                             title: "Your Location",
//                         });
                        
//                         // 4. Trigger data fetch after map/location is ready
//                         fetchNearbyData(initialLocation.lat, initialLocation.lng);
//                     } else {
//                         console.error("Google Maps API not yet loaded.");
//                         setLoading(false);
//                     }
//                 },
//                 (err) => {
//                     console.error("Geolocation Error:", err);
//                     setError("Location access denied. Using default center.");
//                     setUserLocation(initialLocation);
//                     setLoading(false);
//                     // Still try to initialize map at default location
//                     if (window.google && mapRef.current) {
//                          const map = new window.google.maps.Map(mapRef.current, {
//                             center: initialLocation,
//                             zoom: 12,
//                             // ... other options
//                          });
//                          mapInstanceRef.current = map;
//                          fetchNearbyData(initialLocation.lat, initialLocation.lng);
//                     }
//                 }
//             );
//         } else {
//             setError("Geolocation not supported. Using default center.");
//             setUserLocation(initialLocation);
//             setLoading(false);
//             // Still try to initialize map at default location
//             if (window.google && mapRef.current) {
//                  const map = new window.google.maps.Map(mapRef.current, {
//                     center: initialLocation,
//                     zoom: 12,
//                     // ... other options
//                  });
//                  mapInstanceRef.current = map;
//                  fetchNearbyData(initialLocation.lat, initialLocation.lng);
//             }
//         }
        
//         // This is a minimal guard to catch if the API script hasn't loaded yet
//         if (!window.google) {
//             // Wait for Google Maps script to load (which is handled in index.html/App.jsx)
//             const scriptCheck = setInterval(() => {
//                 if (window.google && mapRef.current) {
//                     clearInterval(scriptCheck);
//                     // Re-run the main logic to pick up initialization
//                     // NOTE: Due to the complexity, relying on the full component re-render when location/favorites change is often necessary.
//                 }
//             }, 500);
//         }

//     }, []); // Run only once

//     // --- Favorite Toggle Logic ---
//     const handleFavoriteToggle = async (type, id, favoriteId) => {
//         const isFav = favoriteId !== undefined;
//         try {
//             if (isFav) {
//                 await removeFavorite(favoriteId);
//             } else {
//                 await addFavorite(type, id);
//             }
//             // Re-fetch favorites and nearby data to update icons/list
//             await fetchFavorites();
//             if (userLocation) {
//                  await fetchNearbyData(userLocation.lat, userLocation.lng);
//             }
//         } catch (e) {
//             alert(`Failed to update favorite. (Are you logged in?)`);
//             console.error("Favorite toggle error:", e);
//         }
//     };


//     // --- UI/Drawer Logic ---

//     // Drawer handlers (kept as is for functionality)
//     const handleTouchStart = (e) => { setIsDragging(true); setStartY(e.touches[0].clientY); };
//     const handleTouchMove = (e) => {
//         if (!isDragging) return; e.preventDefault();
//         const currentY = e.touches[0].clientY;
//         const diff = startY - currentY;
//         const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//         setDrawerHeight(Math.max(20, Math.min(90, newHeight))); setStartY(currentY);
//     };
//     const handleTouchEnd = () => { setIsDragging(false); snapToPosition(); };
//     const handleMouseDown = (e) => { setIsDragging(true); setStartY(e.clientY); };
//     const handleMouseMove = (e) => {
//         if (!isDragging) return; e.preventDefault();
//         const currentY = e.clientY;
//         const diff = startY - currentY;
//         const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
//         setDrawerHeight(Math.max(20, Math.min(90, newHeight))); setStartY(currentY);
//     };
//     const handleMouseUp = () => { setIsDragging(false); snapToPosition(); };
//     const snapToPosition = () => {
//         if (drawerHeight < 40) setDrawerHeight(30);
//         else if (drawerHeight > 70) setDrawerHeight(85);
//         else setDrawerHeight(60);
//     };
//     useEffect(() => {
//         if (isDragging) {
//             document.addEventListener("mousemove", handleMouseMove);
//             document.addEventListener("mouseup", handleMouseUp);
//             return () => {
//                 document.removeEventListener("mousemove", handleMouseMove);
//                 document.removeEventListener("mouseup", handleMouseUp);
//             };
//         }
//     }, [isDragging, startY, drawerHeight]);

//     const toggleExpand = (code) =>
//         setExpandedStops((prev) => ({ ...prev, [code]: !prev[code] }));

//     // Combined and sorted list for display in the drawer
//     const combinedStops = [...nearbyBusStops, ...nearbyMrtStations].filter(item => 
//         (item.name || item.description).toLowerCase().includes(searchTerm.toLowerCase()) || 
//         item.bus_stop_code?.includes(searchTerm) || 
//         item.station_code?.includes(searchTerm)
//     ).sort(
//         (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
//     );

//     // --- RENDER ---

//     if (loading && !userLocation && !error) return <div className="loading">🛰️ Locating transport...</div>;
    
    
//     const renderBusStopsList = combinedStops.filter(item => item.type === 'bus').map((stop) => (
//         <div
//             key={stop.bus_stop_code}
//             id={`stop-${stop.bus_stop_code}`}
//             className={`stop-card ${selectedStopCode === stop.bus_stop_code ? "stop-card-selected" : ""}`}
//         >
//             <div className="stop-header" onClick={() => fetchAndDisplayArrivals(stop.bus_stop_code)}>
//                 <div className="stop-left">
//                     <button 
//                         className="favorite-btn" 
//                         onClick={(e) => {
//                             e.stopPropagation(); // Prevent card expansion
//                             handleFavoriteToggle('bus', stop.bus_stop_code, stop.favorite_id);
//                         }}
//                     >
//                         {stop.is_favorite ? '⭐' : '☆'}
//                     </button>
//                     <div>
//                         <div className="stop-name-row">
//                             <h3 className="stop-name">{stop.name || stop.description}</h3>
//                             <span className="stop-code">{stop.bus_stop_code}</span>
//                         </div>
//                         <div className="stop-meta">
//                             <span className="stop-distance">Approx. {stop.distance}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <button className="expand-btn" onClick={(e) => { e.stopPropagation(); toggleExpand(stop.bus_stop_code); }}>
//                     {expandedStops[stop.bus_stop_code] ? "▲" : "▼"}
//                 </button>
//             </div>

//             {/* BUS ARRIVAL DETAILS (Conditional) */}
//             {expandedStops[stop.bus_stop_code] && selectedStopCode === stop.bus_stop_code && (
//                 <div className="bus-arrivals">
//                     {loading ? (
//                         <p>Loading arrivals...</p>
//                     ) : busArrivals.length === 0 ? (
//                         <p>No real-time arrivals available for this stop.</p>
//                     ) : (
//                         busArrivals.map((service, i) => (
//                             <div key={i} className="bus-row">
//                                 <div className="bus-info">
//                                     <div className="bus-number">{service.service_no}</div>
//                                     <div className="bus-destination">→ {service.operator_name}</div>
//                                 </div>
//                                 <div className="arrival-times">
//                                     {service.buses.slice(0, 3).map((bus, j) => (
//                                         <div key={j} className="arrival-block">
//                                             <div
//                                                 className="arrival-time"
//                                                 style={{ backgroundColor: getArrivalColor(bus.waiting_time) }}
//                                             >
//                                                 {getArrivalLabel(bus.waiting_time)}
//                                             </div>
//                                             <div className="bus-type-label">{bus.load_display.split(' ')[0]}</div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             )}
//         </div>
//     ));

//     const renderMrtStationsList = combinedStops.filter(item => item.type === 'mrt').map((station) => (
//         <div
//             key={station.station_code}
//             className="stop-card"
//         >
//             <div className="stop-header" onClick={() => navigate(`/crowd-density/${station.station_code}`)}>
//                 <div className="stop-left">
//                     <button 
//                         className="favorite-btn" 
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             handleFavoriteToggle('mrt', station.station_code, station.favorite_id);
//                         }}
//                     >
//                         {station.is_favorite ? '⭐' : '☆'}
//                     </button>
//                     <div>
//                         <div className="stop-name-row">
//                             <h3 className="stop-name">🚇 {station.name || station.description}</h3>
//                             <span className="stop-code">{station.station_code}</span>
//                         </div>
//                         <div className="stop-meta">
//                             {/* Assuming lines property is available directly on the station object */}
//                             <span className="stop-distance">Lines: {station.lines?.map(l => l.line_code).join(', ') || 'N/A'}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <button className="expand-btn">
//                     View Crowd
//                 </button>
//             </div>
//         </div>
//     ));

//     return (
//         <div className="container">
//             <div ref={mapRef} className="map-container" />

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

//                 <div className="drawer-header">
//                     <input
//                         type="text"
//                         placeholder="Search stop/station or bus number..."
//                         className="search-input"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>

//                 <div className="transport-tabs">
//                     {/* Assuming you want to link out of LiveTracker to these components */}
//                     <button className="transport-tab" onClick={() => navigate("/NearbyCarparks")}>
//                         <span className="tab-icon"><FaCar /></span>
//                         <span className="tab-label">Car</span>
//                     </button>
//                     <div className="transport-tab transport-tab-active">
//                         <span className="tab-icon"><FaBus /></span>
//                         <span className="tab-label">Bus</span>
//                     </div>
//                     <button className="transport-tab" onClick={() => navigate("/CrowdDensity")}>
//                         <span className="tab-icon"><FaTrainSubway /></span>
//                         <span className="tab-label">Train</span>
//                     </button>
//                 </div>

//                 <div className="content">
//                     {error ? (
//                         <div className="empty-state error">
//                             <div className="empty-state-icon">❌</div>
//                             <p className="empty-state-text">{error}</p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="search-info">
//                                 {loading ? "Finding nearby stops..." : `Found ${combinedStops.length} nearby locations.`}
//                             </div>
                            
//                             <div className="stops-list">
//                                 {combinedStops.length === 0 && !loading ? (
//                                     <div className="empty-state">
//                                         <div className="empty-state-icon">🔍</div>
//                                         <p className="empty-state-text">No bus stops or MRT stations found nearby.</p>
//                                     </div>
//                                 ) : (
//                                     <>
//                                     {renderBusStopsList}
//                                     {renderMrtStationsList}
//                                     </>
//                                 )}

//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
            
//             <footer className="footer">
//                  <button className="nav-btn" onClick={() => navigate("/home")}>🏠 Home</button>
//                  <button className="nav-btn nav-btn-active">📍 Tracker</button>
//                  <button className="nav-btn" onClick={() => navigate("/my-trips")}>🧾 My Trips</button>
//                  <button className="nav-btn" onClick={() => navigate("/settings")}>⚙️ Settings</button>
//             </footer>

//         </div>
//     );
// }






















// import { useState, useEffect, useRef, useCallback } from "react";
// import { FaTrainSubway, FaBus, FaCar } from "react-icons/fa6";
// import { NavLink, useNavigate } from "react-router-dom";
// import { getNearbyLocations, getBusArrivals, getFavorites, addFavorite, removeFavorite } from "../api"; 
// import BusIcon from "../assets/bus1.png";
// import "./LiveTracker.css";

// // Helper functions (getArrivalColor, getArrivalLabel, etc.) remain unchanged...

// const getArrivalColor = (time) =>
//     time <= 2 ? "#ef4444" : time <= 5 ? "#f59e0b" : "#3bb59d";

// const getArrivalLabel = (time) =>
//     time === 0 ? "Arr" : time === 1 ? "1 min" : `${time} min`;

// export default function LiveTracker() {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [expandedStops, setExpandedStops] = useState({});
//     const [drawerHeight, setDrawerHeight] = useState(30);
//     const [isDragging, setIsDragging] = useState(false);
//     const [startY, setStartY] = useState(0);
    
//     // --- LIVE DATA STATES ---
//     const [userLocation, setUserLocation] = useState(null);
//     const [nearbyBusStops, setNearbyBusStops] = useState([]);
//     const [nearbyMrtStations, setNearbyMrtStations] = useState([]);
//     const [favorites, setFavorites] = useState([]);
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [busArrivals, setBusArrivals] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     // New state to hold the coordinates used for the successful API query
//     const [queryLocation, setQueryLocation] = useState(null); 

//     const mapRef = useRef(null);
//     const mapInstanceRef = useRef(null);
//     const markersRef = useRef([]);
//     const navigate = useNavigate();

//     // --- Core Data Fetching Functions ---
//     const fetchFavorites = useCallback(async () => {
//         try {
//             const favs = await getFavorites();
//             setFavorites(favs);
//         } catch (e) {
//             setFavorites([]);
//         }
//     }, []);

//     const renderMarkers = useCallback((map, busStops, mrtStations) => {
//         if (!map || !window.google) return;
        
//         markersRef.current.forEach((m) => m.marker.setMap(null));
//         markersRef.current = [];

//         [...busStops, ...mrtStations].forEach((stopOrStation) => {
//             const isBus = stopOrStation.type === 'bus';
//             const iconUrl = isBus ? BusIcon : 'https://maps.google.com/mapfiles/kml/shapes/rail.png';
//             const size = isBus ? new window.google.maps.Size(35, 35) : new window.google.maps.Size(30, 30);
            
//             if (stopOrStation.latitude === 0 || stopOrStation.longitude === 0) return;
            
//             const marker = new window.google.maps.Marker({
//                 position: { lat: stopOrStation.latitude, lng: stopOrStation.longitude },
//                 map: map,
//                 icon: {
//                     url: iconUrl,
//                     scaledSize: size,
//                     ...(isBus ? {} : { anchor: new window.google.maps.Point(15, 30) })
//                 },
//                 title: stopOrStation.name || stopOrStation.description,
//             });

//             const infoWindow = new window.google.maps.InfoWindow({
//                 content: `<div style="font-weight: 600; color: #1a1a1a; padding: 4px 8px; line-height: 1;">${stopOrStation.name || stopOrStation.description}</div>`,
//                 maxWidth: 200,
//             });

//             marker.addListener("click", () => {
//                 markersRef.current.forEach((m) => m.infoWindow.close());
//                 infoWindow.open(map, marker);
                
//                 if (isBus) {
//                     fetchAndDisplayArrivals(stopOrStation.bus_stop_code);
//                     toggleExpand(stopOrStation.bus_stop_code);
//                     setSelectedStopCode(stopOrStation.bus_stop_code);
//                 } else {
//                     navigate(`/crowd-density/${stopOrStation.station_code}`);
//                 }
//                 setDrawerHeight(60); 
//                 map.panTo({ lat: stopOrStation.latitude - 0.003, lng: stopOrStation.longitude });
//             });

//             markersRef.current.push({ marker, infoWindow });
//         });
//     }, [navigate]);

//     const fetchNearbyData = useCallback(async (lat, lng) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data = await getNearbyLocations(lat, lng, 800);
            
//             // --- CRITICAL DEBUG LINE ---
//             setQueryLocation({ lat, lng }); 
//             // ---------------------------

//             const favIds = favorites.map(f => f.route_id);

//             const mapData = (item, type, codeKey) => ({
//                 ...item,
//                 is_favorite: favIds.includes(item[codeKey]),
//                 favorite_id: favorites.find(f => f.route_id === item[codeKey])?.id,
//                 type: type,
//                 distance: `${Math.round(Math.random() * 1.5 * 10) / 10} km`, 
//                 bus_stop_code: item.bus_stop_code || item.station_code,
//                 name: item.name || item.description 
//             });

//             const busStopsWithFav = data.busStops.map(stop => mapData(stop, 'bus', 'bus_stop_code'));
//             const mrtStationsWithFav = data.mrtStations.map(station => mapData(station, 'mrt', 'station_code'));

//             setNearbyBusStops(busStopsWithFav);
//             setNearbyMrtStations(mrtStationsWithFav);

//             renderMarkers(mapInstanceRef.current, busStopsWithFav, mrtStationsWithFav);

//         } catch (e) {
//             setError("Failed to load nearby stops and stations. Check backend logs for non-401 errors.");
//             console.error("Fetch nearby data error:", e);
//             setNearbyBusStops([]);
//             setNearbyMrtStations([]);
//         } finally {
//             setLoading(false);
//         }
//     }, [favorites, renderMarkers]);

//     const fetchAndDisplayArrivals = async (code) => { /* ... unchanged ... */ };


//     // --- Geolocation & Initial Load (Combined Hook) ---
//     useEffect(() => {
//         fetchFavorites();
        
//         let initialLocation = { lat: 1.3926, lng: 103.8954 }; // Set default to Sengkang area (where your test worked)

//         const initMap = (center) => {
//              if (window.google && mapRef.current) {
//                 const map = new window.google.maps.Map(mapRef.current, {
//                     center: center,
//                     zoom: 15,
//                     disableDefaultUI: true,
//                     zoomControl: true,
//                     mapTypeControl: false,
//                     streetViewControl: false,
//                     fullscreenControl: false,
//                     styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
//                 });
//                 mapInstanceRef.current = map;
                
//                 new window.google.maps.Marker({
//                     position: center,
//                     map: map,
//                     icon: {
//                         path: window.google.maps.SymbolPath.CIRCLE,
//                         scale: 8,
//                         fillColor: "#0095FF",
//                         fillOpacity: 1,
//                         strokeColor: "#ffffff",
//                         strokeWeight: 3,
//                     },
//                     title: "Your Location",
//                 });
                
//                 fetchNearbyData(center.lat, center.lng);
//             } else {
//                 console.error("Google Maps API not yet loaded.");
//                 setLoading(false);
//             }
//         };


//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     initialLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
//                     setUserLocation(initialLocation);
//                     initMap(initialLocation);
//                 },
//                 (err) => {
//                     console.error("Geolocation Error:", err);
//                     setError(`Location access denied. Using default location (${initialLocation.lat.toFixed(4)}, ${initialLocation.lng.toFixed(4)})`);
//                     setUserLocation(initialLocation);
//                     initMap(initialLocation); 
//                 }
//             );
//         } else {
//             setError("Geolocation not supported. Using default center.");
//             setUserLocation(initialLocation);
//             initMap(initialLocation);
//         }
//     }, []);


//     // Drawer handlers (kept for functionality) ...

//     const toggleExpand = (code) =>
//         setExpandedStops((prev) => ({ ...prev, [code]: !prev[code] }));

//     const combinedStops = [...nearbyBusStops, ...nearbyMrtStations].filter(item => 
//         (item.name || item.description).toLowerCase().includes(searchTerm.toLowerCase()) || 
//         item.bus_stop_code?.includes(searchTerm) || 
//         item.station_code?.includes(searchTerm)
//     ).sort(
//         (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
//     );

//     // --- RENDER ---

//     if (loading && !queryLocation && !error) return <div className="loading">🛰️ Finding nearby stops...</div>;
    
    
//     const renderBusStopsList = combinedStops.filter(item => item.type === 'bus').map((stop) => (
//         <div
//             key={stop.bus_stop_code}
//             id={`stop-${stop.bus_stop_code}`}
//             className={`stop-card ${selectedStopCode === stop.bus_stop_code ? "stop-card-selected" : ""}`}
//         >
//             {/* ... Bus Stop List rendering (unchanged from last correct version) ... */}
//             <div className="stop-header" onClick={() => fetchAndDisplayArrivals(stop.bus_stop_code)}>
//                 <div className="stop-left">
//                     <button 
//                         className="favorite-btn" 
//                         onClick={(e) => {
//                             e.stopPropagation(); 
//                             handleFavoriteToggle('bus', stop.bus_stop_code, stop.favorite_id);
//                         }}
//                     >
//                         {stop.is_favorite ? '⭐' : '☆'}
//                     </button>
//                     <div>
//                         <div className="stop-name-row">
//                             <h3 className="stop-name">{stop.name || stop.description}</h3>
//                             <span className="stop-code">{stop.bus_stop_code}</span>
//                         </div>
//                         <div className="stop-meta">
//                             <span className="stop-distance">Approx. {stop.distance}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <button className="expand-btn" onClick={(e) => { e.stopPropagation(); toggleExpand(stop.bus_stop_code); }}>
//                     {expandedStops[stop.bus_stop_code] ? "▲" : "▼"}
//                 </button>
//             </div>

//             {expandedStops[stop.bus_stop_code] && selectedStopCode === stop.bus_stop_code && (
//                 <div className="bus-arrivals">
//                     {loading ? (
//                         <p>Loading arrivals...</p>
//                     ) : busArrivals.length === 0 ? (
//                         <p>No real-time arrivals available for this stop.</p>
//                     ) : (
//                         busArrivals.map((service, i) => (
//                             <div key={i} className="bus-row">
//                                 <div className="bus-info">
//                                     <div className="bus-number">{service.service_no}</div>
//                                     <div className="bus-destination">→ {service.operator_name}</div>
//                                 </div>
//                                 <div className="arrival-times">
//                                     {service.buses.slice(0, 3).map((bus, j) => (
//                                         <div key={j} className="arrival-block">
//                                             <div
//                                                 className="arrival-time"
//                                                 style={{ backgroundColor: getArrivalColor(bus.waiting_time) }}
//                                             >
//                                                 {getArrivalLabel(bus.waiting_time)}
//                                             </div>
//                                             <div className="bus-type-label">{bus.load_display.split(' ')[0]}</div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             )}
//         </div>
//     ));

//     const renderMrtStationsList = combinedStops.filter(item => item.type === 'mrt').map((station) => (
//         <div
//             key={station.station_code}
//             className="stop-card"
//         >
//             {/* ... MRT Station List rendering (unchanged from last correct version) ... */}
//              <div className="stop-header" onClick={() => navigate(`/crowd-density/${station.station_code}`)}>
//                 <div className="stop-left">
//                     <button 
//                         className="favorite-btn" 
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             handleFavoriteToggle('mrt', station.station_code, station.favorite_id);
//                         }}
//                     >
//                         {station.is_favorite ? '⭐' : '☆'}
//                     </button>
//                     <div>
//                         <div className="stop-name-row">
//                             <h3 className="stop-name">🚇 {station.name || station.description}</h3>
//                             <span className="stop-code">{station.station_code}</span>
//                         </div>
//                         <div className="stop-meta">
//                             <span className="stop-distance">Lines: {station.lines?.map(l => l.line_code).join(', ') || 'N/A'}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <button className="expand-btn">
//                     View Crowd
//                 </button>
//             </div>
//         </div>
//     ));

//     return (
//         <div className="container">
//             <div ref={mapRef} className="map-container" />

//             <div className="drawer" style={{ height: `${drawerHeight}vh` }}>
//                 <div className="drag-handle" /* ... drag props ... */>
//                     <div className="drag-bar" />
//                 </div>

//                 <div className="drawer-header">
//                     <input
//                         type="text"
//                         placeholder="Search stop/station or bus number..."
//                         className="search-input"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>

//                 <div className="transport-tabs">
//                     {/* ... transport tabs ... */}
//                     <button className="transport-tab" onClick={() => navigate("/NearbyCarparks")}>
//                         <span className="tab-icon"><FaCar /></span>
//                         <span className="tab-label">Car</span>
//                     </button>
//                     <div className="transport-tab transport-tab-active">
//                         <span className="tab-icon"><FaBus /></span>
//                         <span className="tab-label">Bus</span>
//                     </div>
//                     <button className="transport-tab" onClick={() => navigate("/CrowdDensity")}>
//                         <span className="tab-icon"><FaTrainSubway /></span>
//                         <span className="tab-label">Train</span>
//                     </button>
//                 </div>

//                 <div className="content">
//                     {/* --- CRITICAL DEBUG DISPLAY --- */}
//                     <p style={{ color: '#0095FF', textAlign: 'center', fontSize: '12px', marginBottom: '10px' }}>
//                         Current Search Location: **{queryLocation ? `${queryLocation.lat.toFixed(4)}, ${queryLocation.lng.toFixed(4)}` : 'Awaiting Location...'}**
//                     </p>
//                     {/* --- END DEBUG DISPLAY --- */}

//                     {error ? (
//                         <div className="empty-state error">
//                             <div className="empty-state-icon">❌</div>
//                             <p className="empty-state-text">{error}</p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="search-info">
//                                 {loading ? "Finding nearby stops..." : `Found ${combinedStops.length} nearby locations.`}
//                             </div>
                            
//                             <div className="stops-list">
//                                 {combinedStops.length === 0 && !loading ? (
//                                     <div className="empty-state">
//                                         <div className="empty-state-icon">🔍</div>
//                                         <p className="empty-state-text">No bus stops or MRT stations found nearby.</p>
//                                     </div>
//                                 ) : (
//                                     <>
//                                     {renderBusStopsList}
//                                     {renderMrtStationsList}
//                                     </>
//                                 )}

//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
            
//             <footer className="footer">
//                  <button className="nav-btn" onClick={() => navigate("/home")}>🏠 Home</button>
//                  <button className="nav-btn nav-btn-active">📍 Tracker</button>
//                  <button className="nav-btn" onClick={() => navigate("/my-trips")}>🧾 My Trips</button>
//                  <button className="nav-btn" onClick={() => navigate("/settings")}>⚙️ Settings</button>
//             </footer>

//         </div>
//     );
// }
























// import { useState, useEffect, useRef, useCallback } from "react";
// import { FaTrainSubway, FaBus, FaCar } from "react-icons/fa6";
// import { NavLink, useNavigate } from "react-router-dom";
// import { getNearbyLocations, getBusArrivals, getFavorites, addFavorite, removeFavorite } from "../api"; 
// import BusIcon from "../assets/bus1.png";
// import "./LiveTracker.css";

// // Helper functions (getArrivalColor, getArrivalLabel, etc.) remain unchanged...

// const getArrivalColor = (time) =>
//     time <= 2 ? "#ef4444" : time <= 5 ? "#f59e0b" : "#3bb59d";

// const getArrivalLabel = (time) =>
//     time === 0 ? "Arr" : time === 1 ? "1 min" : `${time} min`;

// export default function LiveTracker() {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [expandedStops, setExpandedStops] = useState({});
//     const [drawerHeight, setDrawerHeight] = useState(30);
//     const [isDragging, setIsDragging] = useState(false);
//     const [startY, setStartY] = useState(0);
    
//     // --- LIVE DATA STATES ---
//     const [userLocation, setUserLocation] = useState(null);
//     const [nearbyBusStops, setNearbyBusStops] = useState([]);
//     const [nearbyMrtStations, setNearbyMrtStations] = useState([]);
//     const [favorites, setFavorites] = useState([]);
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [busArrivals, setBusArrivals] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     // New state to hold the coordinates used for the successful API query
//     const [queryLocation, setQueryLocation] = useState(null); 

//     const mapRef = useRef(null);
//     const mapInstanceRef = useRef(null);
//     const markersRef = useRef([]);
//     const navigate = useNavigate();

//     // --- Core Data Fetching Functions ---
//     const fetchFavorites = useCallback(async () => {
//         try {
//             const favs = await getFavorites();
//             setFavorites(favs);
//         } catch (e) {
//             setFavorites([]);
//         }
//     }, []);

//     const renderMarkers = useCallback((map, busStops, mrtStations) => {
//         if (!map || !window.google) return;
        
//         markersRef.current.forEach((m) => m.marker.setMap(null));
//         markersRef.current = [];

//         [...busStops, ...mrtStations].forEach((stopOrStation) => {
//             const isBus = stopOrStation.type === 'bus';
//             const iconUrl = isBus ? BusIcon : 'https://maps.google.com/mapfiles/kml/shapes/rail.png';
//             const size = isBus ? new window.google.maps.Size(35, 35) : new window.google.maps.Size(30, 30);
            
//             if (stopOrStation.latitude === 0 || stopOrStation.longitude === 0) return;
            
//             const marker = new window.google.maps.Marker({
//                 position: { lat: stopOrStation.latitude, lng: stopOrStation.longitude },
//                 map: map,
//                 icon: {
//                     url: iconUrl,
//                     scaledSize: size,
//                     ...(isBus ? {} : { anchor: new window.google.maps.Point(15, 30) })
//                 },
//                 title: stopOrStation.name || stopOrStation.description,
//             });

//             const infoWindow = new window.google.maps.InfoWindow({
//                 content: `<div style="font-weight: 600; color: #1a1a1a; padding: 4px 8px; line-height: 1;">${stopOrStation.name || stopOrStation.description}</div>`,
//                 maxWidth: 200,
//             });

//             marker.addListener("click", () => {
//                 markersRef.current.forEach((m) => m.infoWindow.close());
//                 infoWindow.open(map, marker);
                
//                 if (isBus) {
//                     fetchAndDisplayArrivals(stopOrStation.bus_stop_code);
//                     toggleExpand(stopOrStation.bus_stop_code);
//                     setSelectedStopCode(stopOrStation.bus_stop_code);
//                 } else {
//                     navigate(`/crowd-density/${stopOrStation.station_code}`);
//                 }
//                 setDrawerHeight(60); 
//                 map.panTo({ lat: stopOrStation.latitude - 0.003, lng: stopOrStation.longitude });
//             });

//             markersRef.current.push({ marker, infoWindow });
//         });
//     }, [navigate]);

//     const fetchNearbyData = useCallback(async (lat, lng) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data = await getNearbyLocations(lat, lng, 800);
            
//             // --- CRITICAL DEBUG LINE ---
//             setQueryLocation({ lat, lng }); 
//             // ---------------------------

//             const favIds = favorites.map(f => f.route_id);

//             const mapData = (item, type, codeKey) => ({
//                 ...item,
//                 is_favorite: favIds.includes(item[codeKey]),
//                 favorite_id: favorites.find(f => f.route_id === item[codeKey])?.id,
//                 type: type,
//                 distance: `${Math.round(Math.random() * 1.5 * 10) / 10} km`, 
//                 bus_stop_code: item.bus_stop_code || item.station_code,
//                 name: item.name || item.description 
//             });

//             const busStopsWithFav = data.busStops.map(stop => mapData(stop, 'bus', 'bus_stop_code'));
//             const mrtStationsWithFav = data.mrtStations.map(station => mapData(station, 'mrt', 'station_code'));

//             setNearbyBusStops(busStopsWithFav);
//             setNearbyMrtStations(mrtStationsWithFav);

//             renderMarkers(mapInstanceRef.current, busStopsWithFav, mrtStationsWithFav);

//         } catch (e) {
//             setError("Failed to load nearby stops and stations. Check backend logs for non-401 errors.");
//             console.error("Fetch nearby data error:", e);
//             setNearbyBusStops([]);
//             setNearbyMrtStations([]);
//         } finally {
//             setLoading(false);
//         }
//     }, [favorites, renderMarkers]);

//     const fetchAndDisplayArrivals = async (code) => { 
//         setSelectedStopCode(code);
//         setLoading(true);
//         try {
//             const arrivals = await getBusArrivals(code);
//             // Assuming getBusArrivals returns { services: [...] }
//             setBusArrivals(arrivals.services || arrivals); 
//             setError(null);
//         } catch (e) {
//             setError(`Failed to fetch arrivals for ${code}.`);
//             setBusArrivals([]);
//         } finally {
//             setLoading(false);
//         }
//     };


//     // --- Geolocation & Initial Load (Combined Hook) ---
//     useEffect(() => {
//         fetchFavorites();
        
//         // **DEFAULT LOCATION SET TO SENGKANG (Where your test worked)**
//         const SENGKANG_LOCATION = { lat: 1.3926, lng: 103.8954 }; 
//         let initialLocation = SENGKANG_LOCATION; 

//         const initMap = (center) => {
//              if (window.google && mapRef.current) {
//                 const map = new window.google.maps.Map(mapRef.current, {
//                     center: center,
//                     zoom: 15,
//                     disableDefaultUI: true,
//                     zoomControl: true,
//                     mapTypeControl: false,
//                     streetViewControl: false,
//                     fullscreenControl: false,
//                     styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
//                 });
//                 mapInstanceRef.current = map;
                
//                 new window.google.maps.Marker({
//                     position: center,
//                     map: map,
//                     icon: {
//                         path: window.google.maps.SymbolPath.CIRCLE,
//                         scale: 8,
//                         fillColor: "#0095FF",
//                         fillOpacity: 1,
//                         strokeColor: "#ffffff",
//                         strokeWeight: 3,
//                     },
//                     title: "Your Location",
//                 });
                
//                 fetchNearbyData(center.lat, center.lng);
//             } else {
//                 console.error("Google Maps API not yet loaded.");
//                 setLoading(false);
//             }
//         };


//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 // Success: Use actual location
//                 (position) => {
//                     initialLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
//                     setUserLocation(initialLocation);
//                     initMap(initialLocation);
//                 },
//                 // Failure: Use fallback Sengkang location
//                 (err) => {
//                     console.error("Geolocation Error: Using fallback location.", err);
//                     setError(`Location access denied. Using default Sengkang location (${SENGKANG_LOCATION.lat.toFixed(4)}, ${SENGKANG_LOCATION.lng.toFixed(4)})`);
//                     setUserLocation(SENGKANG_LOCATION);
//                     initMap(SENGKANG_LOCATION); 
//                 }
//             );
//         } else {
//             // Geolocation not supported: Use fallback Sengkang location
//             setError("Geolocation not supported. Using default Sengkang center.");
//             setUserLocation(SENGKANG_LOCATION);
//             initMap(SENGKANG_LOCATION);
//         }
//     }, []);


//     // Drawer handlers (kept for functionality) ...

//     const toggleExpand = (code) =>
//         setExpandedStops((prev) => ({ ...prev, [code]: !prev[code] }));

//     const combinedStops = [...nearbyBusStops, ...nearbyMrtStations].filter(item => 
//         (item.name || item.description).toLowerCase().includes(searchTerm.toLowerCase()) || 
//         item.bus_stop_code?.includes(searchTerm) || 
//         item.station_code?.includes(searchTerm)
//     ).sort(
//         (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
//     );

//     // --- RENDER ---

//     if (loading && !queryLocation && !error) return <div className="loading">🛰️ Finding nearby stops...</div>;
    
    
//     const renderBusStopsList = combinedStops.filter(item => item.type === 'bus').map((stop) => (
//         <div
//             key={stop.bus_stop_code}
//             id={`stop-${stop.bus_stop_code}`}
//             className={`stop-card ${selectedStopCode === stop.bus_stop_code ? "stop-card-selected" : ""}`}
//         >
//             {/* ... Bus Stop List rendering (unchanged from last correct version) ... */}
//             <div className="stop-header" onClick={() => fetchAndDisplayArrivals(stop.bus_stop_code)}>
//                 <div className="stop-left">
//                     <button 
//                         className="favorite-btn" 
//                         onClick={(e) => {
//                             e.stopPropagation(); 
//                             handleFavoriteToggle('bus', stop.bus_stop_code, stop.favorite_id);
//                         }}
//                     >
//                         {stop.is_favorite ? '⭐' : '☆'}
//                     </button>
//                     <div>
//                         <div className="stop-name-row">
//                             <h3 className="stop-name">{stop.name || stop.description}</h3>
//                             <span className="stop-code">{stop.bus_stop_code}</span>
//                         </div>
//                         <div className="stop-meta">
//                             <span className="stop-distance">Approx. {stop.distance}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <button className="expand-btn" onClick={(e) => { e.stopPropagation(); toggleExpand(stop.bus_stop_code); }}>
//                     {expandedStops[stop.bus_stop_code] ? "▲" : "▼"}
//                 </button>
//             </div>

//             {expandedStops[stop.bus_stop_code] && selectedStopCode === stop.bus_stop_code && (
//                 <div className="bus-arrivals">
//                     {loading ? (
//                         <p>Loading arrivals...</p>
//                     ) : busArrivals.length === 0 ? (
//                         <p>No real-time arrivals available for this stop.</p>
//                     ) : (
//                         busArrivals.map((service, i) => (
//                             <div key={i} className="bus-row">
//                                 <div className="bus-info">
//                                     <div className="bus-number">{service.service_no}</div>
//                                     <div className="bus-destination">→ {service.operator_name}</div>
//                                 </div>
//                                 <div className="arrival-times">
//                                     {service.buses.slice(0, 3).map((bus, j) => (
//                                         <div key={j} className="arrival-block">
//                                             <div
//                                                 className="arrival-time"
//                                                 style={{ backgroundColor: getArrivalColor(bus.waiting_time) }}
//                                             >
//                                                 {getArrivalLabel(bus.waiting_time)}
//                                             </div>
//                                             <div className="bus-type-label">{bus.load_display.split(' ')[0]}</div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             )}
//         </div>
//     ));

//     const renderMrtStationsList = combinedStops.filter(item => item.type === 'mrt').map((station) => (
//         <div
//             key={station.station_code}
//             className="stop-card"
//         >
//             {/* ... MRT Station List rendering (unchanged from last correct version) ... */}
//              <div className="stop-header" onClick={() => navigate(`/crowd-density/${station.station_code}`)}>
//                 <div className="stop-left">
//                     <button 
//                         className="favorite-btn" 
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             handleFavoriteToggle('mrt', station.station_code, station.favorite_id);
//                         }}
//                     >
//                         {station.is_favorite ? '⭐' : '☆'}
//                     </button>
//                     <div>
//                         <div className="stop-name-row">
//                             <h3 className="stop-name">🚇 {station.name || station.description}</h3>
//                             <span className="stop-code">{station.station_code}</span>
//                         </div>
//                         <div className="stop-meta">
//                             <span className="stop-distance">Lines: {station.lines?.map(l => l.line_code).join(', ') || 'N/A'}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <button className="expand-btn">
//                     View Crowd
//                 </button>
//             </div>
//         </div>
//     ));

//     return (
//         <div className="container">
//             <div ref={mapRef} className="map-container" />

//             <div className="drawer" style={{ height: `${drawerHeight}vh` }}>
//                 <div className="drag-handle" /* ... drag props ... */>
//                     <div className="drag-bar" />
//                 </div>

//                 <div className="drawer-header">
//                     <input
//                         type="text"
//                         placeholder="Search stop/station or bus number..."
//                         className="search-input"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>

//                 <div className="transport-tabs">
//                     {/* ... transport tabs ... */}
//                     <button className="transport-tab" onClick={() => navigate("/NearbyCarparks")}>
//                         <span className="tab-icon"><FaCar /></span>
//                         <span className="tab-label">Car</span>
//                     </button>
//                     <div className="transport-tab transport-tab-active">
//                         <span className="tab-icon"><FaBus /></span>
//                         <span className="tab-label">Bus</span>
//                     </div>
//                     <button className="transport-tab" onClick={() => navigate("/CrowdDensity")}>
//                         <span className="tab-icon"><FaTrainSubway /></span>
//                         <span className="tab-label">Train</span>
//                     </button>
//                 </div>

//                 <div className="content">
//                     {/* --- CRITICAL DEBUG DISPLAY --- */}
//                     <p style={{ color: '#0095FF', textAlign: 'center', fontSize: '12px', marginBottom: '10px' }}>
//                         Current Search Location: **{queryLocation ? `${queryLocation.lat.toFixed(4)}, ${queryLocation.lng.toFixed(4)}` : 'Awaiting Location...'}**
//                     </p>
//                     {/* --- END DEBUG DISPLAY --- */}

//                     {error ? (
//                         <div className="empty-state error">
//                             <div className="empty-state-icon">❌</div>
//                             <p className="empty-state-text">{error}</p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="search-info">
//                                 {loading ? "Finding nearby stops..." : `Found ${combinedStops.length} nearby locations.`}
//                             </div>
                            
//                             <div className="stops-list">
//                                 {combinedStops.length === 0 && !loading ? (
//                                     <div className="empty-state">
//                                         <div className="empty-state-icon">🔍</div>
//                                         <p className="empty-state-text">No bus stops or MRT stations found nearby.</p>
//                                     </div>
//                                 ) : (
//                                     <>
//                                     {renderBusStopsList}
//                                     {renderMrtStationsList}
//                                     </>
//                                 )}

//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
            
//             <footer className="footer">
//                  <button className="nav-btn" onClick={() => navigate("/home")}>🏠 Home</button>
//                  <button className="nav-btn nav-btn-active">📍 Tracker</button>
//                  <button className="nav-btn" onClick={() => navigate("/my-trips")}>🧾 My Trips</button>
//                  <button className="nav-btn" onClick={() => navigate("/settings")}>⚙️ Settings</button>
//             </footer>

//         </div>
//     );
// }
