import { useState } from "react";
import "./MrtNames.css";

export default function MrtNames() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLines, setExpandedLines] = useState({});

  const mrtLines = [
    {
      code: "EWL",
      name: "East-West Line",
      color: "#009645",
      stations: [
        { code: "EW1", name: "Pasir Ris" },
        { code: "EW2", name: "Tampines" },
        { code: "EW3", name: "Simei" },
        { code: "EW4", name: "Tanah Merah" },
        { code: "EW5", name: "Bedok" },
        { code: "EW6", name: "Kembangan" },
        { code: "EW7", name: "Eunos" },
        { code: "EW8", name: "Paya Lebar" },
        { code: "EW9", name: "Aljunied" },
        { code: "EW10", name: "Kallang" },
        { code: "EW11", name: "Lavender" },
        { code: "EW12", name: "Bugis" },
        { code: "EW13", name: "City Hall" },
        { code: "EW14", name: "Raffles Place" },
        { code: "EW15", name: "Tanjong Pagar" },
        { code: "EW16", name: "Outram Park" },
        { code: "EW17", name: "Tiong Bahru" },
        { code: "EW18", name: "Redhill" },
        { code: "EW19", name: "Queenstown" },
        { code: "EW20", name: "Commonwealth" },
        { code: "EW21", name: "Buona Vista" },
        { code: "EW22", name: "Dover" },
        { code: "EW23", name: "Clementi" },
        { code: "EW24", name: "Jurong East" },
        { code: "EW25", name: "Chinese Garden" },
        { code: "EW26", name: "Lakeside" },
        { code: "EW27", name: "Boon Lay" },
        { code: "EW28", name: "Pioneer" },
        { code: "EW29", name: "Joo Koon" },
        { code: "EW30", name: "Gul Circle" },
        { code: "EW31", name: "Tuas Crescent" },
        { code: "EW32", name: "Tuas West Road" },
        { code: "EW33", name: "Tuas Link" },
        { code: "CG1", name: "Expo" },
        { code: "CG2", name: "Changi Airport" },
      ]
    },
    {
      code: "NSL",
      name: "North-South Line",
      color: "#D42E12",
      stations: [
        { code: "NS1", name: "Jurong East" },
        { code: "NS2", name: "Bukit Batok" },
        { code: "NS3", name: "Bukit Gombak" },
        { code: "NS4", name: "Choa Chu Kang" },
        { code: "NS5", name: "Yew Tee" },
        { code: "NS7", name: "Kranji" },
        { code: "NS8", name: "Marsiling" },
        { code: "NS9", name: "Woodlands" },
        { code: "NS10", name: "Admiralty" },
        { code: "NS11", name: "Sembawang" },
        { code: "NS12", name: "Canberra" },
        { code: "NS13", name: "Yishun" },
        { code: "NS14", name: "Khatib" },
        { code: "NS15", name: "Yio Chu Kang" },
        { code: "NS16", name: "Ang Mo Kio" },
        { code: "NS17", name: "Bishan" },
        { code: "NS18", name: "Braddell" },
        { code: "NS19", name: "Toa Payoh" },
        { code: "NS20", name: "Novena" },
        { code: "NS21", name: "Newton" },
        { code: "NS22", name: "Orchard" },
        { code: "NS23", name: "Somerset" },
        { code: "NS24", name: "Dhoby Ghaut" },
        { code: "NS25", name: "City Hall" },
        { code: "NS26", name: "Raffles Place" },
        { code: "NS27", name: "Marina Bay" },
        { code: "NS28", name: "Marina South Pier" },
      ]
    },
    {
      code: "NEL",
      name: "North-East Line",
      color: "#9900AA",
      stations: [
        { code: "NE1", name: "HarbourFront" },
        { code: "NE3", name: "Outram Park" },
        { code: "NE4", name: "Chinatown" },
        { code: "NE5", name: "Clarke Quay" },
        { code: "NE6", name: "Dhoby Ghaut" },
        { code: "NE7", name: "Little India" },
        { code: "NE8", name: "Farrer Park" },
        { code: "NE9", name: "Boon Keng" },
        { code: "NE10", name: "Potong Pasir" },
        { code: "NE11", name: "Woodleigh" },
        { code: "NE12", name: "Serangoon" },
        { code: "NE13", name: "Kovan" },
        { code: "NE14", name: "Hougang" },
        { code: "NE15", name: "Buangkok" },
        { code: "NE16", name: "Sengkang" },
        { code: "NE17", name: "Punggol" },
      ]
    },
    {
      code: "CCL",
      name: "Circle Line",
      color: "#FA9E0D",
      stations: [
        { code: "CC1", name: "Dhoby Ghaut" },
        { code: "CC2", name: "Bras Basah" },
        { code: "CC3", name: "Esplanade" },
        { code: "CC4", name: "Promenade" },
        { code: "CC5", name: "Nicoll Highway" },
        { code: "CC6", name: "Stadium" },
        { code: "CC7", name: "Mountbatten" },
        { code: "CC8", name: "Dakota" },
        { code: "CC9", name: "Paya Lebar" },
        { code: "CC10", name: "MacPherson" },
        { code: "CC11", name: "Tai Seng" },
        { code: "CC12", name: "Bartley" },
        { code: "CC13", name: "Serangoon" },
        { code: "CC14", name: "Lorong Chuan" },
        { code: "CC15", name: "Bishan" },
        { code: "CC16", name: "Marymount" },
        { code: "CC17", name: "Caldecott" },
        { code: "CC19", name: "Botanic Gardens" },
        { code: "CC20", name: "Farrer Road" },
        { code: "CC21", name: "Holland Village" },
        { code: "CC22", name: "Buona Vista" },
        { code: "CC23", name: "one-north" },
        { code: "CC24", name: "Kent Ridge" },
        { code: "CC25", name: "Haw Par Villa" },
        { code: "CC26", name: "Pasir Panjang" },
        { code: "CC27", name: "Labrador Park" },
        { code: "CC28", name: "Telok Blangah" },
        { code: "CC29", name: "HarbourFront" },
        { code: "CE1", name: "Bayfront" },
        { code: "CE2", name: "Marina Bay" },
      ]
    },
    {
      code: "DTL",
      name: "Downtown Line",
      color: "#005EC4",
      stations: [
        { code: "DT1", name: "Bukit Panjang" },
        { code: "DT2", name: "Cashew" },
        { code: "DT3", name: "Hillview" },
        { code: "DT5", name: "Beauty World" },
        { code: "DT6", name: "King Albert Park" },
        { code: "DT7", name: "Sixth Avenue" },
        { code: "DT8", name: "Tan Kah Kee" },
        { code: "DT9", name: "Botanic Gardens" },
        { code: "DT10", name: "Stevens" },
        { code: "DT11", name: "Newton" },
        { code: "DT12", name: "Little India" },
        { code: "DT13", name: "Rochor" },
        { code: "DT14", name: "Bugis" },
        { code: "DT15", name: "Promenade" },
        { code: "DT16", name: "Bayfront" },
        { code: "DT17", name: "Downtown" },
        { code: "DT18", name: "Telok Ayer" },
        { code: "DT19", name: "Chinatown" },
        { code: "DT20", name: "Fort Canning" },
        { code: "DT21", name: "Bencoolen" },
        { code: "DT22", name: "Jalan Besar" },
        { code: "DT23", name: "Bendemeer" },
        { code: "DT24", name: "Geylang Bahru" },
        { code: "DT25", name: "Mattar" },
        { code: "DT26", name: "MacPherson" },
        { code: "DT27", name: "Ubi" },
        { code: "DT28", name: "Kaki Bukit" },
        { code: "DT29", name: "Bedok North" },
        { code: "DT30", name: "Bedok Reservoir" },
        { code: "DT31", name: "Tampines West" },
        { code: "DT32", name: "Tampines" },
        { code: "DT33", name: "Tampines East" },
        { code: "DT34", name: "Upper Changi" },
        { code: "DT35", name: "Expo" },
      ]
    },
    {
      code: "TEL",
      name: "Thomson-East Coast Line",
      color: "#9D5B25",
      stations: [
        { code: "TE1", name: "Woodlands North" },
        { code: "TE2", name: "Woodlands" },
        { code: "TE3", name: "Woodlands South" },
        { code: "TE4", name: "Springleaf" },
        { code: "TE5", name: "Lentor" },
        { code: "TE6", name: "Mayflower" },
        { code: "TE7", name: "Bright Hill" },
        { code: "TE8", name: "Upper Thomson" },
        { code: "TE9", name: "Caldecott" },
        { code: "TE10", name: "Mount Pleasant" },
        { code: "TE11", name: "Stevens" },
        { code: "TE12", name: "Napier" },
        { code: "TE13", name: "Orchard Boulevard" },
        { code: "TE14", name: "Orchard" },
        { code: "TE15", name: "Great World" },
        { code: "TE16", name: "Havelock" },
        { code: "TE17", name: "Outram Park" },
        { code: "TE18", name: "Maxwell" },
        { code: "TE19", name: "Shenton Way" },
        { code: "TE20", name: "Marina Bay" },
        { code: "TE21", name: "Marina South" },
        { code: "TE22", name: "Gardens by the Bay" },
        { code: "TE22A", name: "Founders' Memorial" },
        { code: "TE23", name: "Tanjong Rhu" },
        { code: "TE24", name: "Katong Park" },
        { code: "TE25", name: "Tanjong Katong" },
        { code: "TE26", name: "Marine Parade" },
        { code: "TE27", name: "Marine Terrace" },
        { code: "TE28", name: "Siglap" },
        { code: "TE29", name: "Bayshore" },
        { code: "TE30", name: "Bedok South" },
        { code: "TE31", name: "Sungei Bedok" },
      ]
    },
  ];

  const toggleLine = (code) => {
    setExpandedLines(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="mrt-names-container">
      <header className="mrt-header">
        <h1>MRT Stations by Line</h1>
        <input
          type="text"
          placeholder="Search station or line..."
          className="mrt-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      <main className="mrt-content">
        <div className="mrt-lines-list">
          {mrtLines.map((line) => (
            <div key={line.code} className="mrt-line-card">
              <div
                className="mrt-line-header"
                style={{ borderLeftColor: line.color }}
                onClick={() => toggleLine(line.code)}
              >
                <div className="line-info">
                  <div className="line-badge" style={{ backgroundColor: line.color }}>
                    {line.code}
                  </div>
                  <h2>{line.name}</h2>
                </div>
                <button className="expand-btn">
                  {expandedLines[line.code] ? "▲" : "▼"}
                </button>
              </div>

              {expandedLines[line.code] && (
                <div className="stations-list">
                  {line.stations.map((station) => (
                    <div key={station.code} className="station-row">
                      <span className="station-code" style={{ backgroundColor: line.color }}>
                        {station.code}
                      </span>
                      <span className="station-name">{station.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

