import { useState } from "react";
import "./LiveTracker.css";

export default function LiveTracker() {
  const [activeTransport, setActiveTransport] = useState("bus");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStops, setExpandedStops] = useState({});
  const [panelHeight, setPanelHeight] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(30);

  // Updated bus stops with all bus numbers in increasing order
  const busStops = [
    { code: "43011", name: "Bukit Batok Int", distance: "0.2 km", buses: [
        { number: "61", arrivals: [2, 9, 16] },
        { number: "77", arrivals: [3, 10, 17] },
        { number: "106", arrivals: [4, 12, 20] },
        { number: "173", arrivals: [5, 13, 21] },
        { number: "177", arrivals: [6, 14, 22] },
        { number: "189", arrivals: [7, 15, 23] },
        { number: "852", arrivals: [5, 12, 18] },
        { number: "941", arrivals: [4, 11, 20] },
        { number: "945", arrivals: [1, 8, 14] },
        { number: "947", arrivals: [7, 15, 25] },
        { number: "990", arrivals: [2, 9, 15] },
        { number: "991", arrivals: [6, 13, 19] },
    ]},
    { code: "43211", name: "Blk 109", distance: "0.5 km", buses: [
        { number: "66", arrivals: [3, 10, 17] },
        { number: "176", arrivals: [5, 12, 18] },
        { number: "188", arrivals: [2, 9, 15] },
        { number: "188E", arrivals: [6, 13, 19] },
        { number: "868E", arrivals: [4, 11, 20] },
        { number: "870", arrivals: [7, 14, 22] },
        { number: "941", arrivals: [5, 12, 18] },
    ]},
    { code: "43212", name: "Blk 185", distance: "0.6 km", buses: [
        { number: "66", arrivals: [3, 10, 17] },
        { number: "176", arrivals: [5, 12, 18] },
        { number: "188", arrivals: [2, 9, 15] },
        { number: "870", arrivals: [7, 14, 22] },
        { number: "941", arrivals: [5, 12, 18] },
    ]},
    { code: "43213", name: "Blk 102", distance: "0.7 km", buses: [
        { number: "173", arrivals: [2, 9, 16] },
        { number: "187", arrivals: [4, 11, 20] },
        { number: "189", arrivals: [5, 12, 18] },
        { number: "941", arrivals: [3, 10, 17] },
    ]},
    { code: "43421", name: "Bukit Gombak Stadium", distance: "1.2 km", buses: [
        { number: "871", arrivals: [1, 8, 14] },
        { number: "871A", arrivals: [6, 14, 22] },
        { number: "945", arrivals: [2, 9, 15] },
    ]},
  ];

  const filteredStops = busStops.filter(stop =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.code.includes(searchTerm)
  );

  const toggleExpand = (code) => {
    setExpandedStops(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(panelHeight);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;
    const windowHeight = window.innerHeight;
    const newHeight = Math.min(Math.max(((startHeight + (deltaY / windowHeight * 100)), 20), 90));
    setPanelHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(panelHeight);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentY = e.clientY;
    const deltaY = startY - currentY;
    const windowHeight = window.innerHeight;
    const newHeight = Math.min(Math.max(((startHeight + (deltaY / windowHeight * 100)), 20), 90));
    setPanelHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="live-tracker-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <header className="tracker-header">
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
      </header>

      {/* Main Content */}
      <main className="tracker-content" style={{ height: `${panelHeight}vh` }}>
        <div 
          className="drag-handle"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="drag-indicator"></div>
        </div>
        
        {/* Transport Mode Selector */}
        <div className="transport-mode-selector">
          <button className="mode-btn active">
            🚌
            <span>Bus</span>
          </button>
          <button className="mode-btn">
            🚗
            <span>Car</span>
          </button>
          <button className="mode-btn">
            🚆
            <span>Train</span>
          </button>
        </div>

        <div className="bus-stops-list">
          {filteredStops.length === 0 ? (
            <p>No matching bus stops found.</p>
          ) : (
            filteredStops.map((stop) => (
              <div key={stop.code} className="bus-stop-card">
                <div
                  className="bus-stop-header"
                  onClick={() => toggleExpand(stop.code)}
                >
                  <div className="stop-info">
                    <h3>{stop.name}</h3>
                    <p className="stop-distance">{stop.distance}</p>
                  </div>
                  <button className="expand-btn">
                    {expandedStops[stop.code] ? "▲" : "▼"}
                  </button>
                </div>

                {expandedStops[stop.code] && (
                  <div className="bus-arrivals">
                    {stop.buses.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })).map((bus, i) => (
                      <div key={i} className="bus-arrival-row">
                        <div className="bus-number">{bus.number}</div>
                        <div className="arrival-times">
                          {bus.arrivals.map((time, j) => (
                            <div key={j} className="arrival-time-block">
                              <div className="time">
                                {time} min
                              </div>
                              <div className="bus-type">
                                {j === 0 ? "Next" : j === 1 ? "Subsequent" : "Later"}
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
      </main>
    </div>
  );
}

