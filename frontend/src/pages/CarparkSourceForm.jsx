import React, { useState } from "react";
import axios from "axios";
import "./CarparkSourceForm.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function CarparkSourceForm() {
  const [name, setName] = useState("");
  const [availabilityApiUrl, setAvailabilityApiUrl] = useState("");
  const [infoApiUrl, setInfoApiUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [infoPathMapping, setInfoPathMapping] = useState("");
  const [availabilityPathMapping, setAvailabilityPathMapping] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const parseJSON = (str) => {
    if (!str.trim()) return undefined;
    try {
      return JSON.parse(str);
    } catch (err) {
      alert("Invalid JSON: " + err.message);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (!availabilityApiUrl.trim()) {
      alert("Availability API URL is required");
      return;
    }
    if (!infoApiUrl.trim()) {
      alert("Info API URL is required");
      return;
    }

    const newSource = {
      name: name.trim(),
      availability_api_url: availabilityApiUrl.trim(),
      info_api_url: infoApiUrl.trim(),
      headers: parseJSON(headers),
      info_path_mapping: parseJSON(infoPathMapping),
      availability_path_mapping: parseJSON(availabilityPathMapping),
    };

    console.log("Submitting new source:", newSource);

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8000/api/carpark/create_carpark_source/",
        newSource,
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Carpark source added successfully!");

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
        <h2>Add / Update Carpark Source</h2>
        <form className="carpark-form" onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter source name"
              required
            />
          </label>

          <h3>Availability API</h3>
          <input
            type="text"
            value={availabilityApiUrl}
            onChange={(e) => setAvailabilityApiUrl(e.target.value)}
            placeholder="Enter availability API URL"
            required
          />

          <h3>Info API</h3>
          <input
            type="text"
            value={infoApiUrl}
            onChange={(e) => setInfoApiUrl(e.target.value)}
            placeholder="Enter info API URL"
            required
          />

          <h3>Headers</h3>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{"X-Api-Key": "your-api-key-here"}'
            rows={4}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "14px" }}
          />

          <h3>Info Path Mapping</h3>
          <textarea
            value={infoPathMapping}
            onChange={(e) => setInfoPathMapping(e.target.value)}
            placeholder='{"records_path": "result.records", "external_id": "car_park_no", "x_coord": "x_coord", "y_coord": "y_coord", "name": "address"}'
            rows={4}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "14px" }}
          />

          <h3>Availability Path Mapping</h3>
          <textarea
            value={availabilityPathMapping}
            onChange={(e) => setAvailabilityPathMapping(e.target.value)}
            placeholder='{"records_path": "items[0].carpark_data", "external_id": "carpark_number", "total_lots": "carpark_info[0].total_lots", "available_lots": "carpark_info[0].lots_available"}'
            rows={4}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "14px" }}
          />

          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Source"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/NearbyCarparks")}
              style={{
                backgroundColor: "#f0f0f0",
                color: "#fffffff",
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
