import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./datasearchpage.scss";

const stations = [
  { id: 1, nom: "Pont du Mdez (Sebbou)" },
  { id: 2, nom: "Aïn Timedrine (Sebbou)" },
  { id: 3, nom: "Azzaba (Sebbou)" },
  { id: 4, nom: "Source Aïn Sebou" },
];

function DataSearchPage() {
  const [stationId, setStationId] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        const all = [];
        for (const station of stations) {
          const res = await axios.get(`http://localhost:5000/api/files/${station.id}`);
          res.data.forEach((file) => {
            all.push({
              stationId: station.id,
              stationNom: station.nom,
              file,
            });
          });
        }
        setAllFiles(all);
        setFilteredFiles(all);
      } catch (err) {
        console.error("Erreur lors du chargement des fichiers :", err);
      }
    };

    fetchAllFiles();
  }, []);

  const handleSearch = () => {
    let filtered = [...allFiles];
    if (stationId) {
      filtered = filtered.filter((f) => f.stationId === parseInt(stationId));
    }
    if (searchDate.trim()) {
      filtered = filtered.filter((f) =>
        f.file.toLowerCase().includes(searchDate.toLowerCase())
      );
    }
    setFilteredFiles(filtered);
  };

  const handleOpenInStreamlit = (stationId, fileName) => {
    const fileUrl = encodeURIComponent(`${fileName}`);
    const streamlitUrl = `http://localhost:8501/?station=${stationId}&file=${fileUrl}`;
    window.open(streamlitUrl, "_blank");
  };

  return (
    <div className="dataSearchPage">
      <Sidebar />
      <div className="dataSearchPageContainer">
        <Navbar />
        <div className="top">
          <h1>📁 Recherche & Consultation des fichiers</h1>
        </div>
        <div className="filters">
          <select value={stationId} onChange={(e) => setStationId(e.target.value)}>
            <option value="">-- Toutes les stations --</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.id} - {station.nom}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filtrer par date (ex: Octobre)"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />

          <button onClick={handleSearch}>🔍 Rechercher</button>
        </div>

        <div className="results">
          {filteredFiles.length === 0 ? (
            <p>Aucun fichier trouvé.</p>
          ) : (
            <ul>
              {filteredFiles.map((item, index) => (
                <li key={index}>
                  <div className="fileInfo">
                    <span className="station">{item.stationNom}</span>
                    <span className="filename">{item.file.replace(`${item.stationId}_`, "")}</span>
                  </div>
                  <button onClick={() => handleOpenInStreamlit(item.stationId, item.file)}>
                    📊 Ouvrir dans Streamlit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataSearchPage;
