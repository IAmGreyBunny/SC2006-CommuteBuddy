// import React from 'react';
// import { FaTrainSubway } from "react-icons/fa6"; 
// // Import only minimal external components/CSS needed for basic styling
// // If CrowdDensity.css is causing issues, remove this line temporarily.
// // import "./CrowdDensity.css"; 

// // Hardcoded data and helper functions to bypass API/State dependencies
// const hardcodedStations = [
//     { name: "Jurong East", code: "JE", lines: [{ line_code: "EWL" }, { line_code: "NSL" }], maxCrowdLevel: "H" },
//     { name: "Raffles Place", code: "RP", lines: [{ line_code: "EWL" }, { line_code: "NSL" }], maxCrowdLevel: "M" },
//     { name: "Serangoon", code: "SR", lines: [{ line_code: "NEL" }, { line_code: "CCL" }], maxCrowdLevel: "L" },
// ];

// const getDensityColor = (densityCode) => { 
//     const code = String(densityCode)?.toUpperCase();
//     switch (code) {
//         case "L": return "#22c55e"; // Low (Green)
//         case "M": return "#eab308"; // Medium (Yellow)
//         case "H": return "#ef4444"; // High (Red)
//         default: return "#64748b"; // Unknown (Gray)
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

// const DensityDebugger = () => {
    
//     // Simulate the main application's display structure
//     const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
//     const isError = false; // Simulate no error for a clean test

//     return (
//         <div className="crowd-container">
            
//             <div className="drawer full-screen" style={drawerStyle}> 
                
//                 <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
//                         <FaTrainSubway /> Train (Debugger)
//                     </div>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
                    
//                     {/* Simulated Error Display */}
//                     {isError && (
//                         <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px' }}>
//                             **Debug Error:** This message should not appear if JSX is correct.
//                         </div>
//                     )}

//                     {/* ------------------ DEBUG LIST VIEW (Focus of the fix) ------------------ */}
//                     <div className="station-list-container">
//                         <h2>MRT Stations Debugger List</h2>
                        
//                         {/* Check if the map logic renders correctly */}
//                         {hardcodedStations.map(station => (
//                             <div 
//                                 key={station.code} 
//                                 className="list-item"
//                                 // Removed onClick to keep it simple, but kept className (the error point)
//                                 style={{
//                                     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                     padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                     borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white'
//                                 }}
//                             >
//                                 <div style={{flexGrow: 1}}>
//                                     <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>{station.name} ({station.code})</h4>
//                                     <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                         Lines: {station.lines.map(l => l.line_code).join(" • ")}
//                                     </p>
//                                 </div>
//                                 <span
//                                     className="crowd-badge"
//                                     style={{ 
//                                         backgroundColor: getDensityColor(station.maxCrowdLevel),
//                                         color: 'white',
//                                         padding: '4px 8px',
//                                         borderRadius: '9999px',
//                                         fontSize: '12px',
//                                         fontWeight: '700'
//                                     }}
//                                 >
//                                     {getDensityLabel(station.maxCrowdLevel)}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DensityDebugger;


























// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api"; 
// // FIX: Changed FaExclamationTriangle to FaTriangleExclamation
// import { FaTrainSubway, FaTriangleExclamation } from "react-icons/fa6"; 
// // import "./CrowdDensity.css"; // Keep this commented out if it caused issues before

// const DensityDebugger = () => {
//     // --- State Variables ---
//     const [stationList, setStationList] = useState([]); 
//     const [mrtStations, setMrtStations] = useState([]); 
//     const [loadingStations, setLoadingStations] = useState(true);
//     const [loadingCrowd, setLoadingCrowd] = useState(false);
//     const [fetchError, setFetchError] = useState(null); 
    
//     // Hardcoded helper data (Colors, etc.)
//     const lineColors = {
//         EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//         NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//         NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//         CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//         DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//         TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" },
//     };

//     // --- Core Helper Functions (Simplified) ---

//     const getDensityColor = (densityCode) => { 
//         const code = String(densityCode)?.toUpperCase();
//         switch (code) {
//             case "L": return "#22c55e"; // Low (Green)
//             case "M": return "#eab308"; // Medium (Yellow)
//             case "H": return "#ef4444"; // High (Red)
//             default: return "#64748b"; // Unknown (Gray)
//         }
//     };

//     const getDensityLabel = (densityCode) => { 
//         const upperCode = String(densityCode)?.toUpperCase();
//         switch (upperCode) {
//             case "L": return "LOW";
//             case "M": return "MEDIUM";
//             case "H": return "HIGH";
//             default: return "UNKNOWN";
//         }
//     };
    
//     const getDensityRank = (densityCode) => { 
//         const upperCode = String(densityCode)?.toUpperCase();
//         if (upperCode === 'H') return 3;
//         if (upperCode === 'M') return 2;
//         if (upperCode === 'L') return 1;
//         return 0; 
//     };
    
//     const getDensityCodeFromRank = (rank) => { 
//         if (rank === 3) return 'H';
//         if (rank === 2) return 'M';
//         if (rank === 1) return 'L';
//         return 'U';
//     };


//     // --- API Calls (Crowd Data & Station Combination) ---
    
//     const fetchAllCrowdData = useCallback(async (allStations) => {
//         setLoadingCrowd(true);
//         setFetchError(null); 
        
//         const crowdDataMap = {};
        
//         const allLines = Object.keys(lineColors);
//         for (const lineCode of allLines) {
//             try {
//                 const res = await api.get(`/api/mrt-crowd/${lineCode}/`);
                
//                 if (res.data.success && res.data.data?.value) {
//                     res.data.data.value.forEach(crowd => {
//                         const stationCode = crowd.Station;
//                         const crowdLevel = getDensityCodeFromRank(getDensityRank(crowd.CrowdLevel));
                        
//                         if (!crowdDataMap[stationCode]) {
//                             crowdDataMap[stationCode] = [];
//                         }
//                         crowdDataMap[stationCode].push({
//                             line: lineCode,
//                             crowdLevel: crowdLevel,
//                         });
//                     });
//                 } 
//             } catch (error) {
//                 console.error(`❌ Error fetching crowd for ${lineCode}:`, error.message, error.response);
//                 setFetchError(`Failed to fetch crowd data for ${lineCode}. Check console.`);
//             }
//         }

//         if (allStations && allStations.length > 0) {
//             const combinedList = allStations.map(station => {
//                 const crowdDetails = crowdDataMap[station.code] || [];
//                 const maxRank = crowdDetails.reduce((max, detail) => 
//                     Math.max(max, getDensityRank(detail.crowdLevel)), 0
//                 );
//                 return { ...station, maxCrowdLevel: getDensityCodeFromRank(maxRank) };
//             });
            
//             setStationList(combinedList);
//         }
        
//         setLoadingCrowd(false);
//     }, [lineColors]);

//     const fetchMrtStations = useCallback(async () => {
//         setLoadingStations(true);
//         setFetchError(null); 

//         try {
//             const res = await api.get("/api/mrt-stations/");
            
//             let dataToMap = res.data;
//             if (!Array.isArray(dataToMap)) {
//                  // Attempt to find the array if the response is nested (e.g., {data: [...]})
//                  dataToMap = res.data.data || res.data.value; 
//             }
//             if (!Array.isArray(dataToMap)) {
//                 throw new Error("API did not return a list of stations.");
//             }
            
//             const mappedStations = dataToMap.map(station => ({
//                 name: station.name,
//                 code: station.station_code,
//                 lat: station.latitude,
//                 lng: station.longitude,
//                 lines: station.lines, 
//             }));

//             setMrtStations(mappedStations); 
//             fetchAllCrowdData(mappedStations); 
            
//         } catch (error) {
//             console.error("❌ Error fetching MRT stations:", error.message, error.response);
//             setFetchError(`Failed to fetch station list: ${error.message}. Check console for details.`);
//         } finally {
//             setLoadingStations(false);
//         }
//     }, [fetchAllCrowdData]);


//     // --- Effect to run API calls on component load ---
//     useEffect(() => {
//         fetchMrtStations(); 
        
//         const intervalId = setInterval(() => {
//             if (mrtStations.length > 0) { 
//                 fetchAllCrowdData(mrtStations); 
//             }
//         }, 60000); 
        
//         return () => clearInterval(intervalId);
//     }, [fetchMrtStations, fetchAllCrowdData, mrtStations]);


//     // --- Rendering Logic ---
//     const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
//     const isLoading = loadingStations || loadingCrowd;

//     return (
//         <div className="crowd-container">
            
//             <div className="drawer full-screen" style={drawerStyle}> 
                
//                 <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
//                         <FaTrainSubway /> Train (Live Debugger)
//                     </div>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
                    
//                     {/* --- ERROR DISPLAY --- */}
//                     {fetchError && (
//                         <div style={{ 
//                             backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
//                             borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
//                         }}>
//                             {/* FIX: Use FaTriangleExclamation */}
//                             <FaTriangleExclamation style={{ marginRight: '8px' }} />
//                             **Data Fetch Error:** {fetchError}
//                         </div>
//                     )}

//                     {/* --- LOADING INDICATOR --- */}
//                     {isLoading ? (
//                         <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>Loading Stations and Crowd Data...</div>
//                     ) : (
                        
//                         /* ------------------ LIVE LIST VIEW ------------------ */
//                         <div className="station-list-container">
//                             <h2>All MRT Stations (Live)</h2>
                            
//                             {stationList.length === 0 && !fetchError ? (
//                                 <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
//                                     No stations loaded. Check API configuration in `../api.js` or server connection.
//                                 </p>
//                             ) : (
//                                 stationList.map(station => (
//                                     <div 
//                                         key={station.code} 
//                                         className="list-item"
//                                         style={{
//                                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                             padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                             borderRadius: '8px', backgroundColor: 'white'
//                                         }}
//                                     >
//                                         <div style={{flexGrow: 1}}>
//                                             <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>{station.name} ({station.code})</h4>
//                                             <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                                 Lines: {station.lines.map(l => l.line_code).join(" • ")}
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

// export default DensityDebugger;


























// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api"; 
// import { FaTrainSubway, FaTriangleExclamation } from "react-icons/fa6"; 
// // import "./CrowdDensity.css"; // Uncomment this line if you have a CSS file

// const DensityDebugger = () => {
//     // --- State Variables ---
//     const [stationList, setStationList] = useState([]);      // All stations with crowd data (for searching)
//     const [mrtStations, setMrtStations] = useState([]);      // List of all base stations (no crowd data yet)
//     const [nearestStations, setNearestStations] = useState([]); // Top 5 closest stations
//     const [userLocation, setUserLocation] = useState(null);  // { lat: X, lng: Y }
//     const [searchTerm, setSearchTerm] = useState('');        // Search query state

//     const [loadingStations, setLoadingStations] = useState(true);
//     const [loadingCrowd, setLoadingCrowd] = useState(false);
//     const [fetchError, setFetchError] = useState(null); 
    
//     // Hardcoded helper data (Colors, etc.)
//     const lineColors = {
//         EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//         NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//         NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//         CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//         DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//         TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" },
//     };

//     // --- Core Helper Functions ---

//     const getDensityColor = (densityCode) => { 
//         const code = String(densityCode)?.toUpperCase();
//         switch (code) {
//             case "L": return "#22c55e"; // Low (Green)
//             case "M": return "#eab308"; // Medium (Yellow)
//             case "H": return "#ef4444"; // High (Red)
//             default: return "#64748b"; // Unknown (Gray)
//         }
//     };

//     const getDensityLabel = (densityCode) => { 
//         const upperCode = String(densityCode)?.toUpperCase();
//         switch (upperCode) {
//             case "L": return "LOW";
//             case "M": return "MEDIUM";
//             case "H": return "HIGH";
//             default: return "UNKNOWN";
//         }
//     };
    
//     const getDensityRank = (densityCode) => { 
//         const upperCode = String(densityCode)?.toUpperCase();
//         if (upperCode === 'H') return 3;
//         if (upperCode === 'M') return 2;
//         if (upperCode === 'L') return 1;
//         return 0; 
//     };
    
//     const getDensityCodeFromRank = (rank) => { 
//         if (rank === 3) return 'H';
//         if (rank === 2) return 'M';
//         if (rank === 1) return 'L';
//         return 'U';
//     };

//     // --- Geolocation and Distance Functions ---

//     // Haversine formula to calculate distance between two coordinates in km
//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//         const R = 6371; // Radius of Earth in kilometers
//         const dLat = (lat2 - lat1) * (Math.PI / 180);
//         const dLon = (lon2 - lon1) * (Math.PI / 180);
//         const a = 
//             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c; // Distance in km
//     };

//     const findNearestStations = useCallback((allStations, location) => {
//         if (!location || allStations.length === 0) return [];
        
//         const stationsWithDistance = allStations.map(station => ({
//             ...station,
//             distance: calculateDistance(location.lat, location.lng, station.lat, station.lng),
//         }));
        
//         // Sort by distance and take the top 5
//         stationsWithDistance.sort((a, b) => a.distance - b.distance);
//         return stationsWithDistance.slice(0, 5);
//     }, []);

//     const getUserLocation = useCallback(() => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const location = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };
//                     setUserLocation(location);
//                 },
//                 (error) => {
//                     console.error("Geolocation Error:", error);
//                     // Fallback to a default location (e.g., Singapore center)
//                     setUserLocation({ lat: 1.3521, lng: 103.8198 }); 
//                     setFetchError("Could not retrieve your location. Showing results based on a default center point.");
//                 }
//             );
//         } else {
//             setFetchError("Geolocation is not supported by this browser.");
//             setUserLocation({ lat: 1.3521, lng: 103.8198 }); // Fallback
//         }
//     }, []);


//     // --- API Calls (Crowd Data & Station Combination) ---
    
//     const fetchAllCrowdData = useCallback(async (allStations) => {
//         setLoadingCrowd(true);
//         // Do NOT clear fetchError here, as we want to preserve the Station Fetch error if it exists.
        
//         const crowdDataMap = {};
        
//         const allLines = Object.keys(lineColors);
//         for (const lineCode of allLines) {
//             try {
//                 const res = await api.get(`/api/mrt-crowd/${lineCode}/`);
                
//                 let crowdDataArray = [];

//                 if (res.data && res.data.success && res.data.data && Array.isArray(res.data.data.value)) {
//                     crowdDataArray = res.data.data.value; // Expected LTA structure
//                 } else if (res.data && Array.isArray(res.data)) {
//                      crowdDataArray = res.data; // Raw array structure (often used in simple mocks)
//                 } else {
//                      console.warn(`Crowd data for ${lineCode} was not in expected format:`, res.data);
//                 }
    
//                 if (crowdDataArray.length > 0) {
//                     crowdDataArray.forEach(crowd => {
//                         const stationCode = crowd.Station;
//                         // Use a fallback rank/level for safety
//                         const crowdLevel = getDensityCodeFromRank(getDensityRank(crowd.CrowdLevel || 'U')); 
                        
//                         if (stationCode) { 
//                             if (!crowdDataMap[stationCode]) {
//                                 crowdDataMap[stationCode] = [];
//                             }
//                             crowdDataMap[stationCode].push({
//                                 line: lineCode,
//                                 crowdLevel: crowdLevel,
//                             });
//                         }
//                     });
//                 } 
//             } catch (error) {
//                 console.error(`❌ Error fetching crowd for ${lineCode}:`, error.message, error.response);
//                 // Set the error, but don't stop processing other lines
//                 setFetchError(`Failed to fetch crowd data for ${lineCode}. Check console.`);
//             }
//         }

//         if (allStations && allStations.length > 0) {
//             // Step 1: Combine station list with crowd data
//             const combinedList = allStations.map(station => {
//                 const crowdDetails = crowdDataMap[station.code] || [];
//                 // Calculate the MAX crowd level from all lines at this station
//                 const maxRank = crowdDetails.reduce((max, detail) => 
//                     Math.max(max, getDensityRank(detail.crowdLevel)), 0
//                 );
//                 return { ...station, maxCrowdLevel: getDensityCodeFromRank(maxRank) };
//             });
            
//             // Step 2: Set the full list (for search)
//             setStationList(combinedList);

//             // Step 3: Identify and set the nearest 5 stations (for default view)
//             if (userLocation) {
//                  const nearest = findNearestStations(combinedList, userLocation);
//                  setNearestStations(nearest);
//             } else {
//                  // Fallback if userLocation hasn't loaded yet (shouldn't happen often)
//                  setNearestStations(combinedList.slice(0, 5));
//             }
//         }
        
//         setLoadingCrowd(false);
//     }, [lineColors, userLocation, findNearestStations]);

    
//     const fetchMrtStations = useCallback(async () => {
//         setLoadingStations(true);
//         // Clear only the generic fetch error before attempting new fetch
//         setFetchError(null); 

//         // Start by getting location (asynchronously)
//         // getUserLocation();

//         try {
//             const res = await api.get("/api/mrt-stations/");
            
//             let dataToMap = res.data;
//             if (!Array.isArray(dataToMap)) {
//                  // Handle nested response from server (e.g., {data: [...]})
//                  dataToMap = res.data.data || res.data.value; 
//             }
//             if (!Array.isArray(dataToMap)) {
//                 throw new Error("API did not return a list of stations in expected format.");
//             }
            
//             const mappedStations = dataToMap.map(station => ({
//                 name: station.name,
//                 code: station.station_code,
//                 lat: station.latitude,
//                 lng: station.longitude,
//                 lines: station.lines, 
//             }));

//             // Store the base station list
//             setMrtStations(mappedStations); 
//             // getUserLocation();
//             // Immediately kick off the first crowd data fetch
//             // This is called only once here, as the location is fetched asynchronously in getUserLocation()
//             // fetchAllCrowdData(mappedStations); 
            
//         } catch (error) {
//             console.error("❌ Error fetching MRT stations:", error.message, error.response);
//             setFetchError(`Failed to fetch station list: ${error.message}. Check console for details.`);
//         } finally {
//             setLoadingStations(false);
//         }
//     }, []);


//     // --- Main Effect: Initialization and Polling ---
//     useEffect(() => {
//         // 1. Initial Station Fetch and Geolocation
//         fetchMrtStations(); 

//         getUserLocation();
        
//     }, [fetchMrtStations, fetchAllCrowdData]);

//     useEffect(() => {
//     // Only run this if we have the necessary data
//     if (mrtStations.length > 0 && userLocation) {
//         // Kick off the initial crowd data fetch
//         fetchAllCrowdData(mrtStations); 
        
//         // Start polling (only for crowd data)
//         const intervalId = setInterval(() => {
//              // Pass the existing stations list
//              fetchAllCrowdData(mrtStations); 
//         }, 60000); 

//         return () => clearInterval(intervalId);
//     }
//     // This effect runs when mrtStations or userLocation changes (i.e., when they are successfully fetched).
//     }, [mrtStations, userLocation, fetchAllCrowdData]);




//     // --- Rendering Logic ---
//     const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
//     const isLoading = loadingStations || loadingCrowd;

//     const filteredStations = stationList.filter(station =>
//         station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         station.code.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const displayList = searchTerm ? filteredStations : nearestStations;
//     const title = searchTerm 
//         ? `Search Results (${filteredStations.length})`
//         : `Nearest Stations (${nearestStations.length})` ;


//     return (
//         <div className="crowd-container">
            
//             <div className="drawer full-screen" style={drawerStyle}> 
                
//                 <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
//                         <FaTrainSubway /> **Train (Live Debugger)**
//                     </div>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
                    
//                     {/* --- SEARCH BAR --- */}
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

//                     {/* --- ERROR DISPLAY --- */}
//                     {fetchError && (
//                         <div style={{ 
//                             backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
//                             borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
//                         }}>
//                             <FaTriangleExclamation style={{ marginRight: '8px' }} />
//                             **Data Fetch Error:** {fetchError}
//                         </div>
//                     )}

//                     {/* --- LOADING INDICATOR --- */}
//                     {isLoading ? (
//                         <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
//                             Loading Stations and Crowd Data...
//                         </div>
//                     ) : (
                        
//                         /* ------------------ LIVE LIST VIEW ------------------ */
//                         <div className="station-list-container">
//                             <h2>{title}</h2>
                            
//                             {displayList.length === 0 ? (
//                                 <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
//                                     {searchTerm 
//                                         ? "No stations match your search term."
//                                         : "Could not find your nearest stations. Please try searching."
//                                     }
//                                 </p>
//                             ) : (
//                                 displayList.map(station => (
//                                     <div 
//                                         key={station.code} 
//                                         className="list-item"
//                                         style={{
//                                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                             padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                             borderRadius: '8px', backgroundColor: 'white'
//                                         }}
//                                     >
//                                         <div style={{flexGrow: 1}}>
//                                             <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
//                                                 {station.name} ({station.code})
//                                             </h4>
//                                             <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                                 Lines: {station.lines.map(l => l.line_code).join(" • ")}
//                                                 {/* Display distance only for the nearest station view */}
//                                                 {!searchTerm && station.distance !== undefined && 
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

// export default DensityDebugger;






















// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api"; 
// import { FaTrainSubway, FaTriangleExclamation } from "react-icons/fa6"; 
// // import "./CrowdDensity.css"; // Uncomment this line if you have a CSS file

// const DensityDebugger = () => {
//     // --- State Variables ---
//     const [stationList, setStationList] = useState([]);       // All stations with crowd data (for searching)
//     const [mrtStations, setMrtStations] = useState([]);       // List of all base stations (no crowd data yet)
//     const [nearestStations, setNearestStations] = useState([]); // Top 5 closest stations
//     const [userLocation, setUserLocation] = useState(null);    // { lat: X, lng: Y }
//     const [searchTerm, setSearchTerm] = useState('');         // Search query state

//     const [loadingStations, setLoadingStations] = useState(true);
//     const [loadingCrowd, setLoadingCrowd] = useState(false);
//     const [fetchError, setFetchError] = useState(null); 
    
//     // Hardcoded helper data (Colors, etc.)
//     const lineColors = {
//         EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//         NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//         NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//         CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//         DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//         TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" },
//     };

//     // --- Core Helper Functions (Unchanged) ---

//     const getDensityColor = (densityCode) => { 
//         const code = String(densityCode)?.toUpperCase();
//         switch (code) {
//             case "L": return "#22c55e"; // Low (Green)
//             case "M": return "#eab308"; // Medium (Yellow)
//             case "H": return "#ef4444"; // High (Red)
//             default: return "#64748b"; // Unknown (Gray)
//         }
//     };

//     const getDensityLabel = (densityCode) => { 
//         const upperCode = String(densityCode)?.toUpperCase();
//         switch (upperCode) {
//             case "L": return "LOW";
//             case "M": return "MEDIUM";
//             case "H": return "HIGH";
//             default: return "UNKNOWN";
//         }
//     };
    
//     const getDensityRank = (densityCode) => { 
//         const upperCode = String(densityCode)?.toUpperCase();
//         if (upperCode === 'H') return 3;
//         if (upperCode === 'M') return 2;
//         if (upperCode === 'L') return 1;
//         return 0; 
//     };
    
//     const getDensityCodeFromRank = (rank) => { 
//         if (rank === 3) return 'H';
//         if (rank === 2) return 'M';
//         if (rank === 1) return 'L';
//         return 'U';
//     };

//     // --- Geolocation and Distance Functions (Unchanged) ---

//     // Haversine formula to calculate distance between two coordinates in km
//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//         const R = 6371; // Radius of Earth in kilometers
//         const dLat = (lat2 - lat1) * (Math.PI / 180);
//         const dLon = (lon2 - lon1) * (Math.PI / 180);
//         const a = 
//             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c; // Distance in km
//     };

//     const findNearestStations = useCallback((allStations, location) => {
//         if (!location || allStations.length === 0) return [];
        
//         const stationsWithDistance = allStations.map(station => ({
//             ...station,
//             distance: calculateDistance(location.lat, location.lng, station.lat, station.lng),
//         }));
        
//         // Sort by distance and take the top 5
//         stationsWithDistance.sort((a, b) => a.distance - b.distance);
//         return stationsWithDistance.slice(0, 5);
//     }, [calculateDistance]); // Added calculateDistance to deps for completeness, though it's constant

//     const getUserLocation = useCallback(() => {
//         if (navigator.geolocation) {
//             // Note: Geolocation is async, userLocation state update will trigger re-render
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const location = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };
//                     setUserLocation(location);
//                 },
//                 (error) => {
//                     console.error("Geolocation Error:", error);
//                     // Fallback to a default location (e.g., Singapore center)
//                     setUserLocation({ lat: 1.3521, lng: 103.8198 }); 
//                     setFetchError("Could not retrieve your location. Showing results based on a default center point.");
//                 }
//             );
//         } else {
//             setFetchError("Geolocation is not supported by this browser.");
//             setUserLocation({ lat: 1.3521, lng: 103.8198 }); // Fallback
//         }
//     }, []);


//     // --- API Calls (Crowd Data & Station Combination) ---
    
//     // This function is now responsible ONLY for fetching crowd data and combining it with existing stations.
//     const fetchAllCrowdData = useCallback(async (allStations) => {
//         if (allStations.length === 0) return; // Prevent unnecessary execution

//         setLoadingCrowd(true);
//         // Do NOT clear fetchError here, as we want to preserve the Station Fetch error if it exists.
        
//         const crowdDataMap = {};
        
//         const allLines = Object.keys(lineColors);
//         const crowdFetchPromises = allLines.map(async (lineCode) => {
//              try {
//                 const res = await api.get(`/api/mrt-crowd/${lineCode}/`);
                
//                 let crowdDataArray = [];

//                 if (res.data && res.data.success && res.data.data && Array.isArray(res.data.data.value)) {
//                     crowdDataArray = res.data.data.value; // Expected LTA structure
//                 } else if (res.data && Array.isArray(res.data)) {
//                      crowdDataArray = res.data; // Raw array structure (often used in simple mocks)
//                 } else {
//                      console.warn(`Crowd data for ${lineCode} was not in expected format:`, res.data);
//                 }
    
//                 if (crowdDataArray.length > 0) {
//                     crowdDataArray.forEach(crowd => {
//                         const stationCode = crowd.Station;
//                         const crowdLevel = getDensityCodeFromRank(getDensityRank(crowd.CrowdLevel || 'U')); 
                        
//                         if (stationCode) { 
//                             if (!crowdDataMap[stationCode]) {
//                                 crowdDataMap[stationCode] = [];
//                             }
//                             crowdDataMap[stationCode].push({
//                                 line: lineCode,
//                                 crowdLevel: crowdLevel,
//                             });
//                         }
//                     });
//                 }
//             } catch (error) {
//                 console.error(`❌ Error fetching crowd for ${lineCode}:`, error.message, error.response);
//                 // Set the error, but don't stop processing other lines
//                 setFetchError(`Failed to fetch crowd data for ${lineCode}. Check console.`);
//             }
//         });
        
//         await Promise.all(crowdFetchPromises); // Wait for all crowd data to be fetched

//         // Step 1: Combine station list with crowd data
//         const combinedList = allStations.map(station => {
//             const crowdDetails = crowdDataMap[station.code] || [];
//             // Calculate the MAX crowd level from all lines at this station
//             const maxRank = crowdDetails.reduce((max, detail) => 
//                 Math.max(max, getDensityRank(detail.crowdLevel)), 0
//             );
//             return { ...station, maxCrowdLevel: getDensityCodeFromRank(maxRank) };
//         });
        
//         // Step 2: Set the full list (for search)
//         setStationList(combinedList);

//         // Step 3: Identify and set the nearest 5 stations (for default view)
//         if (userLocation) {
//              const nearest = findNearestStations(combinedList, userLocation);
//              setNearestStations(nearest);
//         } else {
//              // Fallback if userLocation hasn't loaded yet
//              setNearestStations(combinedList.slice(0, 5));
//         }
        
//         setLoadingCrowd(false);
//     }, [lineColors, userLocation, findNearestStations]); // Dependencies are correct

    
//     // This function is now responsible ONLY for fetching the base station list (one-time).
//     const fetchMrtStations = useCallback(async () => {
//         setLoadingStations(true);
//         setFetchError(null); 

//         try {
//             const res = await api.get("/api/mrt-stations/");
            
//             let dataToMap = res.data;
//             if (!Array.isArray(dataToMap)) {
//                  // Handle nested response
//                  dataToMap = res.data.data || res.data.value; 
//             }
//             if (!Array.isArray(dataToMap)) {
//                 throw new Error("API did not return a list of stations in expected format.");
//             }
            
//             const mappedStations = dataToMap.map(station => ({
//                 name: station.name,
//                 code: station.station_code,
//                 lat: station.latitude,
//                 lng: station.longitude,
//                 lines: station.lines, 
//             }));

//             // This state update will trigger the next useEffect (Initial Crowd/Polling)
//             setMrtStations(mappedStations); 
            
//         } catch (error) {
//             console.error("❌ Error fetching MRT stations:", error.message, error.response);
//             setFetchError(`Failed to fetch station list: ${error.message}. Check console for details.`);
//         } finally {
//             setLoadingStations(false);
//         }
//     }, []); // Dependencies are now correctly an empty array!


//     // --- Effect 1: Initial Setup (Runs ONCE on mount) ---
//     useEffect(() => {
//         // 1. Fetch the static list of MRT stations
//         fetchMrtStations(); 
        
//         // 2. Get the user's location
//         getUserLocation();
        
//         // No cleanup needed here.
//     }, []); // Correctly uses memoized function references


//     // --- Effect 2: Crowd Data Fetch (Runs when stations or location are ready, and then polls) ---
//     useEffect(() => {
//         // Only run if both base stations and user location are available
//         if (mrtStations.length > 0 && userLocation) {
            
//             // A. Initial crowd data fetch after stations and location are ready
//             fetchAllCrowdData(mrtStations); 
            
//             // B. Set up Polling for CROWD DATA ONLY (runs every 60 seconds)
//             const intervalId = setInterval(() => {
//                  // Pass the existing stations list for the crowd update function
//                  fetchAllCrowdData(mrtStations); 
//             }, 60000); // Fetch crowd data every 60 seconds (1 minute)
            
//             // Cleanup function to clear the interval when the component unmounts or dependencies change
//             return () => clearInterval(intervalId);
//         }
        
//     // This effect only runs when mrtStations or userLocation states change (i.e., when they load initially).
//     }, [mrtStations, userLocation, fetchAllCrowdData]);


//     // --- Rendering Logic ---
//     const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
//     const isLoading = loadingStations || loadingCrowd;

//     const filteredStations = stationList.filter(station =>
//         station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         station.code.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const displayList = searchTerm ? filteredStations : nearestStations;
//     const title = searchTerm 
//         ? `Search Results (${filteredStations.length})`
//         : `Nearest Stations (${nearestStations.length})` ;


//     return (
//         <div className="crowd-container">
            
//             <div className="drawer full-screen" style={drawerStyle}> 
                
//                 <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
//                         <FaTrainSubway /> **Train (Live Debugger)**
//                     </div>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
                    
//                     {/* --- SEARCH BAR --- */}
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

//                     {/* --- ERROR DISPLAY --- */}
//                     {fetchError && (
//                         <div style={{ 
//                             backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
//                             borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
//                         }}>
//                             <FaTriangleExclamation style={{ marginRight: '8px' }} />
//                             **Data Fetch Error:** {fetchError}
//                         </div>
//                     )}

//                     {/* --- LOADING INDICATOR --- */}
//                     {isLoading ? (
//                         <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
//                             Loading Stations and Crowd Data...
//                         </div>
//                     ) : (
                        
//                         /* ------------------ LIVE LIST VIEW ------------------ */
//                         <div className="station-list-container">
//                             <h2>{title}</h2>
                            
//                             {displayList.length === 0 ? (
//                                 <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
//                                     {searchTerm 
//                                         ? "No stations match your search term."
//                                         : "Could not find your nearest stations. Please try searching."
//                                     }
//                                 </p>
//                             ) : (
//                                 displayList.map(station => (
//                                     <div 
//                                         key={station.code} 
//                                         className="list-item"
//                                         style={{
//                                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                             padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                             borderRadius: '8px', backgroundColor: 'white'
//                                         }}
//                                     >
//                                         <div style={{flexGrow: 1}}>
//                                             <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
//                                                 {station.name} ({station.code})
//                                             </h4>
//                                             <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                                 Lines: {station.lines.map(l => l.line_code).join(" • ")}
//                                                 {/* Display distance only for the nearest station view */}
//                                                 {!searchTerm && station.distance !== undefined && 
//                                                     <span style={{ marginLeft: '10px', fontStyle: 'italic', color: '#4b5563' }}>
//                                                          ({station.distance.toFixed(2)} km away)
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

// export default DensityDebugger;































// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api"; 
// import { FaTrainSubway, FaTriangleExclamation } from "react-icons/fa6"; 

// const DensityDebugger = () => {
//     // --- State Variables ---
//     const [stationList, setStationList] = useState([]);
//     const [mrtStations, setMrtStations] = useState([]);
//     const [nearestStations, setNearestStations] = useState([]);
//     const [userLocation, setUserLocation] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');

//     const [loadingStations, setLoadingStations] = useState(true);
//     const [loadingCrowd, setLoadingCrowd] = useState(false);
//     const [fetchError, setFetchError] = useState(null);
    
//     // Add a state to track if we're currently fetching to prevent overlapping calls
//     const [isFetching, setIsFetching] = useState(false);

//     // Hardcoded helper data
//     const lineColors = {
//         EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//         NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//         NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//         CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//         DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//         TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" },
//     };

//     // --- Core Helper Functions ---
//     const getDensityColor = (densityCode) => { 
//         const code = String(densityCode)?.toUpperCase();
//         switch (code) {
//             case "L": return "#22c55e";
//             case "M": return "#eab308";
//             case "H": return "#ef4444";
//             default: return "#64748b";
//         }
//     };

//     const getDensityLabel = (densityCode) => { 
//         const upperCode = String(densityCode)?.toUpperCase();
//         switch (upperCode) {
//             case "L": return "LOW";
//             case "M": return "MEDIUM";
//             case "H": return "HIGH";
//             default: return "UNKNOWN";
//         }
//     };
    
//     const getDensityRank = (densityCode) => { 
//         const upperCode = String(densityCode)?.toUpperCase();
//         if (upperCode === 'H') return 3;
//         if (upperCode === 'M') return 2;
//         if (upperCode === 'L') return 1;
//         return 0; 
//     };
    
//     const getDensityCodeFromRank = (rank) => { 
//         if (rank === 3) return 'H';
//         if (rank === 2) return 'M';
//         if (rank === 1) return 'L';
//         return 'U';
//     };

//     // --- Geolocation and Distance Functions ---
//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//         const R = 6371;
//         const dLat = (lat2 - lat1) * (Math.PI / 180);
//         const dLon = (lon2 - lon1) * (Math.PI / 180);
//         const a = 
//             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         return R * c;
//     };

//     const findNearestStations = useCallback((allStations, location) => {
//         if (!location || allStations.length === 0) return [];
        
//         const stationsWithDistance = allStations.map(station => ({
//             ...station,
//             distance: calculateDistance(location.lat, location.lng, station.lat, station.lng),
//         }));
        
//         stationsWithDistance.sort((a, b) => a.distance - b.distance);
//         return stationsWithDistance.slice(0, 5);
//     }, []);

//     const getUserLocation = useCallback(() => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const location = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     };
//                     setUserLocation(location);
//                 },
//                 (error) => {
//                     console.error("Geolocation Error:", error);
//                     setUserLocation({ lat: 1.3521, lng: 103.8198 });
//                     setFetchError("Could not retrieve your location. Showing results based on a default center point.");
//                 }
//             );
//         } else {
//             setFetchError("Geolocation is not supported by this browser.");
//             setUserLocation({ lat: 1.3521, lng: 103.8198 });
//         }
//     }, []);

//     // --- FIXED API Calls ---
//     const fetchAllCrowdData = useCallback(async (allStations) => {
//         // Prevent multiple simultaneous calls
//         if (isFetching || allStations.length === 0) {
//             return;
//         }

//         setIsFetching(true);
//         setLoadingCrowd(true);
        
//         const crowdDataMap = {};
//         const allLines = Object.keys(lineColors);
        
//         try {
//             // Use Promise.all to fetch all lines simultaneously instead of sequentially
//             const crowdFetchPromises = allLines.map(async (lineCode) => {
//                 try {
//                     const res = await api.get(`/api/mrt-crowd/${lineCode}/`);
                    
//                     let crowdDataArray = [];
//                     if (res.data && res.data.success && res.data.data && Array.isArray(res.data.data.value)) {
//                         crowdDataArray = res.data.data.value;
//                     } else if (res.data && Array.isArray(res.data)) {
//                         crowdDataArray = res.data;
//                     } else {
//                         console.warn(`Crowd data for ${lineCode} was not in expected format:`, res.data);
//                     }

//                     if (crowdDataArray.length > 0) {
//                         crowdDataArray.forEach(crowd => {
//                             const stationCode = crowd.Station;
//                             const crowdLevel = getDensityCodeFromRank(getDensityRank(crowd.CrowdLevel || 'U')); 
                            
//                             if (stationCode) { 
//                                 if (!crowdDataMap[stationCode]) {
//                                     crowdDataMap[stationCode] = [];
//                                 }
//                                 crowdDataMap[stationCode].push({
//                                     line: lineCode,
//                                     crowdLevel: crowdLevel,
//                                 });
//                             }
//                         });
//                     }
//                 } catch (error) {
//                     console.error(`❌ Error fetching crowd for ${lineCode}:`, error.message);
//                     // Don't set fetch error for individual line failures to avoid spam
//                 }
//             });

//             await Promise.all(crowdFetchPromises);

//             // Combine station list with crowd data
//             const combinedList = allStations.map(station => {
//                 const crowdDetails = crowdDataMap[station.code] || [];
//                 const maxRank = crowdDetails.reduce((max, detail) => 
//                     Math.max(max, getDensityRank(detail.crowdLevel)), 0
//                 );
//                 return { ...station, maxCrowdLevel: getDensityCodeFromRank(maxRank) };
//             });
            
//             setStationList(combinedList);

//             // Update nearest stations
//             if (userLocation) {
//                 const nearest = findNearestStations(combinedList, userLocation);
//                 setNearestStations(nearest);
//             } else {
//                 setNearestStations(combinedList.slice(0, 5));
//             }
            
//         } catch (error) {
//             console.error("Error in fetchAllCrowdData:", error);
//             setFetchError("Failed to fetch crowd data. Please try again.");
//         } finally {
//             setLoadingCrowd(false);
//             setIsFetching(false);
//         }
//     }, [lineColors, userLocation, findNearestStations, isFetching]);

//     const fetchMrtStations = useCallback(async () => {
//         setLoadingStations(true);
//         setFetchError(null);

//         try {
//             const res = await api.get("/api/mrt-stations/");
            
//             let dataToMap = res.data;
//             if (!Array.isArray(dataToMap)) {
//                 dataToMap = res.data.data || res.data.value; 
//             }
//             if (!Array.isArray(dataToMap)) {
//                 throw new Error("API did not return a list of stations in expected format.");
//             }
            
//             const mappedStations = dataToMap.map(station => ({
//                 name: station.name,
//                 code: station.station_code,
//                 lat: station.latitude,
//                 lng: station.longitude,
//                 lines: station.lines, 
//             }));

//             setMrtStations(mappedStations); 
            
//         } catch (error) {
//             console.error("❌ Error fetching MRT stations:", error.message);
//             setFetchError(`Failed to fetch station list: ${error.message}. Check console for details.`);
//         } finally {
//             setLoadingStations(false);
//         }
//     }, []);

//     // --- FIXED Effects ---
//     useEffect(() => {
//         fetchMrtStations(); 
//         getUserLocation();
//     }, [fetchMrtStations, getUserLocation]);

//     useEffect(() => {
//         // Only run when both stations and location are ready
//         if (mrtStations.length > 0 && userLocation && !isFetching) {
//             fetchAllCrowdData(mrtStations);
            
//             // Set up polling with longer interval and proper cleanup
//             const intervalId = setInterval(() => {
//                 if (!isFetching) {
//                     fetchAllCrowdData(mrtStations);
//                 }
//             }, 120000); // Increased to 2 minutes to reduce server load
            
//             return () => clearInterval(intervalId);
//         }
//     }, [mrtStations, userLocation, fetchAllCrowdData, isFetching]);

//     // --- Rendering Logic ---
//     const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
//     const isLoading = loadingStations || loadingCrowd;

//     const filteredStations = stationList.filter(station =>
//         station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         station.code.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const displayList = searchTerm ? filteredStations : nearestStations;
//     const title = searchTerm 
//         ? `Search Results (${filteredStations.length})`
//         : `Nearest Stations (${nearestStations.length})`;

//     return (
//         <div className="crowd-container">
//             <div className="drawer full-screen" style={drawerStyle}> 
//                 <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
//                         <FaTrainSubway /> Train (Live Debugger)
//                     </div>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
//                     {/* --- SEARCH BAR --- */}
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

//                     {/* --- ERROR DISPLAY --- */}
//                     {fetchError && (
//                         <div style={{ 
//                             backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
//                             borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
//                         }}>
//                             <FaTriangleExclamation style={{ marginRight: '8px' }} />
//                             {fetchError}
//                         </div>
//                     )}

//                     {/* --- LOADING INDICATOR --- */}
//                     {isLoading ? (
//                         <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
//                             Loading Stations and Crowd Data...
//                         </div>
//                     ) : (
//                         <div className="station-list-container">
//                             <h2>{title}</h2>
                            
//                             {displayList.length === 0 ? (
//                                 <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
//                                     {searchTerm 
//                                         ? "No stations match your search term."
//                                         : "Could not find your nearest stations. Please try searching."
//                                     }
//                                 </p>
//                             ) : (
//                                 displayList.map(station => (
//                                     <div 
//                                         key={station.code} 
//                                         className="list-item"
//                                         style={{
//                                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                             padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                             borderRadius: '8px', backgroundColor: 'white'
//                                         }}
//                                     >
//                                         <div style={{flexGrow: 1}}>
//                                             <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
//                                                 {station.name} ({station.code})
//                                             </h4>
//                                             <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                                 Lines: {station.lines.map(l => l.line_code).join(" • ")}
//                                                 {!searchTerm && station.distance !== undefined && 
//                                                     <span style={{ marginLeft: '10px', fontStyle: 'italic', color: '#4b5563' }}>
//                                                          ({station.distance.toFixed(2)} km away)
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

// export default DensityDebugger;






































//bad i thinkkk

// 

























// import React, { useState, useEffect, useCallback, useRef } from "react"; 
// import api from "../api"; 
// import { FaTrainSubway, FaTriangleExclamation } from "react-icons/fa6"; 

// // Constants
// const defaultLocation = { lat: 1.3521, lng: 103.8198 }; 
// const POLL_INTERVAL = 120000; 

// // --- Utility Functions (Global) ---
// // (Your utility functions like getDensityColor, getDensityLabel, calculateDistance, etc., go here)

// const lineColors = {
//     EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//     NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//     NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//     CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//     DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//     TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
// };
// const getDensityColor = (densityCode) => { const code = String(densityCode)?.toUpperCase(); switch (code) { case "L": return "#22c55e"; case "M": return "#eab308"; case "H": return "#ef4444"; default: return "#64748b"; } };
// const getDensityLabel = (densityCode) => { const upperCode = String(densityCode)?.toUpperCase(); switch (upperCode) { case "L": return "LOW"; case "M": return "MEDIUM"; case "H": return "HIGH"; default: return "UNKNOWN"; } };
// const getDensityRank = (densityCode) => { const upperCode = String(densityCode)?.toUpperCase(); if (upperCode === 'H') return 3; if (upperCode === 'M') return 2; if (upperCode === 'L') return 1; return 0; };
// const getDensityCodeFromRank = (rank) => { if (rank === 3) return 'H'; if (rank === 2) return 'M'; if (rank === 1) return 'L'; return 'U'; };
// const calculateDistance = (lat1, lon1, lat2, lon2) => { const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; };
// const findNearestStations = (allStations, location) => { if (!location || allStations.length === 0) return []; const stationsWithDistance = allStations.map(station => ({ ...station, distance: calculateDistance(location.lat, location.lng, station.latitude, station.longitude), })); stationsWithDistance.sort((a, b) => a.distance - b.distance); return stationsWithDistance.slice(0, 5); };


// function DensityDebugger() {
//     // --- State Variables ---
//     const [stationList, setStationList] = useState([]); 
//     const [mrtStations, setMrtStations] = useState([]); 
//     const [nearestStations, setNearestStations] = useState([]);
//     const [userLocation, setUserLocation] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [serviceAlerts, setServiceAlerts] = useState(null);

//     const [loadingStations, setLoadingStations] = useState(true);
//     const [loadingCrowd, setLoadingCrowd] = useState(false);
//     const [fetchError, setFetchError] = useState(null);
    
//     const isFetchingRef = useRef(false); 


//     // --- GEOLOCATION FUNCTION (Define First) ---
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

//     // --- API Calls (Define next) ---

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
//                                 crowdDataMap[stationCode].push({ line: lineCode, crowdLevel });
//                             }
//                         });
//                     }
//                 } catch (error) { console.error(`❌ Error fetching crowd for ${lineCode}:`, error.message); }
//             });

//             await Promise.all(crowdFetchPromises);

//             // Combine station list with crowd data
//             const combinedList = allStations.map(station => {
//                 const crowdDetails = crowdDataMap[station.code] || [];
//                 const maxRank = crowdDetails.reduce((max, detail) => Math.max(max, getDensityRank(detail.crowdLevel)), 0);
//                 return { ...station, maxCrowdLevel: getDensityCodeFromRank(maxRank) };
//             });
            
//             setStationList(combinedList);

//             // Update nearest stations
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
//             if (!Array.isArray(dataToMap) && res.data.data) { dataToMap = res.data.data; }
            
//             const mappedStations = dataToMap.map(station => ({
//                 name: station.name,
//                 code: station.station_code,
//                 latitude: station.latitude, 
//                 longitude: station.longitude,
//                 lines: station.lines || [], 
//             }));

//             setMrtStations(mappedStations); 
//         } catch (error) {
//             setFetchError(`Failed to fetch station list: ${error.message}. Check console for details.`);
//         } finally {
//             setLoadingStations(false);
//         }
//     }, []);

//     // --- EFFECTS (Define last) ---
    
//     // EFFECT 1: Initial Setup (Geolocation, Stations, Alerts)
//     useEffect(() => {
//         // Calling getUserLocation here will now work because it's defined above.
//         getUserLocation(); 
//         fetchMrtStations(); 
//         fetchServiceAlerts();
//     }, [fetchMrtStations, getUserLocation, fetchServiceAlerts]);

//     // 2. Crowd Data Fetching and Polling 
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


//     // --- Rendering Logic ---
//     const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
//     const isLoading = loadingStations || loadingCrowd;

//     const filteredStations = mrtStations.filter(station =>
//         station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         station.code.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const displayList = searchTerm ? filteredStations : nearestStations;
//     const title = searchTerm 
//         ? `Search Results (${filteredStations.length})`
//         : `Nearest Stations (${nearestStations.length})`;

//     return (
//         <div className="crowd-container">
//             <div className="drawer full-screen" style={drawerStyle}> 
//                 <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
//                         <FaTrainSubway /> Train (Live Debugger)
//                     </div>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
//                     {/* --- SEARCH BAR --- */}
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

//                     {/* --- ERROR DISPLAY --- */}
//                     {fetchError && (
//                         <div style={{ 
//                             backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
//                             borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
//                         }}>
//                             <FaTriangleExclamation style={{ marginRight: '8px' }} />
//                             {fetchError}
//                         </div>
//                     )}

//                     {/* --- SERVICE ALERT STATUS --- */}
//                     {serviceAlerts && serviceAlerts.Status !== 1 && (
//                         <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
//                             ⚠️ Service Alert: {serviceAlerts.Message?.[0]?.Content || "Check LTA for details."}
//                         </div>
//                     )}

//                     {/* --- LOADING INDICATOR --- */}
//                     {isLoading ? (
//                         <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
//                             Loading Stations and Crowd Data...
//                         </div>
//                     ) : (
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
//                                         className="list-item"
//                                         style={{
//                                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                             padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                             borderRadius: '8px', backgroundColor: 'white'
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

// export default DensityDebugger;
































// import React, { useState, useEffect, useCallback, useRef } from "react"; 
// import api from "../api"; 
// import { FaTrainSubway, FaTriangleExclamation } from "react-icons/fa6"; 

// // Constants
// const defaultLocation = { lat: 1.3521, lng: 103.8198 }; 
// const POLL_INTERVAL = 120000; 

// // --- Utility Functions (Global) ---
// const lineColors = {
//     EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//     NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//     NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//     CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//     DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//     TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
// };
// const getDensityColor = (densityCode) => { const code = String(densityCode)?.toUpperCase(); switch (code) { case "L": return "#22c55e"; case "M": return "#eab308"; case "H": return "#ef4444"; default: return "#64748b"; } };
// const getDensityLabel = (densityCode) => { const upperCode = String(densityCode)?.toUpperCase(); switch (upperCode) { case "L": return "LOW"; case "M": return "MEDIUM"; case "H": return "HIGH"; default: return "UNKNOWN"; } };
// const getDensityRank = (densityCode) => { const upperCode = String(densityCode)?.toUpperCase(); if (upperCode === 'H') return 3; if (upperCode === 'M') return 2; if (upperCode === 'L') return 1; return 0; };
// const getDensityCodeFromRank = (rank) => { if (rank === 3) return 'H'; if (rank === 2) return 'M'; if (rank === 1) return 'L'; return 'U'; };
// const calculateDistance = (lat1, lon1, lat2, lon2) => { const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; };
// const findNearestStations = (allStations, location) => { if (!location || allStations.length === 0) return []; const stationsWithDistance = allStations.map(station => ({ ...station, distance: calculateDistance(location.lat, location.lng, station.latitude, station.longitude), })); stationsWithDistance.sort((a, b) => a.distance - b.distance); return stationsWithDistance.slice(0, 5); };


// function DensityDebugger() {
//     // --- State Variables ---
//     const [stationList, setStationList] = useState([]); // Stations + Crowd info combined
//     const [mrtStations, setMrtStations] = useState([]); // Raw station data
//     const [nearestStations, setNearestStations] = useState([]);
//     const [userLocation, setUserLocation] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [serviceAlerts, setServiceAlerts] = useState(null);

//     const [loadingStations, setLoadingStations] = useState(true);
//     const [loadingCrowd, setLoadingCrowd] = useState(false);
//     const [fetchError, setFetchError] = useState(null);
//     
//     const isFetchingRef = useRef(false); 


//     // --- GEOLOCATION FUNCTION ---
//     const getUserLocation = useCallback(() => {
//         if (!navigator.geolocation) {
//             setFetchError("Geolocation not supported. Using default center point.");
//             setUserLocation(defaultLocation);
//             return;
//         }

//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const location = { lat: position.coords.latitude, lng: position.coords.longitude };
//                 setUserLocation(location);
//                 setFetchError(null);
//             },
//             (error) => {
//                 setFetchError(`Geolocation failed: ${error.message}. Using default center point.`);
//                 setUserLocation(defaultLocation);
//             }
//         );
//     }, []);


//     // 3. Fetch Service Alerts
//     const fetchServiceAlerts = useCallback(async () => {
//         try {
//             const res = await api.get("/api/mrt-service-alerts/");
//             if (res.data.success && res.data.data?.value) {
//                 setServiceAlerts(res.data.data.value);
//             }
//         } catch (err) {
//             console.error("Error fetching MRT alerts:", err);
//         }
//     }, []);


//     // 2. Fetch ALL Crowd Data (Stable function)
//     // FIX: Removed userLocation and mrtStations from dependencies to prevent function recreation
//     const fetchAllCrowdData = useCallback(async (allStations) => {
//         if (isFetchingRef.current || allStations.length === 0) return;

//         isFetchingRef.current = true;
//         setLoadingCrowd(true);
        
//         // Use getCurrent values from state refs instead of function dependencies where possible
//         const currentMrtStations = allStations.length > 0 ? allStations : mrtStations;
//         const currentSearchTerm = searchTerm;
        
//         const crowdDataMap = {};
//         const allLines = Object.keys(lineColors);
//         
//         try {
//             // Fetch data for all lines
//             const crowdFetchPromises = allLines.map(async (lineCode) => {
//                 try {
//                     const res = await api.get(`/api/mrt-crowd/${lineCode}/`);
//                     const crowdArray = res.data.data?.value || res.data || [];
//                     
//                     if (Array.isArray(crowdArray)) {
//                         crowdArray.forEach(crowd => {
//                             const stationCode = crowd.Station;
//                             const crowdLevel = getDensityCodeFromRank(getDensityRank(crowd.CrowdLevel || 'U')); 
//                             if (stationCode) { 
//                                 if (!crowdDataMap[stationCode]) crowdDataMap[stationCode] = [];
//                                 crowdDataMap[stationCode].push({ line: lineCode, crowdLevel });
//                             }
//                         });
//                     }
//                 } catch (error) { console.error(`❌ Error fetching crowd for ${lineCode}:`, error.message); }
//             });

//             await Promise.all(crowdFetchPromises);

//             // Combine station list with crowd data
//             const combinedList = currentMrtStations.map(station => {
//                 const crowdDetails = crowdDataMap[station.code] || [];
//                 const maxRank = crowdDetails.reduce((max, detail) => Math.max(max, getDensityRank(detail.crowdLevel)), 0);
//                 return { ...station, maxCrowdLevel: getDensityCodeFromRank(maxRank) };
//             });
//             
//             // FIX: Only update the nearest stations list if we are NOT actively searching
//             if (!currentSearchTerm) {
//                 const nearest = findNearestStations(combinedList, userLocation || defaultLocation);
//                 setNearestStations(nearest);
//             }
//             
//             setStationList(combinedList); // Update the master list
//             
//         } catch (error) {
//             setFetchError("Failed to fetch crowd data. Please try again.");
//         } finally {
//             setLoadingCrowd(false);
//             isFetchingRef.current = false;
//         }
//     }, [/* Stable: Removed dependencies for stability */]); 


//     const fetchMrtStations = useCallback(async () => {
//         setLoadingStations(true);
//         setFetchError(null);

//         try {
//             const res = await api.get("/api/mrt-stations/");
//             
//             let dataToMap = res.data;
//             if (!Array.isArray(dataToMap) && res.data.data) { dataToMap = res.data.data; }
//             
//             const mappedStations = dataToMap.map(station => ({
//                 name: station.name,
//                 code: station.station_code,
//                 latitude: station.latitude, 
//                 longitude: station.longitude,
//                 lines: station.lines || [], 
//             }));

//             setMrtStations(mappedStations); 
//         } catch (error) {
//             setFetchError(`Failed to fetch station list: ${error.message}. Check console for details.`);
//         } finally {
//             setLoadingStations(false);
//         }
//     }, []);

//     // --- EFFECTS (Define last) ---
//     
//     // EFFECT 1: Initial Setup (Geolocation, Stations, Alerts)
//     useEffect(() => {
//         getUserLocation(); 
//         fetchMrtStations(); 
//         fetchServiceAlerts();
//     }, [fetchMrtStations, getUserLocation, fetchServiceAlerts]);

//     // 2. Crowd Data Fetching and Polling 
//     useEffect(() => {
//         let intervalId;
//         
//         if (mrtStations.length > 0 && userLocation) {
//             // 1. Immediate fetch
//             fetchAllCrowdData(mrtStations);
//             
//             // 2. Setup stable polling loop
//             intervalId = setInterval(() => {
//                 fetchAllCrowdData(mrtStations);
//             }, POLL_INTERVAL); 
//         }

//         return () => clearInterval(intervalId); // CRITICAL: Clears interval on unmount/dependency change
//     }, [mrtStations, userLocation, fetchAllCrowdData]); 


//     // --- Rendering Logic ---
//     const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
//     const isLoading = loadingStations || loadingCrowd;

//     // FIX: Filter the *already processed* stationList (which holds crowd data) for the search
//     const filteredStations = stationList.filter(station =>
//         station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         station.code.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     
//     // Determine which list to display
//     const displayList = searchTerm ? filteredStations : nearestStations;

//     const title = searchTerm 
//         ? `Search Results (${displayList.length})`
//         : `Nearest Stations (${displayList.length})`; 

//     return (
//         <div className="crowd-container">
//             <div className="drawer full-screen" style={drawerStyle}> 
//                 <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
//                         <FaTrainSubway /> Train (Live Debugger)
//                     </div>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
//                     {/* --- SEARCH BAR --- */}
//                     <input 
//                         type="text"
//                         placeholder="Search MRT by name or code (e.g., Jurong East, NS1)"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={{
//                             width: '100%', padding: '10px', margin: '10px 0',
//                             borderRadius: '4px', border: '1px solid #ccc',
//                             boxSizing: 'border-box'
//                         }}
//                     />

//                     {/* --- ERROR DISPLAY --- */}
//                     {fetchError && (
//                         <div style={{ 
//                             backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
//                             borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
//                         }}>
//                             <FaTriangleExclamation style={{ marginRight: '8px' }} />
//                             {fetchError}
//                         </div>
//                     )}

//                     {/* --- SERVICE ALERT STATUS --- */}
//                     {serviceAlerts && serviceAlerts.Status !== 1 && (
//                         <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
//                             ⚠️ Service Alert: {serviceAlerts.Message?.[0]?.Content || "Check LTA for details."}
//                         </div>
//                     )}

//                     {/* --- LOADING INDICATOR --- */}
//                     {isLoading ? (
//                         <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
//                             Loading Stations and Crowd Data...
//                         </div>
//                     ) : (
//                         <div className="station-list-container">
//                             <h2>{title}</h2>
//                             
//                             {displayList.length === 0 ? (
//                                 <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
//                                     {searchTerm 
//                                         ? "No stations match your search term."
//                                         : "Could not find nearest stations. Try searching."
//                                     }
//                                 </p>
//                             ) : (
//                                 displayList.map(station => (
//                                     <div 
//                                         key={station.code} 
//                                         className="list-item"
//                                         onClick={() => { console.log(`Selected station: ${station.code}`); }} 
//                                         style={{
//                                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                             padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                             borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' 
//                                         }}
//                                     >
//                                         <div style={{flexGrow: 1}}>
//                                             <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
//                                                 {station.name} ({station.code})
//                                             </h4>
//                                             <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                                 Lines: {station.lines.map(l => l.line_code).join(" • ")}
//                                                 {station.distance !== undefined && 
//                                                     <span style={{ marginLeft: '10px', fontStyle: 'italic', color: '#4b5563' }}>
//                                                          ({station.distance.toFixed(2)} km away)
//                                                     </span>
//                                                 }
//                                             </p>
//                                         </div>
//                                         <span
//                                             className="crowd-badge"
//                                             style={{ 
//                                                 backgroundColor: getDensityColor(station.maxCrowdLevel),
//                                                 color: 'white',
//                                                 padding: '4px 8px',
//                                                 borderRadius: '9999px',
//                                                 fontSize: '12px',
//                                                 fontWeight: '700'
//                                             }}
//                                         >
//                                             {getDensityLabel(station.maxCrowdLevel)}
//                                         </span>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DensityDebugger;








// import React, { useState, useEffect, useCallback, useRef } from "react"; 
// import api from "../api"; 
// import { FaTrainSubway, FaTriangleExclamation } from "react-icons/fa6"; 

// // Constants
// const defaultLocation = { lat: 1.3521, lng: 103.8198 }; 
// const POLL_INTERVAL = 120000; 

// // --- Utility Functions (Global) ---
// // ... (All utility functions remain the same: getDensityColor, calculateDistance, findNearestStations, etc.) ...
// const lineColors = {
//     EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//     NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//     NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//     CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//     DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//     TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
// };
// const getDensityColor = (densityCode) => { const code = String(densityCode)?.toUpperCase(); switch (code) { case "L": return "#22c55e"; case "M": return "#eab308"; case "H": return "#ef4444"; default: return "#64748b"; } };
// const getDensityLabel = (densityCode) => { const upperCode = String(densityCode)?.toUpperCase(); switch (upperCode) { case "L": return "LOW"; case "M": return "MEDIUM"; case "H": return "HIGH"; default: return "UNKNOWN"; } };
// const getDensityRank = (densityCode) => { const upperCode = String(densityCode)?.toUpperCase(); if (upperCode === 'H') return 3; if (upperCode === 'M') return 2; if (upperCode === 'L') return 1; return 0; };
// const getDensityCodeFromRank = (rank) => { if (rank === 3) return 'H'; if (rank === 2) return 'M'; if (rank === 1) return 'L'; return 'U'; };
// const calculateDistance = (lat1, lon1, lat2, lon2) => { const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; };
// const findNearestStations = (allStations, location) => { if (!location || allStations.length === 0) return []; const stationsWithDistance = allStations.map(station => ({ ...station, distance: calculateDistance(location.lat, location.lng, station.latitude, station.longitude), })); stationsWithDistance.sort((a, b) => a.distance - b.distance); return stationsWithDistance.slice(0, 5); };


// function DensityDebugger() {
//     // --- State Variables ---
//     const [stationList, setStationList] = useState([]); 
//     const [mrtStations, setMrtStations] = useState([]); 
//     const [nearestStations, setNearestStations] = useState([]);
//     const [userLocation, setUserLocation] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [serviceAlerts, setServiceAlerts] = useState(null);

//     const [loadingStations, setLoadingStations] = useState(true);
//     const [loadingCrowd, setLoadingCrowd] = useState(false);
//     const [fetchError, setFetchError] = useState(null);
//     
//     const isFetchingRef = useRef(false); 


//     // --- GEOLOCATION FUNCTION ---
//     const getUserLocation = useCallback(() => {
//         if (!navigator.geolocation) {
//             setFetchError("Geolocation not supported. Using default center point.");
//             setUserLocation(defaultLocation);
//             return;
//         }

//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const location = { lat: position.coords.latitude, lng: position.coords.longitude };
//                 setUserLocation(location);
//                 setFetchError(null);
//             },
//             (error) => {
//                 setFetchError(`Geolocation failed: ${error.message}. Using default center point.`);
//                 setUserLocation(defaultLocation);
//             }
//         );
//     }, []);

//     // --- API Calls (Stable functions) ---

//     const fetchServiceAlerts = useCallback(async () => {
//         // ... (Alert fetching logic remains the same)
//     }, []);

//     // 2. Fetch ALL Crowd Data (Stable function)
//     const fetchAllCrowdData = useCallback(async (allStations) => {
//         if (isFetchingRef.current || allStations.length === 0) return;

//         isFetchingRef.current = true;
//         setLoadingCrowd(true);
//         
//         const crowdDataMap = {};
//         const allLines = Object.keys(lineColors);
//         
//         try {
//             const crowdFetchPromises = allLines.map(async (lineCode) => {
//                 try {
//                     const res = await api.get(`/api/mrt-crowd/${lineCode}/`);
//                     const crowdArray = res.data.data?.value || res.data || [];
//                     
//                     if (Array.isArray(crowdArray)) {
//                         crowdArray.forEach(crowd => {
//                             const stationCode = crowd.Station;
//                             const crowdLevel = getDensityCodeFromRank(getDensityRank(crowd.CrowdLevel || 'U')); 
//                             
//                             if (stationCode) { 
//                                 if (!crowdDataMap[stationCode]) crowdDataMap[stationCode] = [];
//                                 crowdDataMap[stationCode].push({ line: lineCode, crowdLevel });
//                             }
//                         });
//                     }
//                 } catch (error) { console.error(`❌ Error fetching crowd for ${lineCode}:`, error.message); }
//             });

//             await Promise.all(crowdFetchPromises);

//             // Combine station list with crowd data
//             const combinedList = allStations.map(station => {
//                 const crowdDetails = crowdDataMap[station.code] || [];
//                 const maxRank = crowdDetails.reduce((max, detail) => Math.max(max, getDensityRank(detail.crowdLevel)), 0);
//                 return { ...station, maxCrowdLevel: getDensityCodeFromRank(maxRank) };
//             });
//             
//             setStationList(combinedList);

//             // FIX A: Update nearest stations immediately after crowd data is available
//             // This ensures the list has the correct crowd data upon first load.
//             if (userLocation) {
//                 const nearest = findNearestStations(combinedList, userLocation);
//                 setNearestStations(nearest);
//             } else {
//                 setNearestStations(combinedList.slice(0, 5));
//             }
//             
//         } catch (error) {
//             setFetchError("Failed to fetch crowd data. Please try again.");
//         } finally {
//             setLoadingCrowd(false);
//             isFetchingRef.current = false;
//         }
//     }, [userLocation]); // CRITICAL: Now only depends on userLocation

//     const fetchMrtStations = useCallback(async () => {
//         // ... (Station fetching logic remains the same)
//         setLoadingStations(true);
//         setFetchError(null);

//         try {
//             const res = await api.get("/api/mrt-stations/");
//             
//             let dataToMap = res.data;
//             if (!Array.isArray(dataToMap) && res.data.data) { dataToMap = res.data.data; }
//             
//             const mappedStations = dataToMap.map(station => ({
//                 name: station.name,
//                 code: station.station_code,
//                 latitude: station.latitude, 
//                 longitude: station.longitude,
//                 lines: station.lines || [], 
//             }));

//             setMrtStations(mappedStations); 
//         } catch (error) {
//             setFetchError(`Failed to fetch station list: ${error.message}. Check console for details.`);
//         } finally {
//             setLoadingStations(false);
//         }
//     }, []);

//     // --- EFFECTS (Define last) ---
//     
//     // EFFECT 1: Initial Setup (Geolocation, Stations, Alerts)
//     useEffect(() => {
//         getUserLocation(); 
//         fetchMrtStations(); 
//         fetchServiceAlerts();
//     }, [fetchMrtStations, getUserLocation, fetchServiceAlerts]);

//     // 2. Crowd Data Fetching and Polling 
//     useEffect(() => {
//         let intervalId;
//         
//         if (mrtStations.length > 0 && userLocation) {
//             
//             fetchAllCrowdData(mrtStations);
//             
//             intervalId = setInterval(() => {
//                 fetchAllCrowdData(mrtStations);
//             }, POLL_INTERVAL); 
//         }

//         return () => clearInterval(intervalId); 
//     }, [mrtStations, userLocation, fetchAllCrowdData]); 


//     // --- Rendering Logic ---
//     const drawerStyle = { height: `100vh`, backgroundColor: '#f3f4f6', padding: '16px' }; 
//     const isLoading = loadingStations || loadingCrowd;

//     // FIX B: Filter the *already processed* stationList (which holds crowd data) for the search
//     const filteredStations = stationList.filter(station =>
//         station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         station.code.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     
//     // Determine which list to display
//     const displayList = searchTerm ? filteredStations : nearestStations;

//     const title = searchTerm 
//         ? `Search Results (${displayList.length})`
//         : `Nearest Stations (${displayList.length})`; 

//     return (
//         <div className="crowd-container">
//             <div className="drawer full-screen" style={drawerStyle}> 
//                 <div className="transport-tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px 15px', borderBottom: '2px solid #10b981', color: '#10b981' }}>
//                         <FaTrainSubway /> Train (Live Debugger)
//                     </div>
//                 </div>

//                 <div className="content" style={{ padding: '0 16px', overflowY: 'auto' }}>
//                     {/* --- SEARCH BAR --- */}
//                     <input 
//                         type="text"
//                         placeholder="Search MRT by name or code (e.g., Jurong East, NS1)"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={{
//                             width: '100%', padding: '10px', margin: '10px 0',
//                             borderRadius: '4px', border: '1px solid #ccc',
//                             boxSizing: 'border-box'
//                         }}
//                     />

//                     {/* --- ERROR DISPLAY --- */}
//                     {fetchError && (
//                         <div style={{ 
//                             backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', 
//                             borderRadius: '8px', margin: '20px 0', fontWeight: 'bold'
//                         }}>
//                             <FaTriangleExclamation style={{ marginRight: '8px' }} />
//                             {fetchError}
//                         </div>
//                     )}

//                     {/* --- SERVICE ALERT STATUS --- */}
//                     {serviceAlerts && serviceAlerts.Status !== 1 && (
//                         <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
//                             ⚠️ Service Alert: {serviceAlerts.Message?.[0]?.Content || "Check LTA for details."}
//                         </div>
//                     )}

//                     {/* --- LOADING INDICATOR --- */}
//                     {isLoading ? (
//                         <div className="loading-indicator" style={{textAlign: 'center', padding: '20px'}}>
//                             Loading Stations and Crowd Data...
//                         </div>
//                     ) : (
//                         <div className="station-list-container">
//                             <h2>{title}</h2>
//                             
//                             {displayList.length === 0 ? (
//                                 <p style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
//                                     {searchTerm 
//                                         ? "No stations match your search term."
//                                         : "Could not find nearest stations. Try searching."
//                                     }
//                                 </p>
//                             ) : (
//                                 displayList.map(station => (
//                                     <div 
//                                         key={station.code} 
//                                         className="list-item"
//                                         onClick={() => { console.log(`Selected station: ${station.code}`); }} 
//                                         style={{
//                                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                                             padding: '15px', margin: '10px 0', border: '1px solid #e5e7eb',
//                                             borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' 
//                                         }}
//                                     >
//                                         <div style={{flexGrow: 1}}>
//                                             <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
//                                                 {station.name} ({station.code})
//                                             </h4>
//                                             <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                                 Lines: {station.lines.map(l => l.line_code).join(" • ")}
//                                                 {station.distance !== undefined && 
//                                                     <span style={{ marginLeft: '10px', fontStyle: 'italic', color: '#4b5563' }}>
//                                                          ({station.distance.toFixed(2)} km away)
//                                                     </span>
//                                                 }
//                                             </p>
//                                         </div>
//                                         <span
//                                             className="crowd-badge"
//                                             style={{ 
//                                                 backgroundColor: getDensityColor(station.maxCrowdLevel),
//                                                 color: 'white',
//                                                 padding: '4px 8px',
//                                                 borderRadius: '9999px',
//                                                 fontSize: '12px',
//                                                 fontWeight: '700'
//                                             }}
//                                         >
//                                             {getDensityLabel(station.maxCrowdLevel)}
//                                         </span>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DensityDebugger;




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