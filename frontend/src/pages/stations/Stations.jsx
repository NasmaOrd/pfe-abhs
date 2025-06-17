import React, { useState } from "react";
import "./stations.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix Leaflet icon bug in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * Liste des stations hydrologiques/piézométriques du bassin du Sebbou (Fès, Maroc).
 * @type {Array<{id:number, nom:string, latitude:number, longitude:number}>}
 */
const stations = [
  { id: 1, nom: "Pont du Mdez (Sebbou)", latitude: 34.1900, longitude: -4.1250 },
  { id: 2, nom: "Aïn Timedrine (Sebbou)", latitude: 33.9833, longitude: -4.6667 },
  { id: 3, nom: "Azzaba (Sebbou)", latitude: 33.8314, longitude: -4.6826 },
  { id: 4, nom: "Source Aïn Sebou", latitude: 33.8383, longitude: -4.8450 },
];

/**
 * Composant React affichant la page des stations hydrologiques du bassin de Sebbou (Fès).
 * Gère la sélection de station, l'upload du fichier vers le serveur et l'ouverture
 * de la page Streamlit avec les paramètres nécessaires.
 *
 * @component
 * @returns {JSX.Element}
 */
const Stations = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Gère le clic sur un marqueur pour sélectionner une station.
   * @param {{id:number, nom:string, latitude:number, longitude:number}} station - La station sélectionnée
   */
  const handleMarkerClick = (station) => {
    setSelectedStation(station);
    setSelectedFile(null);
    setError(null);
  };

  /**
   * Upload le fichier vers le backend, récupère l'URL et ouvre Streamlit avec params.
   */
  const handleStartStudy = async () => {
    if (!selectedFile || !selectedStation) return;
    setUploading(true);
    setError(null);

    try {
      // Préparation du form data pour multer upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("stationId", selectedStation.id);

      // Appel POST upload vers ton backend (adapter URL si besoin)
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const fileUrl = encodeURIComponent(response.data.fileUrl);

      // Ouvre une nouvelle fenêtre avec paramètres station + url fichier
      const streamlitUrl = `http://localhost:8501/?station=${selectedStation.id}&fileurl=${fileUrl}`;
      window.open(streamlitUrl, "_blank");
    } catch (err) {
      console.error("Erreur upload fichier :", err);
      setError("Erreur lors de l'upload du fichier.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="stations">
      <Sidebar />
      <div className="stationsContainer">
        <Navbar />
        <h2>Stations Hydrologiques autour de Sebbou (Fès)</h2>

        {/* Carte interactive */}
        <div className="mapContainer" style={{ height: "500px", marginTop: "20px" }}>
          <MapContainer center={[34.0, -4.7]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stations.map((station) => (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                eventHandlers={{ click: () => handleMarkerClick(station) }}
              >
                <Popup>
                  <strong>{station.nom}</strong><br />
                  Lat : {station.latitude.toFixed(4)}<br />
                  Lon : {station.longitude.toFixed(4)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Formulaire de fichier (si station sélectionnée) */}
        {selectedStation && (
          <div className="uploadSection" style={{ marginTop: "20px" }}>
            <h3>Étude de la station : {selectedStation.nom}</h3>
            <input
              type="file"
              accept=".csv, .xlsx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              disabled={uploading}
            />
            <button
              onClick={handleStartStudy}
              disabled={!selectedFile || uploading}
              style={{ marginLeft: "10px" }}
            >
              {uploading ? "Upload en cours..." : "Commencer l'étude"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stations;
