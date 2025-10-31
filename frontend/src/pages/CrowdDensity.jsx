// // import React, { useState } from 'react';

// // const CrowdDensity = () => {
// //   // MRT Line Data (unchanged)
// //   const lines = {
// //     EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
// //     NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
// //     NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
// //     CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
// //     DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
// //     TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
// //   };

// //   // Station to Line Mapping (unchanged)
// //   const stationLines = {
// //     "Jurong East": [lines.NSL, lines.EWL],
// //     "Outram Park": [lines.EWL, lines.NEL, lines.TEL],
// //     "Dhoby Ghaut": [lines.NSL, lines.NEL, lines.CCL],
// //     "City Hall": [lines.NSL, lines.EWL],
// //     "Raffles Place": [lines.NSL, lines.EWL],
// //     "Bugis": [lines.EWL, lines.DTL],
// //     "Paya Lebar": [lines.EWL, lines.CCL],
// //     "Bishan": [lines.NSL, lines.CCL],
// //     "Serangoon": [lines.NEL, lines.CCL],
// //     "Buona Vista": [lines.EWL, lines.CCL],
// //     "Marina Bay": [lines.NSL, lines.CCL, lines.TEL],
// //     "Botanic Gardens": [lines.CCL, lines.DTL],
// //     "Stevens": [lines.DTL, lines.TEL],
// //     "Caldecott": [lines.CCL, lines.TEL],
// //     "Promenade": [lines.CCL, lines.DTL],
// //     "Bayfront": [lines.CCL, lines.DTL],
// //     "Expo": [lines.EWL, lines.DTL],
// //     "Tampines": [lines.EWL, lines.DTL],
// //     "MacPherson": [lines.CCL, lines.DTL],
// //     "Chinatown": [lines.NEL, lines.DTL],
// //     "Little India": [lines.NEL, lines.DTL],
// //     "Newton": [lines.NSL, lines.DTL],
// //     "Orchard": [lines.NSL, lines.TEL],
// //     "Woodlands": [lines.NSL, lines.TEL]
// //   };

// //   const [selectedStation] = useState({
// //     name: "Jurong East",
// //     codes: ["NS1", "EW24"],
// //     platforms: [
// //       {
// //         direction: "Towards Marina Bay / Pasir Ris",
// //         sections: [
// //           { position: "front", density: "low", trend: "down" },
// //           { position: "middle", density: "high", trend: "up" },
// //           { position: "back", density: "medium", trend: "stable" }
// //         ]
// //       },
// //       {
// //         direction: "Towards Woodlands / Tuas Link",
// //         sections: [
// //           { position: "back", density: "low", trend: "stable" },
// //           { position: "middle", density: "high", trend: "up" },
// //           { position: "front", density: "medium", trend: "down" }
// //         ]
// //       }
// //     ]
// //   });

// //   // create gradient based on station lines (unchanged)
// //   const getStationGradient = (stationName) => {
// //     const stationLineData = stationLines[stationName] || [lines.NSL];
// //     const colors = stationLineData.map(line => line.color);
    
// //     if (colors.length === 1) {
// //       return { background: colors[0] };
// //     } else if (colors.length === 2) {
// //       return { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` };
// //     } else if (colors.length === 3) {
// //       return { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)` };
// //     }
// //     return { background: colors[0] };
// //   };

// //   // density visuals (unchanged)
// //   const getDensityColor = (density) => {
// //     switch(density) {
// //       case 'low': return 'linear-gradient(to bottom, #34d399, #22c55e)';
// //       case 'medium': return 'linear-gradient(to bottom, #facc15, #f97316)';
// //       case 'high': return 'linear-gradient(to bottom, #ef4444, #e11d48)';
// //       default: return 'linear-gradient(to bottom, #94a3b8, #64748b)';
// //     }
// //   };

// //   const getDensityShadow = (density) => {
// //     switch(density) {
// //       case 'low': return '0 10px 15px -3px rgba(34, 197, 94, 0.45), 0 4px 6px -4px rgba(34, 197, 94, 0.35)';
// //       case 'medium': return '0 10px 15px -3px rgba(234, 179, 8, 0.45), 0 4px 6px -4px rgba(234, 179, 8, 0.35)';
// //       case 'high': return '0 10px 15px -3px rgba(239, 68, 68, 0.45), 0 4px 6px -4px rgba(239, 68, 68, 0.35)';
// //       default: return '0 10px 15px -3px rgba(100, 116, 139, 0.35), 0 4px 6px -4px rgba(100, 116, 139, 0.25)';
// //     }
// //   };

// //   const getPositionLabel = (position) => {
// //     return position.charAt(0).toUpperCase() + position.slice(1);
// //   };

// //   const gradientStyle = getStationGradient(selectedStation.name);

// //   return (
// //     <div style={{ minHeight: '100vh', backgroundColor: 'transparent', padding: '1.5rem', position: 'relative' }}>
// //       {/* Fullscreen red-green gradient + wave pattern (fixed behind content) */}
// //       <div className="fullscreen-wave-bg" aria-hidden="true"></div>

// //       <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
// //         {/* Header with Line Colors */}
// //         <div 
// //           style={{
// //             position: 'relative',
// //             borderRadius: '1.5rem',
// //             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
// //             padding: '2rem',
// //             marginBottom: '2rem',
// //             overflow: 'hidden',
// //             ...gradientStyle
// //           }}
// //         >
// //           {/* NOTE: removed the animated overlay that caused blinking */}
// //           <div style={{ position: 'relative', zIndex: 10 }}>
// //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
// //               <div>
// //                 <h1 style={{ 
// //                   fontSize: '3rem', 
// //                   fontWeight: 900, 
// //                   color: 'white', 
// //                   marginBottom: '0.75rem',
// //                   textShadow: '0 10px 8px rgb(0 0 0 / 0.04), 0 4px 3px rgb(0 0 0 / 0.1)'
// //                 }}>
// //                   {selectedStation.name}
// //                 </h1>
// //                 <div style={{ display: 'flex', gap: '0.75rem' }}>
// //                   {selectedStation.codes.map(code => (
// //                     <span key={code} style={{
// //                       padding: '0.5rem 1rem',
// //                       backgroundColor: 'rgba(255, 255, 255, 0.3)',
// //                       backdropFilter: 'blur(4px)',
// //                       color: 'white',
// //                       borderRadius: '9999px',
// //                       fontSize: '1.125rem',
// //                       fontWeight: 700,
// //                       border: '2px solid rgba(255, 255, 255, 0.5)'
// //                     }}>
// //                       {code}
// //                     </span>
// //                   ))}
// //                 </div>
// //               </div>
// //               <svg style={{ color: 'white' }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //                 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
// //                 <circle cx="9" cy="7" r="4"></circle>
// //                 <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
// //                 <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
// //               </svg>
// //             </div>

// //             {/* Legend (unchanged) */}
// //             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
// //               <div style={{
// //                 backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //                 backdropFilter: 'blur(4px)',
// //                 borderRadius: '1rem',
// //                 padding: '1rem',
// //                 border: '1px solid rgba(255, 255, 255, 0.3)'
// //               }}>
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
// //                   <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#22c55e' }}></div>
// //                   <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Low Crowd</span>
// //                 </div>
// //               </div>
// //               <div style={{
// //                 backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //                 backdropFilter: 'blur(4px)',
// //                 borderRadius: '1rem',
// //                 padding: '1rem',
// //                 border: '1px solid rgba(255, 255, 255, 0.3)'
// //               }}>
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
// //                   <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#eab308' }}></div>
// //                   <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Medium Crowd</span>
// //                 </div>
// //               </div>
// //               <div style={{
// //                 backgroundColor: 'rgba(255, 255, 255, 0.2)',
// //                 backdropFilter: 'blur(4px)',
// //                 borderRadius: '1rem',
// //                 padding: '1rem',
// //                 border: '1px solid rgba(255, 255, 255, 0.3)'
// //               }}>
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
// //                   <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#ef4444' }}></div>
// //                   <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>High Crowd</span>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Platforms */}
// //         {selectedStation.platforms.map((platform, idx) => (
// //           <div key={idx} style={{
// //             backgroundColor: 'white',
// //             borderRadius: '1.5rem',
// //             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
// //             padding: '2rem',
// //             marginBottom: '2rem',
// //             border: '1px solid #e2e8f0'
// //           }}>
// //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
// //               <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#1e293b' }}>
// //                 Platform {idx + 1}
// //               </h2>
// //               <div style={{
// //                 padding: '0.5rem 1rem',
// //                 backgroundColor: '#f1f5f9',
// //                 borderRadius: '9999px',
// //                 border: '1px solid #e2e8f0'
// //               }}>
// //                 <span style={{ color: '#1e293b', fontWeight: 600 }}>{platform.direction}</span>
// //               </div>
// //             </div>

// //             {/* Train Visualization */}
// //             <div style={{
// //               position: 'relative',
// //               background: 'linear-gradient(to bottom, #334155, #1e293b)',
// //               borderRadius: '1rem',
// //               padding: '2rem',
// //               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
// //             }}>
// //               {/* Safety Line */}
// //               <div style={{
// //                 position: 'absolute',
// //                 top: 0,
// //                 left: 0,
// //                 width: '100%',
// //                 height: '0.5rem',
// //                 backgroundColor: '#facc15'
// //               }}></div>
              
// //               {/* Train Body */}
// //               <div style={{
// //                 position: 'relative',
// //                 background: 'linear-gradient(to bottom, #475569, #334155)',
// //                 borderRadius: '0.75rem',
// //                 border: '4px solid #64748b',
// //                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
// //                 overflow: 'hidden'
// //               }}>
// //                 {/* Train Stripe */}
// //                 <div style={{ height: '0.75rem', ...gradientStyle }}></div>
                
// //                 {/* Sections Container */}
// //                 <div style={{
// //                   display: 'grid',
// //                   gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
// //                   gap: '1.5rem',
// //                   padding: '2rem'
// //                 }}>
// //                   {platform.sections.map((section) => (
// //                     <div key={section.position} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
// //                       {/* Section Visualization */}
// //                       <div style={{
// //                         position: 'relative',
// //                         background: getDensityColor(section.density),
// //                         borderRadius: '1rem',
// //                         boxShadow: getDensityShadow(section.density),
// //                         padding: '2rem',
// //                         width: '100%',
// //                         cursor: 'pointer',
// //                         transition: 'transform 0.2s ease',
// //                       }}
// //                       onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
// //                       onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
// //                       >
// //                         {/* Position Label */}
// //                         <div style={{
// //                           position: 'absolute',
// //                           top: '-1rem',
// //                           left: '50%',
// //                           transform: 'translateX(-50%)',
// //                           backgroundColor: 'white',
// //                           borderRadius: '9999px',
// //                           padding: '0.25rem 1rem',
// //                           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
// //                         }}>
// //                           <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '0.875rem' }}>
// //                             {getPositionLabel(section.position)}
// //                           </span>
// //                         </div>
                        
// //                         {/* Crowd Visualization - REPLACED: no arrows, just tier label */}
// //                         <div style={{
// //                           display: 'flex',
// //                           flexDirection: 'column',
// //                           alignItems: 'center',
// //                           justifyContent: 'center',
// //                           height: '8rem',
// //                           gap: '0.5rem'
// //                         }}>
// //                           <div style={{
// //                             fontWeight: 900,
// //                             fontSize: '1.25rem',
// //                             color: '#ffffff',
// //                             backgroundColor: 'rgba(0,0,0,0.18)',
// //                             padding: '0.5rem 1rem',
// //                             borderRadius: '9999px'
// //                           }}>
// //                             {section.density.toUpperCase()}
// //                           </div>
// //                           <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: '0.9rem', fontWeight: 700 }}>
// //                             {/* optional: show trend text instead of arrows */}
// //                             {section.trend === 'up' ? 'Increasing' : section.trend === 'down' ? 'Decreasing' : 'Stable'}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>

// //                 {/* Train Stripe Bottom */}
// //                 <div style={{ height: '0.75rem', ...gradientStyle }}></div>
// //               </div>

// //               {/* Platform Edge */}
// //               <div style={{
// //                 position: 'absolute',
// //                 bottom: 0,
// //                 left: 0,
// //                 width: '100%',
// //                 height: '0.5rem',
// //                 backgroundColor: '#facc15'
// //               }}></div>
// //             </div>

// //             {/* Note about platform direction */}
// //             <div style={{
// //               marginTop: '1rem',
// //               backgroundColor: '#f1f5f9',
// //               borderRadius: '0.75rem',
// //               padding: '0.75rem',
// //               textAlign: 'center',
// //               border: '1px solid #e2e8f0'
// //             }}>
// //               <p style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: 500 }}>
// //                 {idx === 0 ? "← Front of train on the left | Back of train on the right →" : "← Back of train on the left | Front of train on the right →"}
// //               </p>
// //             </div>
// //           </div>
// //         ))}

// //         {/* Footer - darkened & more opaque */}
// //         <div style={{
// //           backgroundColor: 'rgba(17, 24, 39, 0.92)',
// //           backdropFilter: 'blur(6px)',
// //           borderRadius: '1rem',
// //           padding: '1.5rem',
// //           textAlign: 'center',
// //           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
// //           border: '1px solid rgba(255,255,255,0.04)'
// //         }}>
// //           <p style={{ color: '#e6eef8', fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
// //             🔴 LIVE DATA - Updates every 10 minutes
// //           </p>
// //           <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
// //             Check crowd density before boarding for a more comfortable journey! 🚇
// //           </p>
// //         </div>
// //       </div>
      
// //       <style>{`
// //         @keyframes pulse {
// //           0%, 100% { opacity: 1; }
// //           50% { opacity: 0.5; }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default CrowdDensity;


// import React, { useState, useEffect, useRef } from 'react';

// const CrowdDensity = () => {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markersRef = useRef([]);
//   const [showStationDetails, setShowStationDetails] = useState(false);

//   // MRT Line Data
//   const lines = {
//     EWL: { code: "EWL", name: "East-West Line", color: "#009645" },
//     NSL: { code: "NSL", name: "North-South Line", color: "#D42E12" },
//     NEL: { code: "NEL", name: "North-East Line", color: "#9900AA" },
//     CCL: { code: "CCL", name: "Circle Line", color: "#FA9E0D" },
//     DTL: { code: "DTL", name: "Downtown Line", color: "#005EC4" },
//     TEL: { code: "TEL", name: "Thomson-East Coast Line", color: "#9D5B25" }
//   };

//   // Station to Line Mapping
//   const stationLines = {
//     "Jurong East": [lines.NSL, lines.EWL],
//     "Outram Park": [lines.EWL, lines.NEL, lines.TEL],
//     "Dhoby Ghaut": [lines.NSL, lines.NEL, lines.CCL],
//     "City Hall": [lines.NSL, lines.EWL],
//     "Raffles Place": [lines.NSL, lines.EWL],
//     "Bugis": [lines.EWL, lines.DTL],
//     "Paya Lebar": [lines.EWL, lines.CCL],
//     "Bishan": [lines.NSL, lines.CCL],
//     "Serangoon": [lines.NEL, lines.CCL],
//     "Buona Vista": [lines.EWL, lines.CCL],
//     "Marina Bay": [lines.NSL, lines.CCL, lines.TEL],
//     "Botanic Gardens": [lines.CCL, lines.DTL],
//     "Stevens": [lines.DTL, lines.TEL],
//     "Caldecott": [lines.CCL, lines.TEL],
//     "Promenade": [lines.CCL, lines.DTL],
//     "Bayfront": [lines.CCL, lines.DTL],
//     "Expo": [lines.EWL, lines.DTL],
//     "Tampines": [lines.EWL, lines.DTL],
//     "MacPherson": [lines.CCL, lines.DTL],
//     "Chinatown": [lines.NEL, lines.DTL],
//     "Little India": [lines.NEL, lines.DTL],
//     "Newton": [lines.NSL, lines.DTL],
//     "Orchard": [lines.NSL, lines.TEL],
//     "Woodlands": [lines.NSL, lines.TEL]
//   };

//   // MRT Stations with coordinates and crowd data
//   const mrtStations = [
//     {
//       name: "Jurong East",
//       codes: ["NS1", "EW24"],
//       lat: 1.3330,
//       lng: 103.7420,
//       platforms: [
//         {
//           direction: "Towards Marina Bay / Pasir Ris",
//           sections: [
//             { position: "front", density: "low", trend: "down" },
//             { position: "middle", density: "high", trend: "up" },
//             { position: "back", density: "medium", trend: "stable" }
//           ]
//         },
//         {
//           direction: "Towards Woodlands / Tuas Link",
//           sections: [
//             { position: "back", density: "low", trend: "stable" },
//             { position: "middle", density: "high", trend: "up" },
//             { position: "front", density: "medium", trend: "down" }
//           ]
//         }
//       ]
//     },
//     {
//       name: "Orchard",
//       codes: ["NS22", "TE14"],
//       lat: 1.3040,
//       lng: 103.8320,
//       platforms: [
//         {
//           direction: "Towards Marina Bay",
//           sections: [
//             { position: "front", density: "high", trend: "up" },
//             { position: "middle", density: "medium", trend: "stable" },
//             { position: "back", density: "low", trend: "down" }
//           ]
//         },
//         {
//           direction: "Towards Woodlands",
//           sections: [
//             { position: "front", density: "medium", trend: "stable" },
//             { position: "middle", density: "high", trend: "up" },
//             { position: "back", density: "low", trend: "down" }
//           ]
//         }
//       ]
//     },
//     {
//       name: "Raffles Place",
//       codes: ["NS26", "EW14"],
//       lat: 1.2840,
//       lng: 103.8510,
//       platforms: [
//         {
//           direction: "Towards Marina Bay / Pasir Ris",
//           sections: [
//             { position: "front", density: "high", trend: "up" },
//             { position: "middle", density: "high", trend: "stable" },
//             { position: "back", density: "medium", trend: "stable" }
//           ]
//         },
//         {
//           direction: "Towards Jurong East / Tuas",
//           sections: [
//             { position: "front", density: "medium", trend: "down" },
//             { position: "middle", density: "high", trend: "up" },
//             { position: "back", density: "high", trend: "stable" }
//           ]
//         }
//       ]
//     },
//     {
//       name: "Bishan",
//       codes: ["NS17", "CC15"],
//       lat: 1.3510,
//       lng: 103.8480,
//       platforms: [
//         {
//           direction: "Towards Marina Bay",
//           sections: [
//             { position: "front", density: "medium", trend: "stable" },
//             { position: "middle", density: "low", trend: "down" },
//             { position: "back", density: "medium", trend: "up" }
//           ]
//         },
//         {
//           direction: "Towards Woodlands",
//           sections: [
//             { position: "front", density: "low", trend: "stable" },
//             { position: "middle", density: "medium", trend: "stable" },
//             { position: "back", density: "low", trend: "down" }
//           ]
//         }
//       ]
//     },
//     {
//       name: "Dhoby Ghaut",
//       codes: ["NS24", "NE6", "CC1"],
//       lat: 1.2990,
//       lng: 103.8460,
//       platforms: [
//         {
//           direction: "Towards Marina Bay",
//           sections: [
//             { position: "front", density: "high", trend: "up" },
//             { position: "middle", density: "high", trend: "stable" },
//             { position: "back", density: "medium", trend: "stable" }
//           ]
//         },
//         {
//           direction: "Towards Woodlands",
//           sections: [
//             { position: "front", density: "medium", trend: "down" },
//             { position: "middle", density: "high", trend: "stable" },
//             { position: "back", density: "high", trend: "up" }
//           ]
//         }
//       ]
//     },
//     {
//       name: "Bugis",
//       codes: ["EW12", "DT14"],
//       lat: 1.3000,
//       lng: 103.8560,
//       platforms: [
//         {
//           direction: "Towards Pasir Ris",
//           sections: [
//             { position: "front", density: "high", trend: "up" },
//             { position: "middle", density: "medium", trend: "stable" },
//             { position: "back", density: "medium", trend: "down" }
//           ]
//         },
//         {
//           direction: "Towards Tuas Link",
//           sections: [
//             { position: "front", density: "medium", trend: "stable" },
//             { position: "middle", density: "high", trend: "up" },
//             { position: "back", density: "high", trend: "stable" }
//           ]
//         }
//       ]
//     }
//   ];

//   const [selectedStation, setSelectedStation] = useState(mrtStations[0]);

//   // Initialize Google Maps
//   useEffect(() => {
//     if (document.querySelector('script[src*="maps.googleapis.com"]')) {
//       if (window.google) {
//         initializeMap();
//       }
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M`;
//     script.async = true;
//     script.defer = true;
//     script.onload = initializeMap;
//     script.onerror = () => console.error('Failed to load Google Maps');
//     document.head.appendChild(script);
//   }, []);

//   const initializeMap = () => {
//     if (!window.google || !mapRef.current) return;

//     const map = new window.google.maps.Map(mapRef.current, {
//       center: { lat: 1.3521, lng: 103.8198 },
//       zoom: 12,
//       disableDefaultUI: false,
//       zoomControl: true,
//       mapTypeControl: false,
//       streetViewControl: false,
//       fullscreenControl: false,
//       styles: [
//         {
//           featureType: "poi",
//           elementType: "labels",
//           stylers: [{ visibility: "off" }]
//         }
//       ]
//     });

//     mapInstanceRef.current = map;

//     // Add MRT station markers
//     mrtStations.forEach((station) => {
//       const stationLineData = stationLines[station.name] || [lines.NSL];
//       const primaryColor = stationLineData[0].color;
      
//       const marker = new window.google.maps.Marker({
//         position: { lat: station.lat, lng: station.lng },
//         map: map,
//         icon: {
//           url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
//             <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
//               <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 30 15 30s15-21.716 15-30c0-8.284-6.716-15-15-15z" 
//                     fill="${primaryColor}" stroke="white" stroke-width="2"/>
//               <circle cx="20" cy="15" r="8" fill="white"/>
//               <text x="20" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="${primaryColor}">M</text>
//             </svg>
//           `),
//           scaledSize: new window.google.maps.Size(40, 50),
//           anchor: new window.google.maps.Point(20, 50)
//         },
//         title: station.name,
//       });

//       marker.addListener('click', () => {
//         // Close all info windows
//         markersRef.current.forEach(m => {
//           if (m.infoWindow) m.infoWindow.close();
//         });
        
//         setSelectedStation(station);
//         setShowStationDetails(true);
        
//         // Pan to station
//         map.panTo({ lat: station.lat, lng: station.lng });
        
//         // Show info window
//         const infoWindow = new window.google.maps.InfoWindow({
//           content: `<div style="padding: 8px; font-weight: 600; color: #1a1a1a;">${station.name}</div>`,
//         });
//         infoWindow.open(map, marker);
        
//         markersRef.current.forEach(m => {
//           if (m.station.name === station.name) {
//             m.infoWindow = infoWindow;
//           }
//         });
//       });

//       markersRef.current.push({ marker, station, infoWindow: null });
//     });
//   };

//   const getStationGradient = (stationName) => {
//     const stationLineData = stationLines[stationName] || [lines.NSL];
//     const colors = stationLineData.map(line => line.color);
    
//     if (colors.length === 1) {
//       return { background: colors[0] };
//     } else if (colors.length === 2) {
//       return { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` };
//     } else if (colors.length === 3) {
//       return { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)` };
//     }
//     return { background: colors[0] };
//   };

//   const getDensityColor = (density) => {
//     switch(density) {
//       case 'low': return 'linear-gradient(to bottom, #34d399, #22c55e)';
//       case 'medium': return 'linear-gradient(to bottom, #facc15, #f97316)';
//       case 'high': return 'linear-gradient(to bottom, #ef4444, #e11d48)';
//       default: return 'linear-gradient(to bottom, #94a3b8, #64748b)';
//     }
//   };

//   const getDensityShadow = (density) => {
//     switch(density) {
//       case 'low': return '0 10px 15px -3px rgba(34, 197, 94, 0.45), 0 4px 6px -4px rgba(34, 197, 94, 0.35)';
//       case 'medium': return '0 10px 15px -3px rgba(234, 179, 8, 0.45), 0 4px 6px -4px rgba(234, 179, 8, 0.35)';
//       case 'high': return '0 10px 15px -3px rgba(239, 68, 68, 0.45), 0 4px 6px -4px rgba(239, 68, 68, 0.35)';
//       default: return '0 10px 15px -3px rgba(100, 116, 139, 0.35), 0 4px 6px -4px rgba(100, 116, 139, 0.25)';
//     }
//   };

//   const getPositionLabel = (position) => {
//     return position.charAt(0).toUpperCase() + position.slice(1);
//   };

//   const gradientStyle = getStationGradient(selectedStation.name);

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative' }}>
//       {/* Google Maps */}
//       <div ref={mapRef} style={{ 
//         width: '100%', 
//         height: showStationDetails ? '40vh' : '100vh',
//         transition: 'height 0.3s ease'
//       }} />

//       {/* Station Details Overlay */}
//       {showStationDetails && (
//         <div style={{ 
//           position: 'relative',
//           minHeight: '60vh',
//           backgroundColor: '#f8fafc',
//           padding: '1.5rem'
//         }}>
//           <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
//             {/* Close Button */}
//             <button
//               onClick={() => setShowStationDetails(false)}
//               style={{
//                 position: 'absolute',
//                 top: '1rem',
//                 right: '1rem',
//                 width: '2.5rem',
//                 height: '2.5rem',
//                 borderRadius: '50%',
//                 border: 'none',
//                 backgroundColor: 'white',
//                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '1.5rem',
//                 color: '#64748b',
//                 zIndex: 100
//               }}
//             >
//               ×
//             </button>

//             {/* Header with Line Colors */}
//             <div 
//               style={{
//                 position: 'relative',
//                 borderRadius: '1.5rem',
//                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
//                 padding: '2rem',
//                 marginBottom: '2rem',
//                 overflow: 'hidden',
//                 ...gradientStyle
//               }}
//             >
//               <div style={{ position: 'relative', zIndex: 10 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
//                   <div>
//                     <h1 style={{ 
//                       fontSize: '3rem', 
//                       fontWeight: 900, 
//                       color: 'white', 
//                       marginBottom: '0.75rem',
//                       textShadow: '0 10px 8px rgb(0 0 0 / 0.04), 0 4px 3px rgb(0 0 0 / 0.1)'
//                     }}>
//                       {selectedStation.name}
//                     </h1>
//                     <div style={{ display: 'flex', gap: '0.75rem' }}>
//                       {selectedStation.codes.map(code => (
//                         <span key={code} style={{
//                           padding: '0.5rem 1rem',
//                           backgroundColor: 'rgba(255, 255, 255, 0.3)',
//                           backdropFilter: 'blur(4px)',
//                           color: 'white',
//                           borderRadius: '9999px',
//                           fontSize: '1.125rem',
//                           fontWeight: 700,
//                           border: '2px solid rgba(255, 255, 255, 0.5)'
//                         }}>
//                           {code}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <svg style={{ color: 'white' }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
//                     <circle cx="9" cy="7" r="4"></circle>
//                     <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
//                     <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//                   </svg>
//                 </div>

//                 {/* Legend */}
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                     backdropFilter: 'blur(4px)',
//                     borderRadius: '1rem',
//                     padding: '1rem',
//                     border: '1px solid rgba(255, 255, 255, 0.3)'
//                   }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
//                       <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#22c55e' }}></div>
//                       <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Low Crowd</span>
//                     </div>
//                   </div>
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                     backdropFilter: 'blur(4px)',
//                     borderRadius: '1rem',
//                     padding: '1rem',
//                     border: '1px solid rgba(255, 255, 255, 0.3)'
//                   }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
//                       <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#eab308' }}></div>
//                       <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Medium Crowd</span>
//                     </div>
//                   </div>
//                   <div style={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                     backdropFilter: 'blur(4px)',
//                     borderRadius: '1rem',
//                     padding: '1rem',
//                     border: '1px solid rgba(255, 255, 255, 0.3)'
//                   }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
//                       <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '9999px', backgroundColor: '#ef4444' }}></div>
//                       <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>High Crowd</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Platforms */}
//             {selectedStation.platforms.map((platform, idx) => (
//               <div key={idx} style={{
//                 backgroundColor: 'white',
//                 borderRadius: '1.5rem',
//                 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
//                 padding: '2rem',
//                 marginBottom: '2rem',
//                 border: '1px solid #e2e8f0'
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
//                   <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#1e293b' }}>
//                     Platform {idx + 1}
//                   </h2>
//                   <div style={{
//                     padding: '0.5rem 1rem',
//                     backgroundColor: '#f1f5f9',
//                     borderRadius: '9999px',
//                     border: '1px solid #e2e8f0'
//                   }}>
//                     <span style={{ color: '#1e293b', fontWeight: 600 }}>{platform.direction}</span>
//                   </div>
//                 </div>

//                 {/* Train Visualization */}
//                 <div style={{
//                   position: 'relative',
//                   background: 'linear-gradient(to bottom, #334155, #1e293b)',
//                   borderRadius: '1rem',
//                   padding: '2rem',
//                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
//                 }}>
//                   {/* Safety Line */}
//                   <div style={{
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     width: '100%',
//                     height: '0.5rem',
//                     backgroundColor: '#facc15'
//                   }}></div>
                  
//                   {/* Train Body */}
//                   <div style={{
//                     position: 'relative',
//                     background: 'linear-gradient(to bottom, #475569, #334155)',
//                     borderRadius: '0.75rem',
//                     border: '4px solid #64748b',
//                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
//                     overflow: 'hidden'
//                   }}>
//                     {/* Train Stripe */}
//                     <div style={{ height: '0.75rem', ...gradientStyle }}></div>
                    
//                     {/* Sections Container */}
//                     <div style={{
//                       display: 'grid',
//                       gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
//                       gap: '1.5rem',
//                       padding: '2rem'
//                     }}>
//                       {platform.sections.map((section) => (
//                         <div key={section.position} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                           {/* Section Visualization */}
//                           <div style={{
//                             position: 'relative',
//                             background: getDensityColor(section.density),
//                             borderRadius: '1rem',
//                             boxShadow: getDensityShadow(section.density),
//                             padding: '2rem',
//                             width: '100%',
//                             cursor: 'pointer',
//                             transition: 'transform 0.2s ease',
//                           }}
//                           onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
//                           onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
//                           >
//                             {/* Position Label */}
//                             <div style={{
//                               position: 'absolute',
//                               top: '-1rem',
//                               left: '50%',
//                               transform: 'translateX(-50%)',
//                               backgroundColor: 'white',
//                               borderRadius: '9999px',
//                               padding: '0.25rem 1rem',
//                               boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
//                             }}>
//                               <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '0.875rem' }}>
//                                 {getPositionLabel(section.position)}
//                               </span>
//                             </div>
                            
//                             {/* Crowd Visualization */}
//                             <div style={{
//                               display: 'flex',
//                               flexDirection: 'column',
//                               alignItems: 'center',
//                               justifyContent: 'center',
//                               height: '8rem',
//                               gap: '0.5rem'
//                             }}>
//                               <div style={{
//                                 fontWeight: 900,
//                                 fontSize: '1.25rem',
//                                 color: '#ffffff',
//                                 backgroundColor: 'rgba(0,0,0,0.18)',
//                                 padding: '0.5rem 1rem',
//                                 borderRadius: '9999px'
//                               }}>
//                                 {section.density.toUpperCase()}
//                               </div>
//                               <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: '0.9rem', fontWeight: 700 }}>
//                                 {section.trend === 'up' ? 'Increasing' : section.trend === 'down' ? 'Decreasing' : 'Stable'}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Train Stripe Bottom */}
//                     <div style={{ height: '0.75rem', ...gradientStyle }}></div>
//                   </div>

//                   {/* Platform Edge */}
//                   <div style={{
//                     position: 'absolute',
//                     bottom: 0,
//                     left: 0,
//                     width: '100%',
//                     height: '0.5rem',
//                     backgroundColor: '#facc15'
//                   }}></div>
//                 </div>

//                 {/* Note about platform direction */}
//                 <div style={{
//                   marginTop: '1rem',
//                   backgroundColor: '#f1f5f9',
//                   borderRadius: '0.75rem',
//                   padding: '0.75rem',
//                   textAlign: 'center',
//                   border: '1px solid #e2e8f0'
//                 }}>
//                   <p style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: 500 }}>
//                     {idx === 0 ? "← Front of train on the left | Back of train on the right →" : "← Back of train on the left | Front of train on the right →"}
//                   </p>
//                 </div>
//               </div>
//             ))}

//             {/* Footer */}
//             <div style={{
//               backgroundColor: 'rgba(17, 24, 39, 0.92)',
//               backdropFilter: 'blur(6px)',
//               borderRadius: '1rem',
//               padding: '1.5rem',
//               textAlign: 'center',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
//               border: '1px solid rgba(255,255,255,0.04)'
//             }}>
//               <p style={{ color: '#e6eef8', fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
//                 🔴 LIVE DATA - Updates every 10 minutes
//               </p>
//               <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
//                 Check crowd density before boarding for a more comfortable journey! 🚇
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CrowdDensity;


import React, { useState, useEffect, useRef } from "react";
import "./CrowdDensity.css";

const CrowdDensity = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [drawerHeight, setDrawerHeight] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(30);

  // --- Density color helper ---
  const getDensityColor = (density) => {
    switch (density) {
      case "low":
        return "#22c55e";
      case "medium":
        return "#eab308";
      case "high":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  // --- MRT data ---
  const mrtStations = [
    {
      name: "Dhoby Ghaut",
      codes: ["NS24", "NE6", "CC1"],
      lat: 1.299,
      lng: 103.846,
      overallDensity: "high",
    },
    {
      name: "Raffles Place",
      codes: ["NS26", "EW14"],
      lat: 1.284,
      lng: 103.851,
      overallDensity: "high",
    },
    {
      name: "Orchard",
      codes: ["NS22", "TE14"],
      lat: 1.304,
      lng: 103.832,
      overallDensity: "medium",
    },
    {
      name: "Bishan",
      codes: ["NS17", "CC15"],
      lat: 1.351,
      lng: 103.848,
      overallDensity: "low",
    },
  ];

  // --- Map initialization ---
  useEffect(() => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      if (window.google) initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCBQdPszHAS0A2vGyc9FLAhRY9CHzr5M2M";
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  }, []);

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 1.3521, lng: 103.8198 },
      zoom: 12,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
    });

    mapInstanceRef.current = map;

    mrtStations.forEach((station) => {
      const densityColor = getDensityColor(station.overallDensity);

      const marker = new window.google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
              <svg width="50" height="60" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 0C16.7 0 10 6.7 10 15c0 8.3 15 35 15 35s15-26.7 15-35c0-8.3-6.7-15-15-15z"
                  fill="${densityColor}" stroke="white" stroke-width="2"/>
                <text x="25" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="white">
                  ${station.overallDensity.charAt(0).toUpperCase()}
                </text>
              </svg>
            `),
          scaledSize: new window.google.maps.Size(50, 60),
          anchor: new window.google.maps.Point(25, 60),
        },
      });

      marker.addListener("click", () => {
        setSelectedStation(station);
        setDrawerHeight(60);
        map.panTo({ lat: station.lat, lng: station.lng });
      });

      markersRef.current.push(marker);
    });
  };

  // --- Drawer drag handling ---
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(drawerHeight);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    const newHeight = Math.min(90, Math.max(25, startHeight - deltaY / window.innerHeight * 100));
    setDrawerHeight(newHeight);
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div className="crowd-container">
      <div ref={mapRef} className="crowd-map"></div>

      {selectedStation && (
        <div
          className="crowd-drawer"
          style={{ height: `${drawerHeight}vh` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="drawer-handle"></div>
          <div className="crowd-drawer-content">
            <h2>{selectedStation.name}</h2>
            <p>{selectedStation.codes.join(" • ")}</p>
            <span
              className="crowd-badge"
              style={{
                backgroundColor: getDensityColor(selectedStation.overallDensity),
              }}
            >
              {selectedStation.overallDensity.toUpperCase()} crowd
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrowdDensity;

