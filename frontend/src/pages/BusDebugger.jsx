import React, { useState, useEffect, useCallback } from "react";
import api from "../api";

const defaultLocation = { lat: 1.3521, lng: 103.8198 }; // Default location if geolocation fails
const API_POLL_INTERVAL = 5000; // Poll API every 5 seconds

// --- Utility Functions (remain the same) ---
const getMinutesUntilArrival = (isoTimestamp) => {
    if (!isoTimestamp) return null;
    try {
        const arrivalTime = new Date(isoTimestamp);
        const currentTime = new Date();
        const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
        return Math.max(0, Math.floor(diffSeconds / 60)); 
    } catch (e) { return null; }
};

const getArrivalColor = (time) => time <= 2 ? "red" : time <= 5 ? "orange" : "green";
const getArrivalLabel = (time) => {
    if (time === null) return "N/A";
    if (time === 0) return "Arr"; 
    if (time === 1) return "1 min";
    return `${time} min`;
};


function BusDebugger() {
    const [nearbyStops, setNearbyStops] = useState([]);
    const [searchResults, setSearchResults] = useState([]); 
    const [searchQuery, setSearchQuery] = useState(''); 
    
    const [selectedStopCode, setSelectedStopCode] = useState(null);
    const [servicesData, setServicesData] = useState(null); 
    
    const [loadingStops, setLoadingStops] = useState(true);
    const [loadingArrivals, setLoadingArrivals] = useState(false);
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null); 
    
    const [, setVisualTick] = useState(0); 

    // --- GEOLOCATION FUNCTION ---
    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser. Using default coordinates.");
            setCurrentLocation(defaultLocation);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
                setError(null);
            },
            (err) => {
                setError(`Geolocation failed: ${err.message}. Using default coordinates.`);
                setCurrentLocation(defaultLocation);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }, []);


    // 1. API: Fetch nearby bus stops (Uses currentLocation)
    const fetchNearbyBusStops = useCallback(async (location) => {
        if (!location) return; 
        setLoadingStops(true);
        try {
            const lat = location.lat;
            const lng = location.lng;
            const url = `/api/nearby-bus-stops/?lat=${lat}&lng=${lng}&radius=1000`;
            const res = await api.get(url);

            if (res.data.success && res.data.stops) {
                // IMPORTANT: Map nearby stops to use 'code' property
                const mappedNearbyStops = res.data.stops.map(stop => ({
                    code: stop.bus_stop_code, // Use 'code' consistently
                    name: stop.description || stop.road_name,
                    ...stop
                }));
                setNearbyStops(mappedNearbyStops);
                if (mappedNearbyStops.length > 0) {
                    setSelectedStopCode(prevCode => prevCode || mappedNearbyStops[0].code);
                }
            } else { setError(`API Error: ${res.data.error || "No stops returned."}`); }
        } catch (err) { setError(`Connection Error fetching nearby stops: ${err.message}.`); } 
        finally { setLoadingStops(false); }
    }, []);


    // 3. API: Fetch Search Results (Stable function)
    const fetchSearchResults = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            setLoadingStops(false);
            return;
        }
        setLoadingStops(true);
        try {
            const res = await api.get(`/api/search/bus-stops/?q=${query}`);
            
            if (res.data.success && res.data.results) {
                const mappedResults = res.data.results.map(stop => ({
                    code: stop.bus_stop_code, // Use 'code' consistently
                    name: stop.description || stop.road_name,
                    ...stop 
                }));
                setSearchResults(mappedResults);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            setError(`Search Connection Error: ${err.message}.`);
        } finally {
            setLoadingStops(false);
        }
    }, []);


    // 2. API: Fetch real-time bus arrivals (Stable function)
    const fetchBusArrivals = useCallback(async (stopCode) => {
        if (!stopCode) return;
        if (!servicesData) setLoadingArrivals(true); 
        
        try {
            const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
            
            if (res.data.success) { setServicesData(res.data.services || []); } 
            else { setError(`Arrivals API Error for ${stopCode}: ${res.data.error || "No data returned"}`); }
        } catch (err) { setError(`Connection Error fetching arrivals: ${err.message}`); } 
        finally { setLoadingArrivals(false); }
    }, []); 


    // --- EFFECTS ---

    // EFFECT 1: Get user location immediately on mount
    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);
    
    // EFFECT 2: Re-fetch nearby stops whenever the location changes
    useEffect(() => {
        if (currentLocation && searchQuery.length < 2) { 
            fetchNearbyBusStops(currentLocation);
        }
    }, [currentLocation, fetchNearbyBusStops, searchQuery]); 


    // EFFECT 3: Trigger Search on Query Change (Debounced)
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchSearchResults(searchQuery);
        }, 300);
        
        return () => clearTimeout(delaySearch);
    }, [searchQuery, fetchSearchResults]);

    // EFFECT 4: API Polling (Slow Refresh) & Initial Fetch (Stability Fix)
    useEffect(() => {
        let apiIntervalId;
        
        if (selectedStopCode) {
            fetchBusArrivals(selectedStopCode); 
            apiIntervalId = setInterval(() => {
                fetchBusArrivals(selectedStopCode);
            }, API_POLL_INTERVAL); 

        }
        return () => {
            if (apiIntervalId) clearInterval(apiIntervalId);
        };
    }, [selectedStopCode, fetchBusArrivals]);

    // EFFECT 5: Visual Countdown (Fast Refresh - 1 second)
    useEffect(() => {
        const visualIntervalId = setInterval(() => {
            setVisualTick(prev => prev + 1);
        }, 1000); 
        return () => clearInterval(visualIntervalId);
    }, []);


    // --- RENDER LOGIC ---
    const stopsToDisplay = searchQuery.length > 1 ? searchResults : nearbyStops;
    const currentServices = servicesData || [];

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>Bus Data Debugger 🚌</h1>
            <p style={{fontWeight: 'bold', marginBottom: '10px'}}>
                Location: {currentLocation ? 
                    `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}` : 
                    'Awaiting Geolocation Permission...'}
            </p>
            <hr />

            {error && (<div style={{ color: 'white', backgroundColor: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
                **ERROR:** {error}
            </div>)}

            {/* --- Search Input --- */}
            <input
                type="text"
                placeholder="Search by Stop Name, Code, or Bus Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px' }}
            />

            {/* --- 1. Nearby/Search Stops Section --- */}
            <h2>
                {searchQuery.length > 1 ? `Search Results (${stopsToDisplay.length})` : `Nearby Stops (${stopsToDisplay.length})`}
            </h2>
            {loadingStops && !currentLocation ? (
                <p>Loading location and stops...</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                    {stopsToDisplay.length === 0 && (searchQuery.length > 1 || currentLocation) ? (
                        <p>{searchQuery.length > 1 ? `No matching stops found for "${searchQuery}".` : "No stops found near your location."}</p>
                    ) : (
                        stopsToDisplay.map((stop) => (
                            <button
                                key={stop.code}
                                onClick={() => {
                                    // FIX: Sets the selected stop and clears search to allow immediate arrival update
                                    setSelectedStopCode(stop.code);
                                    setSearchQuery(''); 
                                }}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    border: `2px solid ${selectedStopCode === stop.code ? 'blue' : '#ccc'}`,
                                    backgroundColor: selectedStopCode === stop.code ? '#e0f7fa' : 'white',
                                    borderRadius: '5px',
                                    fontWeight: selectedStopCode === stop.code ? 'bold' : 'normal',
                                }}
                            >
                                {stop.description || stop.name} ({stop.code})
                            </button>
                        ))
                    )}
                </div>
            )}

            <hr />

            {/* --- 2. Arrivals Section (Live Countdown) --- */}
            <h2>2. Bus Arrivals for: {selectedStopCode || 'N/A'}</h2>
            {loadingArrivals && currentServices.length === 0 ? (
                <p>Loading real-time arrivals...</p>
            ) : currentServices.length > 0 ? (
                <div>
                    {currentServices.map((service, index) => (
                        <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                            <h3>Bus {service.service_no} ({service.operator_name})</h3>
                            <p>To: {service.buses[0]?.destination_code || 'N/A'}</p> 
                            <div style={{ display: 'flex', gap: '15px' }}>
                                {service.buses.map((bus, busIndex) => {
                                    // Calculate live countdown using the ISO timestamp
                                    const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
                                    
                                    return (
                                    <div key={busIndex} style={{ backgroundColor: getArrivalColor(liveTime), color: 'white', padding: '5px', borderRadius: '3px' }}>
                                        **{getArrivalLabel(liveTime)}**                                     </div>
                                    )})}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#666', marginTop: '10px' }}>
                    **No buses arriving soon** at this stop ({selectedStopCode}). Try another stop or refresh in 20 seconds.
                </p>
            )}
        </div>
    );
}

export default BusDebugger;