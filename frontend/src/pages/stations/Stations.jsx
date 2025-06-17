import React, { useState, useEffect } from "react";
import "./stations.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

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
 * Liste des stations hydrologiques/piézométriques.
 */
const stations = [
  { id: 1, nom: "Pont du Mdez (Sebbou)", latitude: 34.1900, longitude: -4.1250 },
  { id: 2, nom: "Aïn Timedrine (Sebbou)", latitude: 33.9833, longitude: -4.6667 },
  { id: 3, nom: "Azzaba (Sebbou)", latitude: 33.8314, longitude: -4.6826 },
  { id: 4, nom: "Source Aïn Sebou", latitude: 33.8383, longitude: -4.8450 },
];

/**
 * Composant React affichant la page des stations,
 * permettant d'uploader ou choisir un fichier déjà uploadé,
 * et lancer l'étude en ouvrant Streamlit avec params.
 */
const Stations = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [selectedExistingFile, setSelectedExistingFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Quand on clique sur une station, récupérer les fichiers uploadés liés à cette station.
   */
  useEffect(() => {
    if (!selectedStation) {
      setExistingFiles([]);
      setSelectedExistingFile(null);
      setSelectedFile(null);
      setError(null);
      return;
    }

    axios.get(`http://localhost:5000/api/files/${selectedStation.id}`)
      .then(res => {
        setExistingFiles(res.data);
        setSelectedExistingFile(null);
        setSelectedFile(null);
        setError(null);
      })
      .catch(() => {
        setExistingFiles([]);
        setSelectedExistingFile(null);
      });
  }, [selectedStation]);

  /**
   * Gère le clic sur un marqueur station.
   * @param {Object} station La station sélectionnée
   */
  const handleMarkerClick = (station) => {
    setSelectedStation(station);
  };

  /**
   * Upload un nouveau fichier vers le backend, puis recharge la liste des fichiers.
   */
 const handleUpload = async () => {
  if (!selectedFile || !selectedStation) return;
  setUploading(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    // On passe stationId en query param (pas dans formData)
    await axios.post(
      `http://localhost:5000/upload?stationId=${selectedStation.id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    // Après upload, on recharge la liste des fichiers associés
    const res = await axios.get(`http://localhost:5000/api/files/${selectedStation.id}`);
    setExistingFiles(res.data);
    setSelectedExistingFile(null);
    setSelectedFile(null);
  } catch (err) {
    setError("Erreur lors de l'upload du fichier.");
    console.error(err);
  } finally {
    setUploading(false);
  }
};


  /**
   * Ouvre la page Streamlit dans un nouvel onglet avec station + fichier choisi.
   * @param {string} filename Nom du fichier (dans /uploads/)
   */
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
        <Navbar />
        <h2>Stations Hydrologiques autour de Sebbou (Fès)</h2>

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
                eventHandlers={{
                  click: () => handleMarkerClick(station),
                }}
              >
                <Popup>{station.nom}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selectedStation && (
          <div className="stationDetails">
            <h3>Détails station : {selectedStation.nom}</h3>

            {existingFiles.length > 0 ? (
              <>
                <p>Fichiers existants pour cette station :</p>
                <ul>
                  {existingFiles.map((file) => (
                    <li key={file}>
                      {file.replace(`${selectedStation.id}_`, "")}{" "}
                      <button onClick={() => handleStartStudy(file)}>Commencer l'étude</button>
                    </li>
                  ))}
                </ul>
                <hr />
                <p>Ou uploader un nouveau fichier :</p>
              </>
            ) : (
              <p>Aucun fichier trouvé pour cette station, veuillez uploader un fichier :</p>
            )}

            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
            >
              {uploading ? "Upload en cours..." : "Uploader le fichier"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stations;
