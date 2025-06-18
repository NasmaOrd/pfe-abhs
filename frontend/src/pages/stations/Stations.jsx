import React, { useState, useEffect } from "react";
import "./stations.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import * as XLSX from "xlsx";
import stations from "./stationdata";

// Fix icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Coordonnées approximatives du bassin du Sebou (polygon simplifié)
const bassinSebouCoords = [
  [35.0, -6.2], [34.9, -6.0], [34.7, -5.8], [34.6, -5.6], [34.5, -5.3],
  [34.4, -5.0], [34.3, -4.7], [34.1, -4.5], [34.0, -4.3], [33.9, -4.2],
  [33.8, -4.4], [33.7, -4.6], [33.6, -4.9], [33.6, -5.1], [33.7, -5.3],
  [33.8, -5.5], [34.0, -5.7], [34.2, -5.9], [34.5, -6.1], [34.8, -6.2],
  [35.0, -6.2]
];

const Stations = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!selectedStation) {
      setExistingFiles([]);
      setSelectedFile(null);
      setFilteredData([]);
      return;
    }

    axios.get(`http://localhost:5000/api/files/${selectedStation.id}`)
      .then(res => setExistingFiles(res.data))
      .catch(() => setExistingFiles([]));

    fetchFilteredData(selectedStation.nom);
  }, [selectedStation]);

  const fetchFilteredData = async (stationName) => {
    try {
      const res = await fetch("http://localhost:5000/uploads/data.xlsx");
      const blob = await res.blob();
      const reader = new FileReader();

      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        const filtered = json.filter(row => row["Nom du poste"] === stationName);
        setFilteredData(filtered);
      };

      reader.readAsBinaryString(blob);
    } catch (err) {
      console.error("Erreur chargement Excel:", err);
    }
  };

  const handleStartStudy = (filename) => {
    if (!selectedStation || !filename) return;
    const fileUrl = encodeURIComponent(`http://localhost:5000/uploads/${filename}`);
    const streamlitUrl = `http://localhost:8501/?station=${selectedStation.id}&fileurl=${fileUrl}`;
    window.open(streamlitUrl, "_blank");
  };

  return (
    <div className="stations">
      <Sidebar />
      <div className="stationsContainer">
        <h2>Stations Hydrologiques autour de Sebbou (Fès)</h2>

        <div className="mapContainer" style={{ height: "500px", marginTop: "20px" }}>
          <MapContainer center={[34.0, -4.9]} zoom={8} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Polygone du bassin */}
            <Polygon positions={bassinSebouCoords} pathOptions={{ color: 'red', fillOpacity: 0.1 }} />

            {/* Marqueurs des stations */}
            {stations.map((station) => (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                eventHandlers={{ click: () => setSelectedStation(station) }}
              >
                <Popup>{station.nom}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selectedStation && (
          <div className="stationDetails">
            <h3>Détails station : {selectedStation.nom}</h3>

            {existingFiles.length > 0 && (
              <>
                <p>Fichiers :</p>
                <ul>
                  {existingFiles.map((file) => (
                    <li key={file}>
                      {file.replace(`${selectedStation.id}_`, "")}
                      <button onClick={() => handleStartStudy(file)}>Analyser</button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {filteredData.length > 0 && (
              <div className="filteredData">
                <h4>Données Excel filtrées :</h4>
                <table>
                  <thead>
                    <tr>
                      {Object.keys(filteredData[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stations;
