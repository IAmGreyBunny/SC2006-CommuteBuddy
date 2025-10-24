import { useState } from "react";
import "./LiveTracker.css";

export default function LiveTracker() {
  const [activeTransport, setActiveTransport] = useState("bus");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStops, setExpandedStops] = useState({});

  // Sample data (Bukit Batok area)
  const busStops = [
    { code: "43011", name: "Bukit Batok Int", distance: "0.2 km", buses: [{ number: "61", arrivals: [2, 9, 16] }, { number: "852", arrivals: [5, 12, 18] }] },
    { code: "43019", name: "Opp Bukit Batok Int", distance: "0.3 km", buses: [{ number: "77", arrivals: [3, 10, 17] }, { number: "941", arrivals: [4, 11, 20] }] },
    { code: "43211", name: "Blk 188", distance: "0.5 km", buses: [{ number: "852", arrivals: [6, 14, 22] }, { number: "990", arrivals: [2, 9, 15] }] },
    { code: "43421", name: "Bukit Gombak Stn Exit A", distance: "1.2 km", buses: [{ number: "945", arrivals: [1, 8, 14] }, { number: "947", arrivals: [7, 15, 25] }] },
  ];

  const busRoutes = {
    "61": [
      { stop: "Bukit Batok Int", code: "43011", arrival: "2 min" },
      { stop: "Blk 188", code: "43211", arrival: "9 min" },
      { stop: "Opp Beauty World", code: "42021", arrival: "16 min" },
    ],
    "852": [
      { stop: "Bukit Batok Int", code: "43011", arrival: "5 min" },
      { stop: "Opp Bukit Batok Int", code: "43019", arrival: "12 min" },
      { stop: "Yishun Int", code: "59009", arrival: "45 min" },
    ],
  };

  const filteredStops = busStops.filter(stop =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.code.includes(searchTerm)
  );

  const matchingRoute = busRoutes[searchTerm.trim()];

  const toggleExpand = (code) => {
    setExpandedStops(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="live-tracker-container">
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

      {/* Transport Toggle */}
      <div className="transport-toggle">
        <button
          className={`transport-btn ${activeTransport === "bus" ? "active" : ""}`}
          onClick={() => setActiveTransport("bus")}
        >
          🚌
          <span>Bus</span>
        </button>
        <button
          className={`transport-btn ${activeTransport === "mrt" ? "active" : ""}`}
          onClick={() => setActiveTransport("mrt")}
        >
          🚆
          <span>MRT</span>
        </button>
        <button
          className={`transport-btn ${activeTransport === "taxi" ? "active" : ""}`}
          onClick={() => setActiveTransport("taxi")}
        >
          🚖
          <span>Taxi</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="tracker-content">
        {matchingRoute ? (
          <div className="bus-route-view">
            <h2 className="route-title">Bus {searchTerm} Route</h2>
            <div className="route-stops">
              {busRoutes[searchTerm].map((r, idx) => (
                <div className="route-stop-card" key={idx}>
                  <div className="route-stop-header">
                    <h3>{r.stop}</h3>
                    <div className="route-stop-code">{r.code}</div>
                  </div>
                  <div className="route-arrival">
                    <span className="arrival-time">{r.arrival}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
                      {stop.buses.map((bus, i) => (
                        <div key={i} className="bus-arrival-row">
                          <div className="bus-number">{bus.number}</div>
                          <div className="arrival-times">
                            {bus.arrivals.map((time, j) => (
                              <div key={j} className="arrival-time-block">
                                <div className="time">{time} min</div>
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
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="footer-nav">
        <button className="nav-btn active">
          🏠
          <span>Home</span>
        </button>
        <button className="nav-btn">
          📍
          <span>Nearby</span>
        </button>
        <button className="nav-btn">
          ⏰
          <span>History</span>
        </button>
      </footer>
    </div>
  );
}
