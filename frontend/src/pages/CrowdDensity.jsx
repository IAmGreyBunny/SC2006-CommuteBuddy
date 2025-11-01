// frontend/src/pages/CrowdDensity.jsx - UPDATED FOR BACKEND INTEGRATION (Removed Map/Drag for clarity/focus)

import React, { useState, useEffect } from "react";
import { getMrtCrowdRealTime } from "../api";
import { useNavigate } from "react-router-dom"; // Use to navigate to other views/lines
import "./CrowdDensity.css"; // Ensure this CSS file is styled correctly

// Helper to determine crowd display based on LTA code ('l', 'm', 'h')
const getCrowdDisplay = (code) => {
    const crowdMap = {
        'l': { text: 'Low Crowd', emoji: '🟢', color: '#22c55e' },
        'm': { text: 'Moderate Crowd', emoji: '🟡', color: '#eab308' },
        'h': { text: 'High Crowd', emoji: '🔴', color: '#ef4444' },
    };
    return crowdMap[code.toLowerCase()] || { text: 'Unknown', emoji: '❓', color: '#64748b' };
};

// Available MRT Lines for buttons
const MRT_LINES = [
    { code: 'NSL', name: 'North-South' }, { code: 'EWL', name: 'East-West' }, 
    { code: 'NEL', name: 'North-East' }, { code: 'CCL', name: 'Circle' },
    { code: 'DTL', name: 'Downtown' }, { code: 'TEL', name: 'TE' },
];


function CrowdDensity() {
    // Initial state is hardcoded to NSL for a default view
    const [selectedLine, setSelectedLine] = useState('NSL'); 
    const [crowdData, setCrowdData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch crowd data based on the selected line
    const fetchCrowdData = async (lineCode) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMrtCrowdRealTime(lineCode);
            setCrowdData(data);
        } catch (e) {
            setError(`Failed to fetch crowd data for ${lineCode}.`);
            console.error(e);
            setCrowdData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchCrowdData(selectedLine);

        // Set up polling for real-time updates (every 5 minutes, same as LTA cache)
        const intervalId = setInterval(() => fetchCrowdData(selectedLine), 300000); 
        
        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [selectedLine]);

    // Simplified Display Structure
    return (
        <div className="crowd-density-page" style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🚇 MRT Crowd Status</h1>
                <p style={{ color: '#666' }}>Real-time crowd levels across all stations.</p>
            </header>

            {/* Line Selection Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {MRT_LINES.map(line => (
                    <button
                        key={line.code}
                        onClick={() => setSelectedLine(line.code)}
                        style={{
                            padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd',
                            backgroundColor: selectedLine === line.code ? '#0095FF' : '#f9f9f9',
                            color: selectedLine === line.code ? 'white' : '#333',
                            fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        {line.name} ({line.code})
                    </button>
                ))}
            </div>

            {/* Data Display */}
            {loading ? (
                <div className="loading">Loading crowd data for {selectedLine}...</div>
            ) : error ? (
                <div className="error-state">❌ {error}</div>
            ) : (
                <div className="crowd-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {crowdData.map((item) => {
                        const display = getCrowdDisplay(item.CrowdLevel);
                        return (
                            <div key={item.Station} style={{ 
                                padding: '16px', borderRadius: '12px', backgroundColor: 'white',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderLeft: `5px solid ${display.color}`
                            }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700' }}>
                                    {item.Station} Station
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                                    {display.emoji}
                                    <span style={{ fontWeight: '600', color: display.color }}>{display.text}</span>
                                </div>
                                <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                                    Current interval: {new Date(item.StartTime).toLocaleTimeString()} - {new Date(item.EndTime).toLocaleTimeString()}
                                </small>
                            </div>
                        );
                    })}
                </div>
            )}
            <footer style={{ textAlign: 'center', marginTop: '30px' }}>
                 <p style={{ fontSize: '12px', color: '#aaa' }}>Data provided by LTA. Refresh rate is typically up to 5 minutes.</p>
            </footer>
        </div>
    );
}

export default CrowdDensity;