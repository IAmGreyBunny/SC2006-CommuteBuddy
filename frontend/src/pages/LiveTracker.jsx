import { useState, useEffect, useRef } from "react";
import "./LiveTracker.css";

export default function LiveTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStops, setExpandedStops] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [drawerHeight, setDrawerHeight] = useState(30); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [selectedStop, setSelectedStop] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Home location (650188 - Bukit Batok area)
  const homeLocation = { lat: 1.3491, lng: 103.7494 };

  const busStops = [
    { code: "43011", name: "Bukit Batok Int", distance: "0.2 km", lat: 1.3491, lng: 103.7494, buses: [
        { number: "61", arrivals: [2, 9, 16], type: "Single", destination: "Eunos Int" },
        { number: "77", arrivals: [3, 10, 17], type: "Double", destination: "Mrt Station" },
        { number: "106", arrivals: [4, 12, 20], type: "Single", destination: "Shenton Way" },
        { number: "173", arrivals: [5, 13, 21], type: "Single", destination: "Clementi" },
        { number: "177", arrivals: [6, 14, 22], type: "Double", destination: "Boon Lay" },
        { number: "189", arrivals: [7, 15, 23], type: "Single", destination: "Orchard" },
    ]},
    { code: "43211", name: "Blk 109", distance: "0.5 km", lat: 1.3521, lng: 103.7484, buses: [
        { number: "66", arrivals: [3, 10, 17], type: "Single", destination: "Jurong East" },
        { number: "176", arrivals: [5, 12, 18], type: "Double", destination: "Bukit Batok" },
        { number: "188", arrivals: [2, 9, 15], type: "Single", destination: "Choa Chu Kang" },
    ]},
    { code: "43212", name: "Blk 185", distance: "0.6 km", lat: 1.3471, lng: 103.7514, buses: [
        { number: "66", arrivals: [3, 10, 17], type: "Single", destination: "Jurong East" },
        { number: "176", arrivals: [5, 12, 18], type: "Double", destination: "Bukit Batok" },
        { number: "188", arrivals: [2, 9, 15], type: "Single", destination: "Choa Chu Kang" },
    ]},
    { code: "43213", name: "Blk 102", distance: "0.7 km", lat: 1.3461, lng: 103.7464, buses: [
        { number: "173", arrivals: [2, 9, 16], type: "Single", destination: "Clementi" },
        { number: "187", arrivals: [4, 11, 20], type: "Double", destination: "Boon Lay" },
        { number: "189", arrivals: [5, 12, 18], type: "Single", destination: "Orchard" },
    ]},
    { code: "43421", name: "Bukit Gombak Stadium", distance: "1.2 km", lat: 1.3571, lng: 103.7514, buses: [
        { number: "871", arrivals: [1, 8, 14], type: "Single", destination: "Sembawang" },
        { number: "871A", arrivals: [6, 14, 22], type: "Double", destination: "Express" },
        { number: "945", arrivals: [2, 9, 15], type: "Single", destination: "Ang Mo Kio" },
    ]},
  ];

  // Initialize Google Maps
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      if (window.google) {
        initializeMap();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps loaded');
      initializeMap();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps');
    };
    document.head.appendChild(script);
  }, []);

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: homeLocation,
      zoom: 15,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    // Add home marker
    new window.google.maps.Marker({
      position: homeLocation,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
      title: "Home (650188)",
    });

    // Add bus stop markers
    busStops.forEach((stop) => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="white" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" font-size="20" fill="white">🚌</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
        },
        title: stop.name,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 8px; font-weight: 600; color: #1a1a1a;">${stop.name}</div>`,
      });

      marker.addListener('click', () => {
        markersRef.current.forEach(m => m.infoWindow.close());
        infoWindow.open(map, marker);
        setSelectedStop(stop);
        setDrawerHeight(60);
      });

      markersRef.current.push({ marker, infoWindow });
    });
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    const newHeight = drawerHeight + (diff / window.innerHeight) * 100;
    setDrawerHeight(Math.max(20, Math.min(90, newHeight)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (drawerHeight < 40) {
      setDrawerHeight(30);
    } else if (drawerHeight > 70) {
      setDrawerHeight(85);
    } else {
      setDrawerHeight(60);
    }
  };

  const filteredStops = busStops.filter(stop =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.code.includes(searchTerm) ||
    stop.buses.some(bus => bus.number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (code) => {
    setExpandedStops(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleFavorite = (code, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(code)) {
        newFavorites.delete(code);
      } else {
        newFavorites.add(code);
      }
      return newFavorites;
    });
  };

  const sortedStops = [...filteredStops].sort((a, b) => {
    const aFav = favorites.has(a.code);
    const bFav = favorites.has(b.code);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return parseFloat(a.distance) - parseFloat(b.distance);
  });

  const getArrivalColor = (time) => {
    if (time <= 2) return "#ef4444";
    if (time <= 5) return "#f59e0b";
    return "#3bb59d";
  };

  const getArrivalLabel = (time) => {
    if (time === 0) return "Arr";
    if (time === 1) return "1 min";
    return `${time} min`;
  };

  return (
    <div className="container">
      {/* Google Maps Background */}
      <div ref={mapRef} className="map-container" />

      {/* Draggable Drawer */}
      <div
        className="drawer"
        style={{ height: `${drawerHeight}vh` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="drag-handle">
          <div className="drag-bar" />
        </div>

        {/* Header */}
        <div className="drawer-header">
          <input
            type="text"
            placeholder="Search bus stop name or bus number..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="header-icons">
            <button className="header-icon-btn" title="Nearby stops">📍</button>
            <button className="header-icon-btn" title="History">⏰</button>
          </div>
        </div>

        {/* Transport Label */}
        <div className="transport-label">
          <span className="bus-emoji">🚌</span>
          <span className="transport-text">Public Bus</span>
        </div>

        {/* Content */}
        <div className="content">
          {searchTerm && (
            <div className="search-info">
              Found {sortedStops.length} result{sortedStops.length !== 1 ? 's' : ''}
            </div>
          )}
          
          <div className="stops-list">
            {sortedStops.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p className="empty-state-text">No matching bus stops found</p>
              </div>
            ) : (
              sortedStops.map((stop) => (
                <div key={stop.code} className="stop-card">
                  <div
                    className="stop-header"
                    onClick={() => toggleExpand(stop.code)}
                  >
                    <div className="stop-left">
                      <button
                        className="favorite-btn"
                        onClick={(e) => toggleFavorite(stop.code, e)}
                      >
                        {favorites.has(stop.code) ? "⭐" : "☆"}
                      </button>
                      <div>
                        <div className="stop-name-row">
                          <h3 className="stop-name">{stop.name}</h3>
                          <span className="stop-code">{stop.code}</span>
                        </div>
                        <div className="stop-meta">
                          <span className="stop-distance">📍 {stop.distance}</span>
                          <span className="stop-bus-count">🚌 {stop.buses.length} services</span>
                        </div>
                      </div>
                    </div>
                    <button className="expand-btn">
                      {expandedStops[stop.code] ? "▲" : "▼"}
                    </button>
                  </div>

                  {expandedStops[stop.code] && (
                    <div className="bus-arrivals">
                      {stop.buses.map((bus, i) => (
                        <div key={i} className="bus-row">
                          <div className="bus-info">
                            <div className="bus-number">{bus.number}</div>
                            <div className="bus-destination">→ {bus.destination}</div>
                          </div>
                          <div className="arrival-times">
                            {bus.arrivals.slice(0, 3).map((time, j) => (
                              <div key={j} className="arrival-block">
                                <div 
                                  className="arrival-time"
                                  style={{ backgroundColor: getArrivalColor(time) }}
                                >
                                  {getArrivalLabel(time)}
                                </div>
                                <div className="bus-type-label">
                                  {bus.type === "Double" ? "🚌🚌" : "🚌"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="footer">
        <button className="nav-btn nav-btn-active">
          <span style={{fontSize: '20px'}}>🏠</span>
          <span>Home</span>
        </button>
        <button className="nav-btn">
          <span style={{fontSize: '20px'}}>📍</span>
          <span>Nearby</span>
        </button>
        <button className="nav-btn">
          <span style={{fontSize: '20px'}}>⏰</span>
          <span>History</span>
        </button>
      </footer>
    </div>
  );
}



// import React, { useState, useEffect, useRef } from "react";
// import "./LiveTracker.css";

// export default function LiveTracker() {
//   // ---- Home Location ----
//   const homeLocation = { lat: 1.3491, lng: 103.7494 };

//   // ---- Bus Stop Data ----
//   const busStops = [
//     {
//       code: "43011",
//       name: "Bukit Batok Int",
//       distance: "0.2 km",
//       lat: 1.3491,
//       lng: 103.7494,
//       buses: [
//         { number: "61", arrivals: [2, 9, 16], type: "Single", destination: "Eunos Int" },
//         { number: "77", arrivals: [3, 10, 17], type: "Double", destination: "Mrt Station" },
//         { number: "106", arrivals: [4, 12, 20], type: "Single", destination: "Shenton Way" },
//         { number: "173", arrivals: [5, 13, 21], type: "Single", destination: "Clementi" },
//         { number: "177", arrivals: [6, 14, 22], type: "Double", destination: "Boon Lay" },
//         { number: "189", arrivals: [7, 15, 23], type: "Single", destination: "Orchard" },
//       ],
//     },
//     {
//       code: "43211",
//       name: "Blk 109",
//       distance: "0.5 km",
//       lat: 1.3521,
//       lng: 103.7484,
//       buses: [
//         { number: "66", arrivals: [3, 10, 17], type: "Single", destination: "Jurong East" },
//         { number: "176", arrivals: [5, 12, 18], type: "Double", destination: "Bukit Batok" },
//         { number: "188", arrivals: [2, 9, 15], type: "Single", destination: "Choa Chu Kang" },
//       ],
//     },
//     {
//       code: "43212",
//       name: "Blk 185",
//       distance: "0.6 km",
//       lat: 1.3471,
//       lng: 103.7514,
//       buses: [
//         { number: "66", arrivals: [3, 10, 17], type: "Single", destination: "Jurong East" },
//         { number: "176", arrivals: [5, 12, 18], type: "Double", destination: "Bukit Batok" },
//         { number: "188", arrivals: [2, 9, 15], type: "Single", destination: "Choa Chu Kang" },
//       ],
//     },
//     {
//       code: "43213",
//       name: "Blk 102",
//       distance: "0.7 km",
//       lat: 1.3461,
//       lng: 103.7464,
//       buses: [
//         { number: "173", arrivals: [2, 9, 16], type: "Single", destination: "Clementi" },
//         { number: "187", arrivals: [4, 11, 20], type: "Double", destination: "Boon Lay" },
//         { number: "189", arrivals: [5, 12, 18], type: "Single", destination: "Orchard" },
//       ],
//     },
//     {
//       code: "43421",
//       name: "Bukit Gombak Stadium",
//       distance: "1.2 km",
//       lat: 1.3571,
//       lng: 103.7514,
//       buses: [
//         { number: "871", arrivals: [1, 8, 14], type: "Single", destination: "Sembawang" },
//         { number: "871A", arrivals: [6, 14, 22], type: "Double", destination: "Express" },
//         { number: "945", arrivals: [2, 9, 15], type: "Single", destination: "Ang Mo Kio" },
//       ],
//     },
//   ];

//   // ---- React State ----
//   const [searchTerm, setSearchTerm] = useState("");
//   const [expandedStops, setExpandedStops] = useState({});
//   const [favorites, setFavorites] = useState(new Set());
//   const [drawerHeight, setDrawerHeight] = useState(30);
//   const [isDragging, setIsDragging] = useState(false);
//   const mapRef = useRef(null);
//   const touchStartY = useRef(0);
//   const startHeight = useRef(30);
//   const mapInstance = useRef(null);

//   // ---- Load Google Maps API ----
//   useEffect(() => {
//     const existingScript = document.querySelector("#google-maps-script");
//     if (existingScript) return initMap();

//     const script = document.createElement("script");
//     script.id = "google-maps-script";
//     script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M`;
//     script.async = true;
//     script.onload = initMap;
//     document.body.appendChild(script);
//   }, []);

//   // ---- Initialize Map ----
//   const initMap = () => {
//     if (!window.google || mapInstance.current) return;
//     mapInstance.current = new window.google.maps.Map(mapRef.current, {
//       center: homeLocation,
//       zoom: 15,
//       mapTypeControl: false,
//       streetViewControl: false,
//       fullscreenControl: false,
//     });

//     // Add markers
//     busStops.forEach((stop) => {
//       const marker = new window.google.maps.Marker({
//         position: { lat: stop.lat, lng: stop.lng },
//         map: mapInstance.current,
//         title: stop.name,
//       });

//       const infowindow = new window.google.maps.InfoWindow({
//         content: `<div style="font-weight:600;">${stop.name}</div><div>${stop.code}</div>`,
//       });

//       marker.addListener("click", () => {
//         infowindow.open(mapInstance.current, marker);
//       });
//     });
//   };

//   // ---- Handlers ----
//   const toggleExpand = (code) =>
//     setExpandedStops((prev) => ({ ...prev, [code]: !prev[code] }));

//   const toggleFavorite = (code, e) => {
//     e.stopPropagation();
//     setFavorites((prev) => {
//       const updated = new Set(prev);
//       if (updated.has(code)) updated.delete(code);
//       else updated.add(code);
//       return updated;
//     });
//   };

//   const handleTouchStart = (e) => {
//     touchStartY.current = e.touches[0].clientY;
//     startHeight.current = drawerHeight;
//     setIsDragging(true);
//   };

//   const handleTouchMove = (e) => {
//     if (!isDragging) return;
//     const deltaY = touchStartY.current - e.touches[0].clientY;
//     const newHeight = Math.min(90, Math.max(25, startHeight.current + deltaY / 5));
//     setDrawerHeight(newHeight);
//   };

//   const handleTouchEnd = () => setIsDragging(false);

//   // ---- Filtering ----
//   const filteredStops = busStops.filter((stop) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       stop.name.toLowerCase().includes(term) ||
//       stop.buses.some((bus) => bus.number.includes(term))
//     );
//   });

//   const sortedStops = filteredStops.sort((a, b) =>
//     a.distance.localeCompare(b.distance)
//   );

//   // ---- Arrival Helpers ----
//   const getArrivalColor = (time) => {
//     if (time <= 3) return "#4CAF50"; // green
//     if (time <= 8) return "#FFC107"; // yellow
//     return "#F44336"; // red
//   };

//   const getArrivalLabel = (time) => (time <= 1 ? "Arr" : `${time} min`);

//   // ---- Render ----
//   return (
//     <div className="container">
//       {/* Google Map */}
//       <div ref={mapRef} className="map-container" />

//       {/* Drawer */}
//       <div
//         className="drawer"
//         style={{ height: `${drawerHeight}vh` }}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         {/* Drag Handle */}
//         <div className="drag-handle">
//           <div className="drag-bar" />
//         </div>

//         {/* Header */}
//         <div className="drawer-header">
//           <input
//             type="text"
//             placeholder="Search bus stop name or bus number..."
//             className="search-input"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <div className="header-icons">
//             <button className="header-icon-btn" title="Nearby stops">📍</button>
//             <button className="header-icon-btn" title="History">⏰</button>
//           </div>
//         </div>

//         {/* Transport Label */}
//         <div className="transport-label">
//           <span className="bus-emoji">🚌</span>
//           <span className="transport-text">Public Bus</span>
//         </div>

//         {/* Stops List */}
//         <div className="content">
//           {searchTerm && (
//             <div className="search-info">
//               Found {sortedStops.length} result{sortedStops.length !== 1 ? "s" : ""}
//             </div>
//           )}

//           <div className="stops-list">
//             {sortedStops.length === 0 ? (
//               <div className="empty-state">
//                 <div className="empty-state-icon">🔍</div>
//                 <p className="empty-state-text">No matching bus stops found</p>
//               </div>
//             ) : (
//               sortedStops.map((stop) => (
//                 <div key={stop.code} className="stop-card">
//                   <div className="stop-header" onClick={() => toggleExpand(stop.code)}>
//                     <div className="stop-left">
//                       <button
//                         className="favorite-btn"
//                         onClick={(e) => toggleFavorite(stop.code, e)}
//                       >
//                         {favorites.has(stop.code) ? "⭐" : "☆"}
//                       </button>
//                       <div>
//                         <div className="stop-name-row">
//                           <h3 className="stop-name">{stop.name}</h3>
//                           <span className="stop-code">{stop.code}</span>
//                         </div>
//                         <div className="stop-meta">
//                           <span className="stop-distance">📍 {stop.distance}</span>
//                           <span className="stop-bus-count">🚌 {stop.buses.length} services</span>
//                         </div>
//                       </div>
//                     </div>
//                     <button className="expand-btn">
//                       {expandedStops[stop.code] ? "▲" : "▼"}
//                     </button>
//                   </div>

//                   {expandedStops[stop.code] && (
//                     <div className="bus-arrivals">
//                       {stop.buses.map((bus, i) => (
//                         <div key={i} className="bus-row">
//                           <div className="bus-info">
//                             <div className="bus-number">{bus.number}</div>
//                             <div className="bus-destination">→ {bus.destination}</div>
//                           </div>
//                           <div className="arrival-times">
//                             {bus.arrivals.slice(0, 3).map((time, j) => (
//                               <div key={j} className="arrival-block">
//                                 <div
//                                   className="arrival-time"
//                                   style={{ backgroundColor: getArrivalColor(time) }}
//                                 >
//                                   {getArrivalLabel(time)}
//                                 </div>
//                                 <div className="bus-type-label">
//                                   {bus.type === "Double" ? "🚌🚌" : "🚌"}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="footer">
//         <button className="nav-btn nav-btn-active">
//           <span style={{ fontSize: "20px" }}>🏠</span>
//           <span>Home</span>
//         </button>
//         <button className="nav-btn">
//           <span style={{ fontSize: "20px" }}>📍</span>
//           <span>Nearby</span>
//         </button>
//         <button className="nav-btn">
//           <span style={{ fontSize: "20px" }}>⏰</span>
//           <span>History</span>
//         </button>
//       </footer>
//     </div>
//   );
// }
