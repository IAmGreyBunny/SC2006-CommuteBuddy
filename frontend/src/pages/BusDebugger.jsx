// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api";

// const homeLocation = { lat: 1.3491, lng: 103.7494 }; 
// const API_POLL_INTERVAL = 5000; 

// // --- Utility Functions ---

// const getMinutesUntilArrival = (isoTimestamp) => {
//     if (!isoTimestamp) return null;
//     try {
//         const arrivalTime = new Date(isoTimestamp);
//         const currentTime = new Date();
//         const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
//         return Math.max(0, Math.floor(diffSeconds / 60)); 
//     } catch (e) {
//         return null;
//     }
// };

// const getArrivalColor = (time) => time <= 2 ? "red" : time <= 5 ? "orange" : "green";
// const getArrivalLabel = (time) => {
//     if (time === null) return "N/A";
//     if (time === 0) return "Arr"; 
//     if (time === 1) return "1 min";
//     return `${time} min`;
// };


// function BusDebugger() {
//     const [nearbyStops, setNearbyStops] = useState([]);
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [servicesData, setServicesData] = useState(null); 
//     
//     const [loadingStops, setLoadingStops] = useState(true);
//     const [loadingArrivals, setLoadingArrivals] = useState(false);
//     const [error, setError] = useState(null);
//     
//     const [, setVisualTick] = useState(0); 


//     // 1. API: Fetch nearby bus stops (Sets initial selectedStopCode)
//     const fetchNearbyBusStops = useCallback(async () => {
//         setLoadingStops(true);
//         setError(null);
//         try {
//             const res = await api.get(`/api/nearby-bus-stops/?lat=${homeLocation.lat}&lng=${homeLocation.lng}&radius=1000`);

//             if (res.data.success && res.data.stops) {
//                 setNearbyStops(res.data.stops);
//                 if (res.data.stops.length > 0) {
//                     setSelectedStopCode(prevCode => prevCode || res.data.stops[0].bus_stop_code);
//                 }
//             }
//         } catch (err) {
//             setError(`Stops Connection Error: ${err.message}.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);

//     // 2. API: Fetch real-time bus arrivals (slowly polls the API for fresh ISO timestamps)
//     const fetchBusArrivals = useCallback(async (stopCode) => {
//         if (!stopCode) return;
//         if (!servicesData) setLoadingArrivals(true); 
//         setError(null);
//         
//         try {
//             const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
//             
//             if (res.data.success) {
//                 // If LTA fails internally, services might be null or undefined, default to []
//                 setServicesData(res.data.services || []);
//             } else {
//                 setError(`Arrivals API Error for ${stopCode}: ${res.data.error || "Failed to load services"}`);
//             }
//         } catch (err) {
//             setError(`Connection Error fetching arrivals: ${err.message}`);
//         } finally {
//             setLoadingArrivals(false);
//         }
//     }, [servicesData]); 


//     // --- EFFECT: Initial Load of Stops (Runs Once on Mount) ---
//     useEffect(() => {
//         fetchNearbyBusStops();
//     }, [fetchNearbyBusStops]);

//     // --- EFFECT: API Polling (Slow Refresh) & Initial Fetch (CRITICAL FIX) ---
//     useEffect(() => {
//         let apiIntervalId;
//         
//         if (selectedStopCode) {
//             // 1. Immediate fetch when stop code is set/changes
//             fetchBusArrivals(selectedStopCode); 
//             
//             // 2. Setup recurring API polling (5 seconds)
//             apiIntervalId = setInterval(() => {
//                 fetchBusArrivals(selectedStopCode);
//             }, API_POLL_INTERVAL); 

//         }
//         // 🛑 CRITICAL: Cleanup function prevents exponential polling
//         return () => {
//             if (apiIntervalId) clearInterval(apiIntervalId);
//         };
//     }, [selectedStopCode, fetchBusArrivals]);

//     // --- EFFECT: Visual Countdown (Fast Refresh - 1 second) ---
//     useEffect(() => {
//         // Runs every 1 second to update the displayed countdown time
//         const visualIntervalId = setInterval(() => {
//             setVisualTick(prev => prev + 1);
//         }, 1000); 
//         return () => clearInterval(visualIntervalId);
//     }, []);


//     const currentServices = servicesData || [];

//     return (
//         <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
//             <h1>Bus Data Debugger 🚌</h1>
//             <p>Testing APIs: <code>/api/nearby-bus-stops/</code> & <code>/api/bus-arrival-processed/&lt;code&gt;/</code></p>
//             <hr />

//             {/* --- Error Display --- */}
//             {error && (
//                 <div style={{ color: 'white', backgroundColor: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
//                     **ERROR:** {error}
//                 </div>
//             )}

//             {/* --- 1. Nearby Stops Section --- */}
//             <h2>1. Nearby Bus Stops ({nearbyStops.length})</h2>
//             {loadingStops ? (
//                 <p>Loading stops...</p>
//             ) : (
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
//                     {nearbyStops.map((stop) => (
//                         <button
//                             key={stop.bus_stop_code}
//                             onClick={() => setSelectedStopCode(stop.bus_stop_code)}
//                             style={{
//                                 padding: '8px 12px',
//                                 cursor: 'pointer',
//                                 border: `2px solid ${selectedStopCode === stop.bus_stop_code ? 'blue' : '#ccc'}`,
//                                 backgroundColor: selectedStopCode === stop.bus_stop_code ? '#e0f7fa' : 'white',
//                                 borderRadius: '5px',
//                                 fontWeight: selectedStopCode === stop.bus_stop_code ? 'bold' : 'normal',
//                             }}
//                         >
//                             {stop.description} ({stop.bus_stop_code})
//                         </button>
//                     ))}
//                 </div>
//             )}

//             <hr />

//             {/* --- 2. Arrivals Section (Live Countdown) --- */}
//             <h2>2. Bus Arrivals for: {selectedStopCode || 'N/A'}</h2>
//             {loadingArrivals && selectedStopCode && currentServices.length === 0 ? (
//                 <p>Loading real-time arrivals...</p>
//             ) : currentServices.length > 0 ? (
//                 <div>
//                     {currentServices.map((service, index) => (
//                         <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
//                             <h3>Bus {service.service_no} ({service.operator_name})</h3>
//                             <p>To: {service.buses[0]?.destination_code || 'N/A'}</p> 
//                             <div style={{ display: 'flex', gap: '15px' }}>
//                                 {service.buses.map((bus, busIndex) => {
//                                     // Calculate live countdown using the ISO timestamp (re-renders every 1s)
//                                     const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
//                                     
//                                     return (
//                                     <div key={busIndex} style={{ backgroundColor: getArrivalColor(liveTime), color: 'white', padding: '5px', borderRadius: '3px' }}>
//                                         **{getArrivalLabel(liveTime)}**                                         ({bus.load_display.split(' ')[0]})
//                                     </div>
//                                     )})}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p style={{ color: '#666', marginTop: '10px' }}>
//                     **No buses arriving soon** at this stop ({selectedStopCode}). Try another stop or refresh in 20 seconds.
//                 </p>
//             )}
//         </div>
//     );
// }

// export default BusDebugger;










// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api";

// const homeLocation = { lat: 1.3491, lng: 103.7494 }; 
// const API_POLL_INTERVAL = 5000; // Poll API every 5 seconds for new LTA data

// // --- Utility Functions ---

// const getMinutesUntilArrival = (isoTimestamp) => {
//     if (!isoTimestamp) return null;
//     try {
//         const arrivalTime = new Date(isoTimestamp);
//         const currentTime = new Date();
//         const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
//         return Math.max(0, Math.floor(diffSeconds / 60)); 
//     } catch (e) {
//         return null;
//     }
// };

// const getArrivalColor = (time) => time <= 2 ? "red" : time <= 5 ? "orange" : "green";

// const getArrivalLabel = (time) => {
//     if (time === null) return "N/A";
//     if (time === 0) return "Arr"; 
//     if (time === 1) return "1 min";
//     return `${time} min`;
// };


// function BusDebugger() {
//     const [nearbyStops, setNearbyStops] = useState([]);
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [servicesData, setServicesData] = useState(null); 
//     
//     const [loadingStops, setLoadingStops] = useState(true);
//     const [loadingArrivals, setLoadingArrivals] = useState(false);
//     const [error, setError] = useState(null);
//     
//     const [, setVisualTick] = useState(0); 


//     // 1. API: Fetch nearby bus stops (sets the initial selectedStopCode)
//     const fetchNearbyBusStops = useCallback(async () => {
//         setLoadingStops(true);
//         setError(null);
//         try {
//             const url = `/api/nearby-bus-stops/?lat=${homeLocation.lat}&lng=${homeLocation.lng}&radius=1000`;
//             const res = await api.get(url);

//             if (res.data.success && res.data.stops) {
//                 setNearbyStops(res.data.stops);
//                 if (res.data.stops.length > 0) {
//                     setSelectedStopCode(prevCode => prevCode || res.data.stops[0].bus_stop_code);
//                 }
//             } else {
//                 setError(`API Error: ${res.data.error || "Unknown error in stops endpoint"}`);
//             }
//         } catch (err) {
//             setError(`Connection Error: ${err.message}. Check backend.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);

//     // 2. API: Fetch real-time bus arrivals (slowly polls the API for fresh ISO timestamps)
//     // CRITICAL FIX: Empty dependency array ensures stability of this function
//     const fetchBusArrivals = useCallback(async (stopCode) => {
//         if (!stopCode) return;
//         // Optimization: Use the current state of servicesData without it being a dependency
//         setLoadingArrivals(prev => prev || !servicesData); 
//         setError(null);
//         
//         try {
//             const url = `/api/bus-arrival-processed/${stopCode}/`;
//             const res = await api.get(url);
//             
//             if (res.data.success) {
//                 setServicesData(res.data.services || []);
//             } else {
//                 setError(`Arrivals API Error for ${stopCode}: ${res.data.error || "No data returned"}`);
//             }
//         } catch (err) {
//             setError(`Connection Error fetching arrivals: ${err.message}`);
//         } finally {
//             setLoadingArrivals(false);
//         }
//     }, [/* EMPTY ARRAY: Stable function */]); 


//     // --- EFFECT: Initial Load of Stops (Runs Once on Mount) ---
//     useEffect(() => {
//         fetchNearbyBusStops();
//     }, [fetchNearbyBusStops]);

//     // --- EFFECT: API Polling (Slow Refresh) & Initial Fetch ---
//     useEffect(() => {
//         let apiIntervalId;
//         
//         if (selectedStopCode) {
//             // 1. Immediate fetch when stop code is set/changes
//             fetchBusArrivals(selectedStopCode); 
//             
//             // 2. Setup recurring API polling (5 seconds)
//             apiIntervalId = setInterval(() => {
//                 fetchBusArrivals(selectedStopCode);
//             }, API_POLL_INTERVAL); 

//         }
//         // 🛑 CRITICAL: Cleanup function prevents exponential polling
//         return () => {
//             if (apiIntervalId) clearInterval(apiIntervalId);
//         };
//         // Dependencies are correct here: only runs when stop changes or fetchBusArrivals changes (which it won't now)
//     }, [selectedStopCode, fetchBusArrivals]); 

//     // --- EFFECT: Visual Countdown (Fast Refresh - 1 second) ---
//     useEffect(() => {
//         // Runs every 1 second to update the displayed countdown time
//         const visualIntervalId = setInterval(() => {
//             setVisualTick(prev => prev + 1);
//         }, 1000); 
//         return () => clearInterval(visualIntervalId);
//     }, []);


//     const currentServices = servicesData || [];

//     return (
//         <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
//             <h1>Bus Data Debugger 🚌</h1>
//             <p>Testing APIs: <code>/api/nearby-bus-stops/</code> & <code>/api/bus-arrival-processed/&lt;code&gt;/</code></p>
//             <hr />

//             {error && (
//                 <div style={{ color: 'white', backgroundColor: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
//                     **ERROR:** {error}
//                 </div>
//             )}

//             {/* --- 1. Nearby Stops Section --- */}
//             <h2>1. Nearby Bus Stops ({nearbyStops.length})</h2>
//             {loadingStops ? (
//                 <p>Loading stops...</p>
//             ) : (
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
//                     {nearbyStops.map((stop) => (
//                         <button
//                             key={stop.bus_stop_code}
//                             onClick={() => setSelectedStopCode(stop.bus_stop_code)}
//                             style={{
//                                 padding: '8px 12px',
//                                 cursor: 'pointer',
//                                 border: `2px solid ${selectedStopCode === stop.bus_stop_code ? 'blue' : '#ccc'}`,
//                                 backgroundColor: selectedStopCode === stop.bus_stop_code ? '#e0f7fa' : 'white',
//                                 borderRadius: '5px',
//                                 fontWeight: selectedStopCode === stop.bus_stop_code ? 'bold' : 'normal',
//                             }}
//                         >
//                             {stop.description} ({stop.bus_stop_code})
//                         </button>
//                     ))}
//                 </div>
//             )}

//             <hr />

//             {/* --- 2. Arrivals Section (Live Countdown) --- */}
//             <h2>2. Bus Arrivals for: {selectedStopCode || 'N/A'}</h2>
//             {loadingArrivals && currentServices.length === 0 ? (
//                 <p>Loading real-time arrivals...</p>
//             ) : currentServices.length > 0 ? (
//                 <div>
//                     {currentServices.map((service, index) => (
//                         <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
//                             <h3>Bus {service.service_no} ({service.operator_name})</h3>
//                             <p>To: {service.buses[0]?.destination_code || 'N/A'}</p> 
//                             <div style={{ display: 'flex', gap: '15px' }}>
//                                 {service.buses.map((bus, busIndex) => {
//                                     // Calculate live countdown using the ISO timestamp
//                                     const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
//                                     
//                                     return (
//                                     <div key={busIndex} style={{ backgroundColor: getArrivalColor(liveTime), color: 'white', padding: '5px', borderRadius: '3px' }}>
//                                         **{getArrivalLabel(liveTime)}**                                     </div>
//                                     )})}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p style={{ color: '#666', marginTop: '10px' }}>
//                     **No buses arriving soon** at this stop ({selectedStopCode}). Try another stop or refresh in 20 seconds.
//                 </p>
//             )}
//         </div>
//     );
// }

// export default BusDebugger;





































// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api";

// // Default location (e.g., central Singapore) in case geolocation fails
// const defaultLocation = { lat: 1.3521, lng: 103.8198 }; 
// const API_POLL_INTERVAL = 5000; 

// // --- Utility Functions (remain the same) ---
// const getMinutesUntilArrival = (isoTimestamp) => {
//     if (!isoTimestamp) return null;
//     try {
//         const arrivalTime = new Date(isoTimestamp);
//         const currentTime = new Date();
//         const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
//         return Math.max(0, Math.floor(diffSeconds / 60)); 
//     } catch (e) {
//         return null;
//     }
// };

// const getArrivalColor = (time) => time <= 2 ? "red" : time <= 5 ? "orange" : "green";
// const getArrivalLabel = (time) => {
//     if (time === null) return "N/A";
//     if (time === 0) return "Arr"; 
//     if (time === 1) return "1 min";
//     return `${time} min`;
// };


// function BusDebugger() {
//     const [nearbyStops, setNearbyStops] = useState([]);
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [servicesData, setServicesData] = useState(null); 
//     
//     const [loadingStops, setLoadingStops] = useState(true);
//     const [loadingArrivals, setLoadingArrivals] = useState(false);
//     const [error, setError] = useState(null);
//     const [currentLocation, setCurrentLocation] = useState(null); // New state for user's actual location
//     
//     const [, setVisualTick] = useState(0); 


//     // --- GEOLOCATION FUNCTION ---
//     const getUserLocation = useCallback(() => {
//         if (!navigator.geolocation) {
//             setError("Geolocation is not supported by your browser. Using default coordinates.");
//             setCurrentLocation(defaultLocation);
//             return;
//         }

//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const { latitude, longitude } = position.coords;
//                 setCurrentLocation({ lat: latitude, lng: longitude });
//                 setError(null);
//                 console.log("Geolocation successful:", latitude, longitude);
//             },
//             (err) => {
//                 setError(`Geolocation failed: ${err.message}. Using default coordinates.`);
//                 setCurrentLocation(defaultLocation);
//                 console.error("Geolocation Error:", err);
//             },
//             { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
//         );
//     }, []);


//     // 1. API: Fetch nearby bus stops (Uses currentLocation state)
//     const fetchNearbyBusStops = useCallback(async (location) => {
//         if (!location) return; // Wait until location is set
        
//         setLoadingStops(true);
//         setError(null);

//         try {
//             const lat = location.lat;
//             const lng = location.lng;
//             const radius = 1000; 

//             const url = `/api/nearby-bus-stops/?lat=${lat}&lng=${lng}&radius=${radius}`;
//             console.log("Fetching stops using:", lat, lng);

//             const res = await api.get(url);

//             if (res.data.success && res.data.stops) {
//                 setNearbyStops(res.data.stops);
//                 if (res.data.stops.length > 0) {
//                     setSelectedStopCode(prevCode => prevCode || res.data.stops[0].bus_stop_code);
//                 }
//             } else {
//                 setError(`API Error: ${res.data.error || "No stops returned."}`);
//             }
//         } catch (err) {
//             setError(`Connection Error fetching nearby stops: ${err.message}.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);


//     // 2. API: Fetch real-time bus arrivals (polls the API for fresh ISO timestamps)
//     const fetchBusArrivals = useCallback(async (stopCode) => {
//         if (!stopCode) return;
//         if (!servicesData) setLoadingArrivals(true); 
//         setError(null);
//         
//         try {
//             const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
//             
//             if (res.data.success) {
//                 setServicesData(res.data.services || []);
//             } else {
//                 setError(`Arrivals API Error for ${stopCode}: ${res.data.error || "No data returned"}`);
//             }
//         } catch (err) {
//             setError(`Connection Error fetching arrivals: ${err.message}`);
//         } finally {
//             setLoadingArrivals(false);
//         }
//     }, [/* Stable fetch function */]); 


//     // --- EFFECTS ---
    
//     // EFFECT 1: Get user location immediately on mount
//     useEffect(() => {
//         getUserLocation();
//     }, [getUserLocation]);
    
//     // EFFECT 2: Re-fetch nearby stops whenever the location changes
//     useEffect(() => {
//         if (currentLocation) {
//             fetchNearbyBusStops(currentLocation);
//         }
//     }, [currentLocation, fetchNearbyBusStops]);


//     // EFFECT 3: API Polling (Slow Refresh) & Initial Fetch 
//     useEffect(() => {
//         let apiIntervalId;
//         
//         if (selectedStopCode) {
//             // 1. Immediate fetch when stop code is set/changes
//             fetchBusArrivals(selectedStopCode); 
//             
//             // 2. Setup recurring API polling (5 seconds)
//             apiIntervalId = setInterval(() => {
//                 fetchBusArrivals(selectedStopCode);
//             }, API_POLL_INTERVAL); 

//         }
//         // Cleanup function prevents exponential polling
//         return () => {
//             if (apiIntervalId) clearInterval(apiIntervalId);
//         };
//     }, [selectedStopCode, fetchBusArrivals]);

//     // EFFECT 4: Visual Countdown (Fast Refresh - 1 second)
//     useEffect(() => {
//         const visualIntervalId = setInterval(() => {
//             setVisualTick(prev => prev + 1);
//         }, 1000); 
//         return () => clearInterval(visualIntervalId);
//     }, []);


//     const currentServices = servicesData || [];

//     return (
//         <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
//             <h1>Bus Data Debugger 🚌</h1>
//             <p>
//                 Location: {currentLocation ? `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}` : 'Detecting...'}
//             </p>
//             <hr />

//             {/* --- Error Display --- */}
//             {error && (
//                 <div style={{ color: 'white', backgroundColor: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
//                     **ERROR:** {error}
//                 </div>
//             )}

//             {/* --- 1. Nearby Stops Section --- */}
//             <h2>1. Nearby Bus Stops ({nearbyStops.length})</h2>
//             {loadingStops ? (
//                 <p>Loading stops...</p>
//             ) : (
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
//                     {nearbyStops.map((stop) => (
//                         <button
//                             key={stop.bus_stop_code}
//                             onClick={() => setSelectedStopCode(stop.bus_stop_code)}
//                             style={{
//                                 padding: '8px 12px',
//                                 cursor: 'pointer',
//                                 border: `2px solid ${selectedStopCode === stop.bus_stop_code ? 'blue' : '#ccc'}`,
//                                 backgroundColor: selectedStopCode === stop.bus_stop_code ? '#e0f7fa' : 'white',
//                                 borderRadius: '5px',
//                                 fontWeight: selectedStopCode === stop.bus_stop_code ? 'bold' : 'normal',
//                             }}
//                         >
//                             {stop.description} ({stop.bus_stop_code})
//                         </button>
//                     ))}
//                 </div>
//             )}

//             <hr />

//             {/* --- 2. Arrivals Section (Live Countdown) --- */}
//             <h2>2. Bus Arrivals for: {selectedStopCode || 'N/A'}</h2>
//             {loadingArrivals && selectedStopCode && currentServices.length === 0 ? (
//                 <p>Loading real-time arrivals...</p>
//             ) : currentServices.length > 0 ? (
//                 <div>
//                     {currentServices.map((service, index) => (
//                         <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
//                             <h3>Bus {service.service_no} ({service.operator_name})</h3>
//                             <p>To: {service.buses[0]?.destination_code || 'N/A'}</p> 
//                             <div style={{ display: 'flex', gap: '15px' }}>
//                                 {service.buses.map((bus, busIndex) => {
//                                     // Calculate live countdown using the ISO timestamp
//                                     const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
//                                     
//                                     return (
//                                     <div key={busIndex} style={{ backgroundColor: getArrivalColor(liveTime), color: 'white', padding: '5px', borderRadius: '3px' }}>
//                                         **{getArrivalLabel(liveTime)}**                                     </div>
//                                     )})}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p style={{ color: '#666', marginTop: '10px' }}>
//                     **No buses arriving soon** at this stop ({selectedStopCode}). Try another stop or refresh in 20 seconds.
//                 </p>
//             )}
//         </div>
//     );
// }

// export default BusDebugger;
























// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api";

// const homeLocation = { lat: 1.3491, lng: 103.7494 }; // Testing coordinates
// const API_POLL_INTERVAL = 5000; // Poll API every 5 seconds for new LTA data

// // --- Utility Functions ---

// const getMinutesUntilArrival = (isoTimestamp) => {
//     if (!isoTimestamp) return null;
//     try {
//         const arrivalTime = new Date(isoTimestamp);
//         const currentTime = new Date();
//         const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
//         return Math.max(0, Math.floor(diffSeconds / 60)); 
//     } catch (e) {
//         return null;
//     }
// };

// const getArrivalColor = (time) => time <= 2 ? "red" : time <= 5 ? "orange" : "green";

// const getArrivalLabel = (time) => {
//     if (time === null) return "N/A";
//     if (time === 0) return "Arr"; 
//     if (time === 1) return "1 min";
//     return `${time} min`;
// };


// function BusDebugger() {
//     const [nearbyStops, setNearbyStops] = useState([]);
//     // State to hold results from the search input
//     const [searchResults, setSearchResults] = useState([]); 
//     const [searchQuery, setSearchQuery] = useState(''); // New state for search input
    
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [servicesData, setServicesData] = useState(null); 
//     
//     const [loadingStops, setLoadingStops] = useState(true);
//     const [loadingArrivals, setLoadingArrivals] = useState(false);
//     const [error, setError] = useState(null);
//     
//     const [, setVisualTick] = useState(0); 


//     // 1. API: Fetch nearby bus stops (sets the initial selectedStopCode)
//     const fetchNearbyBusStops = useCallback(async () => {
//         setLoadingStops(true);
//         setError(null);
//         try {
//             const url = `/api/nearby-bus-stops/?lat=${homeLocation.lat}&lng=${homeLocation.lng}&radius=1000`;
//             const res = await api.get(url);

//             if (res.data.success && res.data.stops) {
//                 setNearbyStops(res.data.stops);
//                 if (res.data.stops.length > 0) {
//                     setSelectedStopCode(prevCode => prevCode || res.data.stops[0].bus_stop_code);
//                 }
//             } else {
//                 setError(`API Error: ${res.data.error || "Unknown error in stops endpoint"}`);
//             }
//         } catch (err) {
//             setError(`Connection Error: ${err.message}. Check backend.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);

//     // 3. API: Fetch Search Results (New Function)
//     const fetchSearchResults = useCallback(async (query) => {
//         if (!query || query.length < 2) {
//             setSearchResults([]);
//             return;
//         }
//         setLoadingStops(true);
//         try {
//             // Use the comprehensive search endpoint
//             const res = await api.get(`/api/search/bus-stops/?q=${query}`);
            
//             if (res.data.success && res.data.results) {
//                 // Map the search results format to the same format as nearbyStops for consistency
//                 const mappedResults = res.data.results.map(stop => ({
//                     code: stop.bus_stop_code,
//                     name: stop.description || stop.road_name,
//                     distance: 'N/A', // Distance cannot be accurately determined without current location
//                     lat: stop.latitude,
//                     lng: stop.longitude,
//                 }));
//                 setSearchResults(mappedResults);
//             } else {
//                 setSearchResults([]);
//                 setError(`Search Error: ${res.data.error || "No matching results found."}`);
//             }
//         } catch (err) {
//             setError(`Search Connection Error: ${err.message}.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);


//     // 2. API: Fetch real-time bus arrivals (slowly polls the API for fresh ISO timestamps)
//     const fetchBusArrivals = useCallback(async (stopCode) => {
//         if (!stopCode) return;
//         if (!servicesData) setLoadingArrivals(true); 
//         setError(null);
//         
//         try {
//             const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
//             
//             if (res.data.success) {
//                 setServicesData(res.data.services || []);
//             } else {
//                 setError(`Arrivals API Error for ${stopCode}: ${res.data.error || "No data returned"}`);
//             }
//         } catch (err) {
//             setError(`Connection Error fetching arrivals: ${err.message}`);
//         } finally {
//             setLoadingArrivals(false);
//         }
//     }, [servicesData]); 


//     // --- EFFECT: Initial Load of Stops (Runs Once on Mount) ---
//     useEffect(() => {
//         fetchNearbyBusStops();
//     }, [fetchNearbyBusStops]);

//     // --- EFFECT: Trigger Search on Query Change ---
//     useEffect(() => {
//         fetchSearchResults(searchQuery);
//     }, [searchQuery, fetchSearchResults]);


//     // --- EFFECT: API Polling (Slow Refresh) & Initial Fetch (CRITICAL FIX) ---
//     useEffect(() => {
//         let apiIntervalId;
//         
//         if (selectedStopCode) {
//             // 1. Immediate fetch when stop code is set/changes
//             fetchBusArrivals(selectedStopCode); 
//             
//             // 2. Setup recurring API polling (5 seconds)
//             apiIntervalId = setInterval(() => {
//                 fetchBusArrivals(selectedStopCode);
//             }, API_POLL_INTERVAL); 

//         }
//         // Cleanup function prevents exponential polling
//         return () => {
//             if (apiIntervalId) clearInterval(apiIntervalId);
//         };
//     }, [selectedStopCode, fetchBusArrivals]);

//     // --- EFFECT: Visual Countdown (Fast Refresh - 1 second) ---
//     useEffect(() => {
//         const visualIntervalId = setInterval(() => {
//             setVisualTick(prev => prev + 1);
//         }, 1000); 
//         return () => clearInterval(visualIntervalId);
//     }, []);


//     const stopsToDisplay = searchQuery.length > 1 ? searchResults : nearbyStops;
//     const currentServices = servicesData || [];

//     return (
//         <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
//             <h1>Bus Data Debugger 🚌</h1>
//             <p>Testing APIs: <code>/api/nearby-bus-stops/</code> & <code>/api/bus-arrival-processed/&lt;code&gt;/</code></p>
//             <hr />

//             {error && (
//                 <div style={{ color: 'white', backgroundColor: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
//                     **ERROR:** {error}
//                 </div>
//             )}

//             {/* --- 1. Search and Stops Section --- */}
//             <input
//                 type="text"
//                 placeholder="Search by Stop Name, Code, or Bus Number (e.g., 941, Jurong East)"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px' }}
//             />

//             <h2>
//                 {searchQuery.length > 1 ? `Search Results (${stopsToDisplay.length})` : `Nearby Stops (${stopsToDisplay.length})`}
//             </h2>
            
//             {loadingStops && searchQuery.length > 1 ? (
//                 <p>Searching for stops...</p>
//             ) : (
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
//                     {stopsToDisplay.length === 0 && searchQuery.length > 1 ? (
//                         <p>No matching stops found for "{searchQuery}".</p>
//                     ) : (
//                         stopsToDisplay.map((stop) => (
//                             <button
//                                 key={stop.code}
//                                 onClick={() => setSelectedStopCode(stop.code)}
//                                 style={{
//                                     padding: '8px 12px',
//                                     cursor: 'pointer',
//                                     border: `2px solid ${selectedStopCode === stop.code ? 'blue' : '#ccc'}`,
//                                     backgroundColor: selectedStopCode === stop.code ? '#e0f7fa' : 'white',
//                                     borderRadius: '5px',
//                                     fontWeight: selectedStopCode === stop.code ? 'bold' : 'normal',
//                                 }}
//                             >
//                                 {stop.description || stop.name} ({stop.code})
//                             </button>
//                         ))
//                     )}
//                 </div>
//             )}

//             <hr />

//             {/* --- 2. Arrivals Section (Live Countdown) --- */}
//             <h2>2. Bus Arrivals for: {selectedStopCode || 'N/A'}</h2>
//             {loadingArrivals && selectedStopCode && currentServices.length === 0 ? (
//                 <p>Loading real-time arrivals...</p>
//             ) : currentServices.length > 0 ? (
//                 <div>
//                     {currentServices.map((service, index) => (
//                         <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
//                             <h3>Bus {service.service_no} ({service.operator_name})</h3>
//                             <p>To: {service.buses[0]?.destination_code || 'N/A'}</p> 
//                             <div style={{ display: 'flex', gap: '15px' }}>
//                                 {service.buses.map((bus, busIndex) => {
//                                     // Calculate live countdown using the ISO timestamp
//                                     const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
//                                     
//                                     return (
//                                     <div key={busIndex} style={{ backgroundColor: getArrivalColor(liveTime), color: 'white', padding: '5px', borderRadius: '3px' }}>
//                                         **{getArrivalLabel(liveTime)}**                                     </div>
//                                     )})}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p style={{ color: '#666', marginTop: '10px' }}>
//                     **No buses arriving soon** at this stop ({selectedStopCode}). Try another stop or refresh in 20 seconds.
//                 </p>
//             )}
//         </div>
//     );
// }

// export default BusDebugger;





























// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api";

// const homeLocation = { lat: 1.3491, lng: 103.7494 }; // Testing coordinates
// const API_POLL_INTERVAL = 5000; // Poll API every 5 seconds for new LTA data

// // --- Utility Functions ---

// /**
//  * Calculates remaining minutes based on the LTA's ISO timestamp.
//  * This function runs locally every second for a smooth UX countdown.
//  */
// const getMinutesUntilArrival = (isoTimestamp) => {
//     if (!isoTimestamp) return null;
//     try {
//         const arrivalTime = new Date(isoTimestamp);
//         const currentTime = new Date();
//         const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
//         // Use Math.floor/round for stability; LTA typically updates its time roughly every minute or two.
//         return Math.max(0, Math.floor(diffSeconds / 60)); 
//     } catch (e) {
//         return null;
//     }
// };

// const getArrivalColor = (time) => time <= 2 ? "red" : time <= 5 ? "orange" : "green";

// const getArrivalLabel = (time) => {
//     if (time === null) return "N/A";
//     if (time === 0) return "Arr"; 
//     if (time === 1) return "1 min";
//     return `${time} min`;
// };


// function BusDebugger() {
//     const [nearbyStops, setNearbyStops] = useState([]);
//     const [searchResults, setSearchResults] = useState([]); 
//     const [searchQuery, setSearchQuery] = useState(''); 
    
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     // Stores the raw processed services array (with ISO string arrival time)
//     const [servicesData, setServicesData] = useState(null); 
//     
//     const [loadingStops, setLoadingStops] = useState(true);
//     const [loadingArrivals, setLoadingArrivals] = useState(false);
//     const [error, setError] = useState(null);
//     
//     // State to trigger a visual re-render every second (does not fetch API)
//     const [, setVisualTick] = useState(0); 


//     // 1. API: Fetch nearby bus stops (Sets initial selectedStopCode)
//     const fetchNearbyBusStops = useCallback(async () => {
//         setLoadingStops(true);
//         setError(null);
//         try {
//             const url = `/api/nearby-bus-stops/?lat=${homeLocation.lat}&lng=${homeLocation.lng}&radius=1000`;
//             const res = await api.get(url);

//             if (res.data.success && res.data.stops) {
//                 setNearbyStops(res.data.stops);
//                 if (res.data.stops.length > 0) {
//                     setSelectedStopCode(prevCode => prevCode || res.data.stops[0].bus_stop_code);
//                 }
//             } else {
//                 setError(`API Error: ${res.data.error || "Unknown error in stops endpoint"}`);
//             }
//         } catch (err) {
//             setError(`Connection Error: ${err.message}. Check backend.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);

//     // 3. API: Fetch Search Results 
//     const fetchSearchResults = useCallback(async (query) => {
//         if (!query || query.length < 2) {
//             setSearchResults([]);
//             return;
//         }
//         setLoadingStops(true);
//         try {
//             const res = await api.get(`/api/search/bus-stops/?q=${query}`);
            
//             if (res.data.success && res.data.results) {
//                 // Map the search results format to the same format as nearbyStops for consistency
//                 const mappedResults = res.data.results.map(stop => ({
//                     code: stop.bus_stop_code,
//                     name: stop.description || stop.road_name,
//                     distance: 'N/A', // Distance cannot be accurately determined without current location
//                     lat: stop.latitude,
//                     lng: stop.longitude,
//                 }));
//                 setSearchResults(mappedResults);
//             } else {
//                 setSearchResults([]);
//                 setError(`Search Error: ${res.data.error || "No matching results found."}`);
//             }
//         } catch (err) {
//             setError(`Search Connection Error: ${err.message}.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);


//     // 2. API: Fetch real-time bus arrivals (slowly polls the API for fresh ISO timestamps)
//     const fetchBusArrivals = useCallback(async (stopCode) => {
//         if (!stopCode) return;
//         // Only set loading true if we have no data yet
//         if (!servicesData) setLoadingArrivals(true); 
//         setError(null);
//         
//         try {
//             const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
//             
//             if (res.data.success) {
//                 setServicesData(res.data.services || []);
//             } else {
//                 setError(`Arrivals API Error for ${stopCode}: ${res.data.error || "No data returned"}`);
//             }
//         } catch (err) {
//             setError(`Connection Error fetching arrivals: ${err.message}`);
//         } finally {
//             setLoadingArrivals(false);
//         }
//     }, [/* Stable function: remove servicesData dependency */]); 


//     // --- EFFECT: Initial Load of Stops (Runs Once on Mount) ---
//     useEffect(() => {
//         fetchNearbyBusStops();
//     }, [fetchNearbyBusStops]);

//     // --- EFFECT: Trigger Search on Query Change ---
//     useEffect(() => {
//         fetchSearchResults(searchQuery);
//     }, [searchQuery, fetchSearchResults]);

//     // --- EFFECT: API Polling (Slow Refresh) & Initial Fetch (CRITICAL FIX) ---
//     useEffect(() => {
//         let apiIntervalId;
//         
//         if (selectedStopCode) {
//             // 1. Immediate fetch when stop code is set/changes
//             fetchBusArrivals(selectedStopCode); 
//             
//             // 2. Setup recurring API polling (5 seconds)
//             apiIntervalId = setInterval(() => {
//                 fetchBusArrivals(selectedStopCode);
//             }, API_POLL_INTERVAL); 

//         }
//         // Cleanup function prevents exponential polling
//         return () => {
//             if (apiIntervalId) clearInterval(apiIntervalId);
//         };
//     }, [selectedStopCode, fetchBusArrivals]);

//     // --- EFFECT: Visual Countdown (Fast Refresh - 1 second) ---
//     useEffect(() => {
//         // Runs every 1 second to update the displayed countdown time
//         const visualIntervalId = setInterval(() => {
//             setVisualTick(prev => prev + 1);
//         }, 1000); 
//         return () => clearInterval(visualIntervalId);
//     }, []);


//     const stopsToDisplay = searchQuery.length > 1 ? searchResults : nearbyStops;
//     const currentServices = servicesData || [];

//     return (
//         <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
//             <h1>Bus Data Debugger 🚌</h1>
//             <p>Testing APIs: <code>/api/nearby-bus-stops/</code> & <code>/api/bus-arrival-processed/&lt;code&gt;/</code></p>
//             <hr />

//             {error && (
//                 <div style={{ color: 'white', backgroundColor: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
//                     **ERROR:** {error}
//                 </div>
//             )}

//             {/* --- Search Input --- */}
//             <input
//                 type="text"
//                 placeholder="Search by Stop Name, Code, or Bus Number (e.g., 941, Jurong East)"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px' }}
//             />

//             {/* --- 1. Nearby/Search Stops Section --- */}
//             <h2>
//                 {searchQuery.length > 1 ? `Search Results (${stopsToDisplay.length})` : `Nearby Stops (${stopsToDisplay.length})`}
//             </h2>
//             {loadingStops && searchQuery.length > 1 ? (
//                 <p>Searching for stops...</p>
//             ) : (
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
//                     {stopsToDisplay.length === 0 && searchQuery.length > 1 ? (
//                         <p>No matching stops found for "{searchQuery}".</p>
//                     ) : (
//                         stopsToDisplay.map((stop) => (
//                             <button
//                                 key={stop.code}
//                                 onClick={() => {
//                                     // Set the new selected stop code AND clear search results upon click
//                                     setSelectedStopCode(stop.code);
//                                     setSearchQuery(''); 
//                                 }}
//                                 style={{
//                                     padding: '8px 12px',
//                                     cursor: 'pointer',
//                                     border: `2px solid ${selectedStopCode === stop.code ? 'blue' : '#ccc'}`,
//                                     backgroundColor: selectedStopCode === stop.code ? '#e0f7fa' : 'white',
//                                     borderRadius: '5px',
//                                     fontWeight: selectedStopCode === stop.code ? 'bold' : 'normal',
//                                 }}
//                             >
//                                 {stop.description || stop.name} ({stop.code})
//                             </button>
//                         ))
//                     )}
//                 </div>
//             )}

//             <hr />

//             {/* --- 2. Arrivals Section (Live Countdown) --- */}
//             <h2>2. Bus Arrivals for: {selectedStopCode || 'N/A'}</h2>
//             {loadingArrivals && selectedStopCode && currentServices.length === 0 ? (
//                 <p>Loading real-time arrivals...</p>
//             ) : currentServices.length > 0 ? (
//                 <div>
//                     {currentServices.map((service, index) => (
//                         <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
//                             <h3>Bus {service.service_no} ({service.operator_name})</h3>
//                             <p>To: {service.buses[0]?.destination_code || 'N/A'}</p> 
//                             <div style={{ display: 'flex', gap: '15px' }}>
//                                 {service.buses.map((bus, busIndex) => {
//                                     // Calculate live countdown using the ISO timestamp
//                                     const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
//                                     
//                                     return (
//                                     <div key={busIndex} style={{ backgroundColor: getArrivalColor(liveTime), color: 'white', padding: '5px', borderRadius: '3px' }}>
//                                         **{getArrivalLabel(liveTime)}**                                     </div>
//                                     )})}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p style={{ color: '#666', marginTop: '10px' }}>
//                     **No buses arriving soon** at this stop ({selectedStopCode}). Try another stop or refresh in 20 seconds.
//                 </p>
//             )}
//         </div>
//     );
// }

// export default BusDebugger;

























// import React, { useState, useEffect, useCallback } from "react";
// import api from "../api";

// const defaultLocation = { lat: 1.3521, lng: 103.8198 }; // Default location if geolocation fails
// const API_POLL_INTERVAL = 5000; 

// // --- Utility Functions (remain the same) ---
// const getMinutesUntilArrival = (isoTimestamp) => {
//     if (!isoTimestamp) return null;
//     try {
//         const arrivalTime = new Date(isoTimestamp);
//         const currentTime = new Date();
//         const diffSeconds = (arrivalTime.getTime() - currentTime.getTime()) / 1000;
//         return Math.max(0, Math.floor(diffSeconds / 60)); 
//     } catch (e) { return null; }
// };

// const getArrivalColor = (time) => time <= 2 ? "red" : time <= 5 ? "orange" : "green";
// const getArrivalLabel = (time) => {
//     if (time === null) return "N/A";
//     if (time === 0) return "Arr"; 
//     if (time === 1) return "1 min";
//     return `${time} min`;
// };


// function BusDebugger() {
//     const [nearbyStops, setNearbyStops] = useState([]);
//     const [searchResults, setSearchResults] = useState([]); 
//     const [searchQuery, setSearchQuery] = useState(''); 
    
//     const [selectedStopCode, setSelectedStopCode] = useState(null);
//     const [servicesData, setServicesData] = useState(null); 
//     
//     const [loadingStops, setLoadingStops] = useState(true);
//     const [loadingArrivals, setLoadingArrivals] = useState(false);
//     const [error, setError] = useState(null);
//     const [currentLocation, setCurrentLocation] = useState(null); 
//     
//     const [, setVisualTick] = useState(0); 

//     // --- GEOLOCATION FUNCTION ---
//     const getUserLocation = useCallback(() => {
//         if (!navigator.geolocation) {
//             setError("Geolocation is not supported by your browser. Using default coordinates.");
//             setCurrentLocation(defaultLocation);
//             return;
//         }

//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const { latitude, longitude } = position.coords;
//                 setCurrentLocation({ lat: latitude, lng: longitude });
//                 setError(null);
//             },
//             (err) => {
//                 setError(`Geolocation failed: ${err.message}. Using default coordinates.`);
//                 setCurrentLocation(defaultLocation);
//             },
//             { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
//         );
//     }, []);


//     // 1. API: Fetch nearby bus stops (Uses currentLocation)
//     const fetchNearbyBusStops = useCallback(async (location) => {
//         if (!location) return; 
//         setLoadingStops(true);
//         try {
//             const lat = location.lat;
//             const lng = location.lng;
//             const url = `/api/nearby-bus-stops/?lat=${lat}&lng=${lng}&radius=1000`;
//             const res = await api.get(url);

//             if (res.data.success && res.data.stops) {
//                 setNearbyStops(res.data.stops);
//                 if (res.data.stops.length > 0) {
//                     setSelectedStopCode(prevCode => prevCode || res.data.stops[0].bus_stop_code);
//                 }
//             } else { setError(`API Error: ${res.data.error || "No stops returned."}`); }
//         } catch (err) { setError(`Connection Error fetching nearby stops: ${err.message}.`); } 
//         finally { setLoadingStops(false); }
//     }, []);


//     // 3. API: Fetch Search Results (Stable function)
//     const fetchSearchResults = useCallback(async (query) => {
//         if (!query || query.length < 2) {
//             setSearchResults([]);
//             setLoadingStops(false);
//             return;
//         }
//         setLoadingStops(true);
//         try {
//             const res = await api.get(`/api/search/bus-stops/?q=${query}`);
            
//             if (res.data.success && res.data.results) {
//                 // Ensure the result structure is consistent (using 'code' and 'name' for simplicity)
//                 const mappedResults = res.data.results.map(stop => ({
//                     code: stop.bus_stop_code,
//                     name: stop.description || stop.road_name,
//                     ...stop 
//                 }));
//                 setSearchResults(mappedResults);
//             } else {
//                 setSearchResults([]);
//             }
//         } catch (err) {
//             setError(`Search Connection Error: ${err.message}.`);
//         } finally {
//             setLoadingStops(false);
//         }
//     }, []);


//     // 2. API: Fetch real-time bus arrivals (Stable function)
//     const fetchBusArrivals = useCallback(async (stopCode) => {
//         if (!stopCode) return;
//         if (!servicesData) setLoadingArrivals(true); 
//         
//         try {
//             const res = await api.get(`/api/bus-arrival-processed/${stopCode}/`);
//             
//             if (res.data.success) { setServicesData(res.data.services || []); } 
//             else { setError(`Arrivals API Error for ${stopCode}: ${res.data.error || "No data returned"}`); }
//         } catch (err) { setError(`Connection Error fetching arrivals: ${err.message}`); } 
//         finally { setLoadingArrivals(false); }
//     }, []); 


//     // --- EFFECTS ---

//     // EFFECT 1: Get user location immediately on mount
//     useEffect(() => {
//         getUserLocation();
//     }, [getUserLocation]);
    
//     // EFFECT 2: Re-fetch nearby stops whenever the location changes
//     useEffect(() => {
//         if (currentLocation && searchQuery.length < 2) { // Only run if location is set AND no search is active
//             fetchNearbyBusStops(currentLocation);
//         }
//     }, [currentLocation, fetchNearbyBusStops, searchQuery]); 


//     // EFFECT 3: Trigger Search on Query Change
//     useEffect(() => {
//         const delaySearch = setTimeout(() => {
//             fetchSearchResults(searchQuery);
//         }, 300);
        
//         return () => clearTimeout(delaySearch);
//     }, [searchQuery, fetchSearchResults]);

//     // EFFECT 4: API Polling (Slow Refresh) & Initial Fetch 
//     useEffect(() => {
//         let apiIntervalId;
//         
//         if (selectedStopCode) {
//             fetchBusArrivals(selectedStopCode); 
//             apiIntervalId = setInterval(() => {
//                 fetchBusArrivals(selectedStopCode);
//             }, API_POLL_INTERVAL); 

//         }
//         return () => { if (apiIntervalId) clearInterval(apiIntervalId); };
//     }, [selectedStopCode, fetchBusArrivals]);

//     // EFFECT 5: Visual Countdown (Fast Refresh - 1 second)
//     useEffect(() => {
//         const visualIntervalId = setInterval(() => {
//             setVisualTick(prev => prev + 1);
//         }, 1000); 
//         return () => clearInterval(visualIntervalId);
//     }, []);


//     // --- RENDER LOGIC ---
//     // If search query is active, display results. Otherwise, display nearby stops.
//     const stopsToDisplay = searchQuery.length > 1 ? searchResults : nearbyStops;
//     const currentServices = servicesData || [];

//     return (
//         <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
//             <h1>Bus Data Debugger 🚌</h1>
//             <p style={{fontWeight: 'bold', marginBottom: '10px'}}>
//                 Location: {currentLocation ? 
//                     `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}` : 
//                     'Awaiting Geolocation Permission...'}
//             </p>
//             <hr />

//             {error && (<div style={{ color: 'white', backgroundColor: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
//                 **ERROR:** {error}
//             </div>)}

//             {/* --- Search Input --- */}
//             <input
//                 type="text"
//                 placeholder="Search by Stop Name, Code, or Bus Number..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px' }}
//             />

//             {/* --- 1. Nearby/Search Stops Section --- */}
//             <h2>
//                 {searchQuery.length > 1 ? `Search Results (${stopsToDisplay.length})` : `Nearby Stops (${stopsToDisplay.length})`}
//             </h2>
//             {loadingStops && !currentLocation ? (
//                 <p>Loading location and stops...</p>
//             ) : (
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
//                     {stopsToDisplay.length === 0 && (searchQuery.length > 1 || currentLocation) ? (
//                         <p>{searchQuery.length > 1 ? `No matching stops found for "${searchQuery}".` : "No stops found near your location."}</p>
//                     ) : (
//                         stopsToDisplay.map((stop) => (
//                             <button
//                                 key={stop.code}
//                                 onClick={() => {
//                                     // CRITICAL: This allows clicking nearby/search buttons to update arrivals
//                                     setSelectedStopCode(stop.code);
//                                     setSearchQuery(''); // Clears search to show nearby stops again
//                                 }}
//                                 style={{
//                                     padding: '8px 12px',
//                                     cursor: 'pointer',
//                                     border: `2px solid ${selectedStopCode === stop.code ? 'blue' : '#ccc'}`,
//                                     backgroundColor: selectedStopCode === stop.code ? '#e0f7fa' : 'white',
//                                     borderRadius: '5px',
//                                     fontWeight: selectedStopCode === stop.code ? 'bold' : 'normal',
//                                 }}
//                             >
//                                 {stop.description || stop.name} ({stop.code})
//                             </button>
//                         ))
//                     )}
//                 </div>
//             )}

//             <hr />

//             {/* --- 2. Arrivals Section (Live Countdown) --- */}
//             <h2>2. Bus Arrivals for: {selectedStopCode || 'N/A'}</h2>
//             {loadingArrivals && selectedStopCode && currentServices.length === 0 ? (
//                 <p>Loading real-time arrivals...</p>
//             ) : currentServices.length > 0 ? (
//                 <div>
//                     {currentServices.map((service, index) => (
//                         <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
//                             <h3>Bus {service.service_no} ({service.operator_name})</h3>
//                             <p>To: {service.buses[0]?.destination_code || 'N/A'}</p> 
//                             <div style={{ display: 'flex', gap: '15px' }}>
//                                 {service.buses.map((bus, busIndex) => {
//                                     // Calculate live countdown using the ISO timestamp
//                                     const liveTime = getMinutesUntilArrival(bus.estimated_arrival);
//                                     
//                                     return (
//                                     <div key={busIndex} style={{ backgroundColor: getArrivalColor(liveTime), color: 'white', padding: '5px', borderRadius: '3px' }}>
//                                         **{getArrivalLabel(liveTime)}**                                     </div>
//                                     )})}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p style={{ color: '#666', marginTop: '10px' }}>
//                     **No buses arriving soon** at this stop ({selectedStopCode}). Try another stop or refresh in 20 seconds.
//                 </p>
//             )}
//         </div>
//     );
// }

// export default BusDebugger;




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