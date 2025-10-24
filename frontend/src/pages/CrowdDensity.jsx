import React, { useState } from 'react';

const CrowdDensity = () => {
  // MRT Line Data (unchanged)
  const lines = {
    EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
    NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
    NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
    CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
    DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
    TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
  };

  // Station to Line Mapping (unchanged)
  const stationLines = {
    "Jurong East": [lines.NSL, lines.EWL],
    "Outram Park": [lines.EWL, lines.NEL, lines.TEL],
    "Dhoby Ghaut": [lines.NSL, lines.NEL, lines.CCL],
    "City Hall": [lines.NSL, lines.EWL],
    "Raffles Place": [lines.NSL, lines.EWL],
    "Bugis": [lines.EWL, lines.DTL],
    "Paya Lebar": [lines.EWL, lines.CCL],
    "Bishan": [lines.NSL, lines.CCL],
    "Serangoon": [lines.NEL, lines.CCL],
    "Buona Vista": [lines.EWL, lines.CCL],
    "Marina Bay": [lines.NSL, lines.CCL, lines.TEL],
    "Botanic Gardens": [lines.CCL, lines.DTL],
    "Stevens": [lines.DTL, lines.TEL],
    "Caldecott": [lines.CCL, lines.TEL],
    "Promenade": [lines.CCL, lines.DTL],
    "Bayfront": [lines.CCL, lines.DTL],
    "Expo": [lines.EWL, lines.DTL],
    "Tampines": [lines.EWL, lines.DTL],
    "MacPherson": [lines.CCL, lines.DTL],
    "Chinatown": [lines.NEL, lines.DTL],
    "Little India": [lines.NEL, lines.DTL],
    "Newton": [lines.NSL, lines.DTL],
    "Orchard": [lines.NSL, lines.TEL],
    "Woodlands": [lines.NSL, lines.TEL]
  };

  const [selectedStation] = useState({
    name: "Jurong East",
    codes: ["NS1", "EW24"],
    platforms: [
      {
        direction: "Towards Marina Bay / Pasir Ris",
        sections: [
          { position: "front", density: "low", trend: "down" },
          { position: "middle", density: "high", trend: "up" },
          { position: "back", density: "medium", trend: "stable" }
        ]
      },
      {
        direction: "Towards Woodlands / Tuas Link",
        sections: [
          { position: "back", density: "low", trend: "stable" },
          { position: "middle", density: "high", trend: "up" },
          { position: "front", density: "medium", trend: "down" }
        ]
      }
    ]
  });

  // create gradient based on station lines (unchanged)
  const getStationGradient = (stationName) => {
    const stationLineData = stationLines[stationName] || [lines.NSL];
    const colors = stationLineData.map(line => line.color);
    
    if (colors.length === 1) {
      return { background: colors[0] };
    } else if (colors.length === 2) {
      return { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` };
    } else if (colors.length === 3) {
      return { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)` };
    }
    return { background: colors[0] };
  };

  // density visuals (unchanged)
  const getDensityColor = (density) => {
    switch(density) {
      case 'low': return 'linear-gradient(to bottom, #34d399, #22c55e)';
      case 'medium': return 'linear-gradient(to bottom, #facc15, #f97316)';
      case 'high': return 'linear-gradient(to bottom, #ef4444, #e11d48)';
      default: return 'linear-gradient(to bottom, #94a3b8, #64748b)';
    }
  };

  const getDensityShadow = (density) => {
    switch(density) {
      case 'low': return '0 10px 15px -3px rgba(34, 197, 94, 0.45), 0 4px 6px -4px rgba(34, 197, 94, 0.35)';
      case 'medium': return '0 10px 15px -3px rgba(234, 179, 8, 0.45), 0 4px 6px -4px rgba(234, 179, 8, 0.35)';
      case 'high': return '0 10px 15px -3px rgba(239, 68, 68, 0.45), 0 4px 6px -4px rgba(239, 68, 68, 0.35)';
      default: return '0 10px 15px -3px rgba(100, 116, 139, 0.35), 0 4px 6px -4px rgba(100, 116, 139, 0.25)';
    }
  };

  const getPositionLabel = (position) => {
    return position.charAt(0).toUpperCase() + position.slice(1);
  };

  const gradientStyle = getStationGradient(selectedStation.name);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent', padding: '1.5rem', position: 'relative' }}>
      {/* Fullscreen red-green gradient + wave pattern (fixed behind content) */}
      <div className="fullscreen-wave-bg" aria-hidden="true"></div>

      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header with Line Colors */}
        <div 
          style={{
            position: 'relative',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '2rem',
            marginBottom: '2rem',
            overflow: 'hidden',
            ...gradientStyle
          }}
        >
          {/* NOTE: removed the animated overlay that caused blinking */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h1 style={{ 
                  fontSize: '3rem', 
                  fontWeight: 900, 
                  color: 'white', 
                  marginBottom: '0.75rem',
                  textShadow: '0 10px 8px rgb(0 0 0 / 0.04), 0 4px 3px rgb(0 0 0 / 0.1)'
                }}>
                  {selectedStation.name}
                </h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {selectedStation.codes.map(code => (
                    <span key={code} style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(4px)',
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      border: '2px solid rgba(255, 255, 255, 0.5)'
                    }}>
                      {code}
                    </span>
                  ))}
                </div>
              </div>
              <svg style={{ color: 'white' }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>

            {/* Legend (unchanged) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                borderRadius: '1rem',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                  <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#22c55e' }}></div>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Low Crowd</span>
                </div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                borderRadius: '1rem',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                  <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#eab308' }}></div>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Medium Crowd</span>
                </div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                borderRadius: '1rem',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                  <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#ef4444' }}></div>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>High Crowd</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platforms */}
        {selectedStation.platforms.map((platform, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#1e293b' }}>
                Platform {idx + 1}
              </h2>
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{platform.direction}</span>
              </div>
            </div>

            {/* Train Visualization */}
            <div style={{
              position: 'relative',
              background: 'linear-gradient(to bottom, #334155, #1e293b)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Safety Line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '0.5rem',
                backgroundColor: '#facc15'
              }}></div>
              
              {/* Train Body */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(to bottom, #475569, #334155)',
                borderRadius: '0.75rem',
                border: '4px solid #64748b',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}>
                {/* Train Stripe */}
                <div style={{ height: '0.75rem', ...gradientStyle }}></div>
                
                {/* Sections Container */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '1.5rem',
                  padding: '2rem'
                }}>
                  {platform.sections.map((section) => (
                    <div key={section.position} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* Section Visualization */}
                      <div style={{
                        position: 'relative',
                        background: getDensityColor(section.density),
                        borderRadius: '1rem',
                        boxShadow: getDensityShadow(section.density),
                        padding: '2rem',
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {/* Position Label */}
                        <div style={{
                          position: 'absolute',
                          top: '-1rem',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'white',
                          borderRadius: '9999px',
                          padding: '0.25rem 1rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
                        }}>
                          <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '0.875rem' }}>
                            {getPositionLabel(section.position)}
                          </span>
                        </div>
                        
                        {/* Crowd Visualization - REPLACED: no arrows, just tier label */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '8rem',
                          gap: '0.5rem'
                        }}>
                          <div style={{
                            fontWeight: 900,
                            fontSize: '1.25rem',
                            color: '#ffffff',
                            backgroundColor: 'rgba(0,0,0,0.18)',
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px'
                          }}>
                            {section.density.toUpperCase()}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: '0.9rem', fontWeight: 700 }}>
                            {/* optional: show trend text instead of arrows */}
                            {section.trend === 'up' ? 'Increasing' : section.trend === 'down' ? 'Decreasing' : 'Stable'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Train Stripe Bottom */}
                <div style={{ height: '0.75rem', ...gradientStyle }}></div>
              </div>

              {/* Platform Edge */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '0.5rem',
                backgroundColor: '#facc15'
              }}></div>
            </div>

            {/* Note about platform direction */}
            <div style={{
              marginTop: '1rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: 500 }}>
                {idx === 0 ? "← Front of train on the left | Back of train on the right →" : "← Back of train on the left | Front of train on the right →"}
              </p>
            </div>
          </div>
        ))}

        {/* Footer - darkened & more opaque */}
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.92)',
          backdropFilter: 'blur(6px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255,255,255,0.04)'
        }}>
          <p style={{ color: '#e6eef8', fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            🔴 LIVE DATA - Updates every 10 minutes
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
            Check crowd density before boarding for a more comfortable journey! 🚇
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CrowdDensity;
