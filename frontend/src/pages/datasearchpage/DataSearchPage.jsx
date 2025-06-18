import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './datasearchpage.scss';

function DataSearchPage() {
  const [stationInput, setStationInput] = useState(''); // ce que tape l’utilisateur
  const [searchDate, setSearchDate] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [stationsMap, setStationsMap] = useState({}); // { id: nom }

  // Charger stations (id => nom)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stations');
        setStationsMap(res.data); 
      } catch (err) {
        console.error('Erreur chargement stations :', err);
      }
    };
    fetchStations();
  }, []);

  // Trouver l'ID station par nom ou par id (entrée utilisateur)
  const getStationId = (input) => {
    if (!input) return null;
    // Si l'entrée est un ID (ex: "1", "2", "3") présent dans stationsMap
    if (stationsMap[input]) return input;

    // Sinon chercher un nom qui correspond exactement (insensible casse)
    const foundId = Object.keys(stationsMap).find(
      (id) => stationsMap[id].toLowerCase() === input.toLowerCase()
    );
    return foundId || null;
  };

  const handleSearch = async () => {
    const stationId = getStationId(stationInput.trim());
    if (!stationId) {
      alert("Station non trouvée. Utilisez un nom exact ou un ID valide.");
      setFilteredFiles([]);
      return;
    }

    try {
      // POST vers /api/files/search avec stationId et date
      const res = await axios.post('http://localhost:5000/api/files/search', {
        stationId,
        date: searchDate
      });
      setFilteredFiles(res.data);
    } catch (err) {
      console.error('Erreur lors de la recherche :', err);
      setFilteredFiles([]);
    }
  };

  return (
    <div className="data-search-page">
      <h2>🔎 Recherche de fichiers hydrologiques</h2>

      <div className="search-bar">
        <input
          type="text"
          list="stations-list"
          placeholder="Nom ou ID de la station"
          value={stationInput}
          onChange={(e) => setStationInput(e.target.value)}
        />
        <datalist id="stations-list">
          {Object.values(stationsMap).map((name, i) => (
            <option key={i} value={name} />
          ))}
          {Object.keys(stationsMap).map((id, i) => (
            <option key={`id-${i}`} value={id} />
          ))}
        </datalist>

        <input
          type="text"
          placeholder="Date (optionnelle, ex: 04-Septembre-2010)"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />

        <button onClick={handleSearch}>Rechercher</button>
      </div>

      <div className="file-list">
        {filteredFiles.length === 0 ? (
          <p>Aucun fichier trouvé.</p>
        ) : (
          filteredFiles.map((file) => (
            <div className="file-item" key={file.fileName}>
              <strong>{file.fileName}</strong>
              <p>📍 Station ID: {file.stationId}</p>
              <a
                href={`http://localhost:8501/?file=${encodeURIComponent(file.fileName)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button>📊 Ouvrir dans Streamlit</button>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DataSearchPage;
