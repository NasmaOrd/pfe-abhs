import React, { useState } from "react";
import "./stations.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
 * Coordonnées basées sur des localisations réelles ou approximatives du bassin.
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
 * - Carte interactive avec marqueurs via React-Leaflet
 * - Upload de fichier pour étude locale
 * - Redirection vers Streamlit avec le fichier transmis en base64
 *
 * @component
 * @returns {JSX.Element}
 */
const Stations = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  /**
   * Gère le clic sur un marqueur pour sélectionner une station.
   * @param {Object} station - La station sélectionnée
   */
  const handleMarkerClick = (station) => {
    setSelectedStation(station);
    setSelectedFile(null);
  };

  /**
   * Envoie le fichier vers Streamlit via une URL avec paramètres (base64).
   */
  const handleStartStudy = () => {
    if (!selectedFile || !selectedStation) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64File = encodeURIComponent(reader.result);
      const url = `http://localhost:8501/?station=${selectedStation.id}&filename=${selectedFile.name}&filedata=${base64File}`;
      window.open(url, "_blank");
    };
    reader.readAsDataURL(selectedFile);
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
            />
            <button
              onClick={handleStartStudy}
              disabled={!selectedFile}
              style={{ marginLeft: "10px" }}
            >
              Commencer l'étude
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stations;
