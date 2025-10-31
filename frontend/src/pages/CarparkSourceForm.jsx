import React, { useState } from "react";
import axios from "axios";
import "./CarparkSourceForm.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function CarparkSourceForm() {
  const [availabilityApiUrl, setAvailabilityApiUrl] = useState("");
  const [infoApiUrl, setInfoApiUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [infoPathMapping, setInfoPathMapping] = useState("");
  const [availabilityPathMapping, setAvailabilityPathMapping] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newSource = {
      name: "HDB Carparks",
      availability_api_url:
        availabilityApiUrl ||
        "https://api.data.gov.sg/v1/transport/carpark-availability",
      info_api_url:
        infoApiUrl ||
        "https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09",
      headers: headers ? JSON.parse(headers) : null,
      info_path_mapping: infoPathMapping ? JSON.parse(infoPathMapping) : null,
      availability_path_mapping: availabilityPathMapping
        ? JSON.parse(availabilityPathMapping)
        : null,
      additional_info: additionalInfo || null,
    };

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8000/api/carpark/create_carpark_source/",
        newSource,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Carpark source added successfully!");

      // Navigate back to NearbyCarparks and signal re-fetch
      if (location.state?.fromNearby) {
        navigate("/NearbyCarparks", { state: { newSourceAdded: true } });
      }
    } catch (error) {
      console.error(error.response || error);
      alert(
        `Failed to create source: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
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
          <input
            type="text"
            value={availabilityApiUrl}
            onChange={(e) => setAvailabilityApiUrl(e.target.value)}
            placeholder="Change if needed..."
          />

          <h3>Info API</h3>
          <input
            type="text"
            value={infoApiUrl}
            onChange={(e) => setInfoApiUrl(e.target.value)}
            placeholder="Change if needed..."
          />

          <h3>Headers</h3>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{"X-Api-Key": "your-api-key-here"}'
            rows={6}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />

          <h3>Info Path Mapping</h3>
          <textarea
            value={infoPathMapping}
            onChange={(e) => setInfoPathMapping(e.target.value)}
            placeholder='{"records_path": "result.records", "external_id": "car_park_no", "x_coord": "x_coord", "y_coord": "y_coord", "name": "address"}'
            rows={6}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />

          <h3>Availability Path Mapping</h3>
          <textarea
            value={availabilityPathMapping}
            onChange={(e) => setAvailabilityPathMapping(e.target.value)}
            placeholder='{"records_path": "items[0].carpark_data", "external_id": "carpark_number", "total_lots": "carpark_info[0].total_lots", "available_lots": "carpark_info[0].lots_available"}'
            rows={6}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />

          {/* Buttons side by side */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Source"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/NearbyCarparks")}
              style={{
                backgroundColor: "#f0f0f0",
                color: "#ffffff",
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "10px 16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ← Back to Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
