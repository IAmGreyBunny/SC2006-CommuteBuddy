import React, { useState, useEffect, useCallback, useRef } from "react"; 
import api from "../api"; 
import { FaTrainSubway, FaTriangleExclamation } from "react-icons/fa6"; 
import { NavLink } from "react-router-dom"; // Assuming you use NavLink in the final layout

// Constants
const defaultLocation = { lat: 1.3521, lng: 103.8198 }; 
const POLL_INTERVAL = 120000; // Poll every 2 minutes (120 seconds)

// --- Utility Functions (Global) ---
const lineColors = {
    EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
    NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
    NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
    CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
    DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
    TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
};
const getDensityColor = (densityCode) => { const code = String(densityCode)?.toUpperCase(); switch (code) { case "L": return "#22c55e"; case "M": return "#eab308"; case "H": return "#ef4444"; default: return "#64748b"; } };
const getDensityLabel = (densityCode) => { const upperCode = String(densityCode)?.toUpperCase(); switch (upperCode) { case "L": return "LOW"; case "M": return "MEDIUM"; case "H": return "HIGH"; default: return "UNKNOWN"; } };
const getDensityRank = (densityCode) => { const upperCode = String(densityCode)?.toUpperCase(); if (upperCode === 'H') return 3; if (upperCode === 'M') return 2; if (upperCode === 'L') return 1; return 0; };
const getDensityCodeFromRank = (rank) => { if (rank === 3) return 'H'; if (rank === 2) return 'M'; if (rank === 1) return 'L'; return 'U'; };
const calculateDistance = (lat1, lon1, lat2, lon2) => { const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; };
const findNearestStations = (allStations, location) => { if (!location || allStations.length === 0) return []; const stationsWithDistance = allStations.map(station => ({ ...station, distance: calculateDistance(location.lat, location.lng, station.latitude, station.longitude), })); stationsWithDistance.sort((a, b) => a.distance - b.distance); return stationsWithDistance.slice(0, 5); };


function DensityDebugger() {
    // --- State Variables ---
    const [stationList, setStationList] = useState([]); // Master list of stations WITH crowd data
    const [mrtStations, setMrtStations] = useState([]); // Raw station data
    const [nearestStations, setNearestStations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceAlerts, setServiceAlerts] = useState(null);

    const [loadingStations, setLoadingStations] = useState(true);
    const [loadingCrowd, setLoadingCrowd] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    
    const isFetchingRef = useRef(false); 


    // --- GEOLOCATION FUNCTION ---
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

    // --- API Calls (Stable functions) ---

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
            // Fetch data for all lines concurrently
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
                                crowdDataMap[stationCode].push({ line: lineCode, crowdLevel });
                            }
                        });
                    }
                } catch (error) { console.error(`❌ Error fetching crowd for ${lineCode}:`, error.message); }
            });

            await Promise.all(crowdFetchPromises);

            // Combine station list with crowd data
            const combinedList = allStations.map(station => {
                const crowdDetails = crowdDataMap[station.code] || [];
                const maxRank = crowdDetails.reduce((max, detail) => Math.max(max, getDensityRank(detail.crowdLevel)), 0);
                return { ...station, maxCrowdLevel: getDensityCodeFromRank(maxRank) };
            });
            
            setStationList(combinedList);

            // FIX A: Recalculate nearest stations and update the nearestStations state
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
            if (!Array.isArray(dataToMap) && res.data.data) { dataToMap = res.data.data; }
            
            const mappedStations = dataToMap.map(station => ({
                name: station.name,
                code: station.station_code,
                latitude: station.latitude, 
                longitude: station.longitude,
                lines: station.lines || [], 
            }));

            setMrtStations(mappedStations); 
        } catch (error) {
            setFetchError(`Failed to fetch station list: ${error.message}. Check console for details.`);
        } finally {
            setLoadingStations(false);
        }
    }, []);

    // --- EFFECTS ---
    
    // EFFECT 1: Initial Setup (Geolocation, Stations, Alerts)
    useEffect(() => {
        getUserLocation(); 
        fetchMrtStations(); 
        fetchServiceAlerts();
    }, [fetchMrtStations, getUserLocation, fetchServiceAlerts]);

    // 2. Crowd Data Fetching and Polling 
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


    // --- Rendering Logic ---
    const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
    const isLoading = loadingStations || loadingCrowd;

    // FIX B: Filter the *already processed* stationList (which holds crowd data) for the search
    const filteredStations = stationList.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Determine which list to display
    const displayList = searchTerm ? filteredStations : nearestStations;

    const title = searchTerm 
        ? `Search Results (${displayList.length})`
        : `Nearest Stations (${displayList.length})`; 

    return (
        <div className="crowd-container">
            <div className="drawer full-screen" style={drawerStyle}> 
                <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
                    <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
                        <FaTrainSubway /> Train (Live Debugger)
                    </div>
                </div>

                <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
                    {/* --- SEARCH BAR --- */}
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

                    {/* --- ERROR DISPLAY --- */}
                    {fetchError && (
                        <div style={{ 
                            backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
                            borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
                        }}>
                            <FaTriangleExclamation style={{ marginRight: '8px' }} />
                            {fetchError}
                        </div>
                    )}

                    {/* --- SERVICE ALERT STATUS --- */}
                    {serviceAlerts && serviceAlerts.Status !== 1 && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
                            ⚠️ Service Alert: {serviceAlerts.Message?.[0]?.Content || "Check LTA for details."}
                        </div>
                    )}

                    {/* --- LOADING INDICATOR --- */}
                    {isLoading ? (
                        <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
                            Loading Stations and Crowd Data...
                        </div>
                    ) : (
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
                                        className="list-item"
                                        onClick={() => { console.log(`Selected station: ${station.code}`); }} 
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
                                            borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' 
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



export default DensityDebugger