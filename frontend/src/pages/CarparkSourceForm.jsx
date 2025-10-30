import React, { useState } from "react";
import "./CarparkSourceForm.css";

export default function CarparkSourceForm({ onSave }) {
  const [availabilityApiUrl, setAvailabilityApiUrl] = useState("");
  const [infoApiUrl, setInfoApiUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [infoPathMapping, setInfoPathMapping] = useState("");
  const [availabilityPathMapping, setAvailabilityPathMapping] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newSource = {
      name: "HDB Carparks",
      availabilityApiUrl,
      infoApiUrl,
      headers: headers ? JSON.parse(headers) : {},
      infoPathMapping: infoPathMapping ? JSON.parse(infoPathMapping) : {},
      availabilityPathMapping: availabilityPathMapping ? JSON.parse(availabilityPathMapping) : {},
      additionalInfo,
    };

    if (onSave) onSave(newSource);
    alert("HDB Carpark source saved successfully!");
  };

  return (
    <div className="carpark-form-page">
      <div className="carpark-form-container">
        <h2>Add Carpark Source</h2>
        <form className="carpark-form" onSubmit={handleSubmit}>
          <label>
            Name:
            <input type="text" value="HDB Carparks" disabled />
          </label>

          <h3>Availability API</h3>
          <p><strong>Currently:</strong> https://api.data.gov.sg/v1/transport/carpark-availability</p>
          <label>
            Change:
            <input
              type="text"
              value={availabilityApiUrl}
              onChange={(e) => setAvailabilityApiUrl(e.target.value)}
              placeholder="https://api.data.gov.sg/v1/transport/carpark-availability"
            />
          </label>

          <h3>Info API</h3>
          <p><strong>Currently:</strong> https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09</p>
          <label>
            Change:
            <input
              type="text"
              value={infoApiUrl}
              onChange={(e) => setInfoApiUrl(e.target.value)}
              placeholder="https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09"
            />
          </label>

          <h3>Headers</h3>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{"X-Api-Key": "your-api-key-here"}'
            rows={6}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "14px" }}
          />

          <h3>Info Path Mapping</h3>
          <textarea
            value={infoPathMapping}
            onChange={(e) => setInfoPathMapping(e.target.value)}
            placeholder='{"records_path": "result.records", "external_id": "car_park_no", "x_coord": "x_coord", "y_coord": "y_coord", "name": "address"}'
            rows={6}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "14px" }}
          />

          <h3>Availability Path Mapping</h3>
          <textarea
            value={availabilityPathMapping}
            onChange={(e) => setAvailabilityPathMapping(e.target.value)}
            placeholder='{"records_path": "items[0].carpark_data", "external_id": "carpark_number", "total_lots": "carpark_info[0].total_lots", "available_lots": "carpark_info[0].lots_available"}'
            rows={6}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "14px" }}
          />

          <button type="submit">Save Source</button>
        </form>
      </div>
    </div>
  );
}
