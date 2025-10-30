import { useState, useEffect, useRef } from "react";
import "./LiveTracker.css";
import { FaTrainSubway } from "react-icons/fa6";
import { FaBus } from "react-icons/fa6";
import { FaCar } from "react-icons/fa";
import Bus from "../assets/bus1.png";
import { NavLink } from "react-router-dom";


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
        { number: "61", arrivals: [2, 9, 16], destination: "Eunos Int" },
        { number: "77", arrivals: [3, 10, 17], destination: "Mrt Station" },
        { number: "106", arrivals: [4, 12, 20], destination: "Shenton Way" },
        { number: "173", arrivals: [5, 13, 21], destination: "Clementi" },
        { number: "177", arrivals: [6, 14, 22], destination: "Boon Lay" },
        { number: "189", arrivals: [7, 15, 23], destination: "Orchard" },
        { number: "852", arrivals: [8, 16, 24], destination: "Yishun" },
        { number: "941", arrivals: [3, 11, 19], destination: "Bt Panjang" },
        { number: "945", arrivals: [4, 12, 20], destination: "Ang Mo Kio" },
        { number: "947", arrivals: [5, 13, 21], destination: "Bt Panjang" },
        { number: "990", arrivals: [6, 14, 22], destination: "Beach Rd" },
        { number: "991", arrivals: [7, 15, 23], destination: "Geylang" },
        { number: "992", arrivals: [8, 16, 24], destination: "Toa Payoh" },
    ]},
    { code: "43211", name: "Blk 109", distance: "0.5 km", lat: 1.3521, lng: 103.7484, buses: [
        { number: "66", arrivals: [3, 10, 17], destination: "Jurong East" },
        { number: "176", arrivals: [5, 12, 18], destination: "Bukit Batok" },
        { number: "188", arrivals: [2, 9, 15], destination: "Choa Chu Kang" },
        { number: "870", arrivals: [4, 11, 18], destination: "Yishun" },
        { number: "941", arrivals: [6, 13, 20], destination: "Bt Panjang" },
    ]},
    { code: "43212", name: "Blk 185", distance: "0.6 km", lat: 1.3471, lng: 103.7514, buses: [
        { number: "66", arrivals: [3, 10, 17], destination: "Jurong East" },
        { number: "176", arrivals: [5, 12, 18], destination: "Bukit Batok" },
        { number: "188", arrivals: [2, 9, 15], destination: "Choa Chu Kang" },
        { number: "870", arrivals: [4, 11, 18], destination: "Yishun" },
        { number: "941", arrivals: [6, 13, 20], destination: "Bt Panjang" },
    ]},
    { code: "43213", name: "Blk 102", distance: "0.7 km", lat: 1.3461, lng: 103.7464, buses: [
        { number: "173", arrivals: [2, 9, 16], destination: "Clementi" },
        { number: "187", arrivals: [4, 11, 20], destination: "Boon Lay" },
        { number: "189", arrivals: [5, 12, 18], destination: "Orchard" },
        { number: "941", arrivals: [3, 10, 17], destination: "Bt Panjang" },
    ]},
    { code: "43421", name: "Bukit Gombak Stadium", distance: "1.2 km", lat: 1.3571, lng: 103.7514, buses: [
        { number: "871", arrivals: [1, 8, 14], destination: "Sembawang" },
        { number: "945", arrivals: [2, 9, 15], destination: "Ang Mo Kio" },
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
          url: Bus,
          scaledSize: new window.google.maps.Size(50, 50),
        },
        title: stop.name,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="font-weight: 600; color: #1a1a1a; padding: 4px 8px; margin: 0; line-height: 1;">${stop.name}</div>`,
        maxWidth: 200,
      });

      marker.addListener('click', () => {
        markersRef.current.forEach(m => m.infoWindow.close());
        infoWindow.open(map, marker);
        setSelectedStop(stop);
        setExpandedStops({ [stop.code]: true });
        setDrawerHeight(60);
        
        // Pan map to center the marker towards the middle/upper area
        const latOffset = -0.003; // Adjust this value to move marker higher or lower
        map.panTo({ lat: stop.lat + latOffset, lng: stop.lng });
        
        // Scroll to the selected stop after a brief delay
        setTimeout(() => {
          const stopElement = document.getElementById(`stop-${stop.code}`);
          if (stopElement) {
            stopElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      });

      markersRef.current.push({ marker, infoWindow });
    });
  };

  // Touch handlers
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
    snapToPosition();
  };

  // Mouse handlers (for desktop)
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
    snapToPosition();
  };

  const snapToPosition = () => {
    if (drawerHeight < 40) {
      setDrawerHeight(30);
    } else if (drawerHeight > 70) {
      setDrawerHeight(85);
    } else {
      setDrawerHeight(60);
    }
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY, drawerHeight]);

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
      >
        {/* Drag Handle */}
        <div 
          className="drag-handle"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
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
        </div>

        {/* Transport Tabs */}
        <div className="transport-tabs">
          <NavLink to={"/NearbyCarparks"} className="transport-tab">
            <span className="tab-icon"><FaCar /></span>
            <span className="tab-label">Car</span>
          </NavLink>
          <NavLink className="transport-tab transport-tab-active">
            <span className="tab-icon"><FaBus /></span>
            <span className="tab-label">Bus</span>
          </NavLink>
          <NavLink to={"/CrowdDensity"} className="transport-tab">
            <span className="tab-icon"><FaTrainSubway/></span>
            <span className="tab-label">Train</span>
          </NavLink>
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
                <div 
                  key={stop.code} 
                  id={`stop-${stop.code}`}
                  className={`stop-card ${selectedStop?.code === stop.code ? 'stop-card-selected' : ''}`}
                >
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
                          <span className="stop-distance">{stop.distance}</span>
                          <span className="stop-bus-count">{stop.buses.length} services</span>
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
    </div>
  );
}

