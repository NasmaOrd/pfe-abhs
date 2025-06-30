import React, { useState, useEffect } from "react";
import Select from "react-select";
import Sidebar from "../../components/sidebar/Sidebar";
import "./compariosn.scss";

const ComparisonPage = () => {
  const [data, setData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFromGoogleSheet();
  }, []);

  const fetchFromGoogleSheet = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!A1:AT4135?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`;
      const res = await fetch(url);
      const result = await res.json();

      const headers = result.values[0];
      const rows = result.values.slice(1);
      const jsonData = rows.map((row) => {
        const obj = {};
        headers.forEach((key, i) => {
          obj[key.trim()] = row[i] || "";
        });
        return obj;
      });

      setData(jsonData);

      // Extraire les provinces
      const uniqueProvinces = [...new Set(jsonData.map((r) => r["Nom du poste"]))];
      setProvinces(uniqueProvinces.map((p) => ({ value: p, label: p })));

      // Extraire les stations de la colonne AP
      const uniqueStations = [...new Set(jsonData.map((r) => r["AP"]).filter(Boolean))];
      setStations(
        uniqueStations.map((s) => ({
          value: s,
          label: s,
          province: jsonData.find((row) => row["AP"] === s)?.["Nom du poste"] || "",
        }))
      );
    } catch (err) {
      console.error("Erreur chargement Sheets :", err);
    }
  };

  const handleCompare = async () => {
    if (!date1 || !date2) return;

    setLoading(true);
    setComparisonData([]); // reset tableau avant chargement

    try {
      await fetch("http://localhost:5000/update-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date1,
          date2,
          province: selectedProvince?.value,
          station: selectedStation?.value,
        }),
      });

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!AQ6:AT53?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`
      );
      const { values } = await res.json();

      if (values) {
        // Formatter données : 
        // Col 0 : 1 chiffre après virgule (numérique)
        // Col 3 : diviser par 100 et 1 chiffre après virgule (ex: 850 → 8.5)
        const formattedData = values.map((row) => {
          return row.map((cell, j) => {
            if (j === 0 && !isNaN(parseFloat(cell))) {
              return parseFloat(cell).toFixed(1);
            }
            if (j === 3 && !isNaN(parseFloat(cell))) {
              return (parseFloat(cell) / 100).toFixed(1);
            }
            if (j > 0 && j !== 3 && !isNaN(parseFloat(cell))) {
              return parseFloat(cell).toFixed(1);
            }
            return cell;
          });
        });

        setComparisonData(formattedData);
      }
    } catch (err) {
      console.error("Erreur comparaison :", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = selectedProvince
    ? stations.filter((s) => s.province === selectedProvince.value)
    : stations;

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />
      <div className="comparison-container">
        <h2>Période de Référence</h2>

        <div className="filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Station</label>
              <Select
                options={provinces}
                onChange={(selected) => {
                  setSelectedProvince(selected);
                  setSelectedStation(null);
                }}
                isClearable
                placeholder="Sélectionnez une Station"
                value={selectedProvince}
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Période 1 (JJ/MM/AAAA)</label>
              <input
                type="text"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                placeholder="JJ/MM/AAAA"
                pattern="\d{2}/\d{2}/\d{4}"
                className="date-input"
              />
            </div>

            <div className="filter-group">
              <label>Période 2 (JJ/MM/AAAA)</label>
              <input
                type="text"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                placeholder="JJ/MM/AAAA"
                pattern="\d{2}/\d{2}/\d{4}"
                className="date-input"
              />
            </div>
          </div>

          <div className="compare-button-container">
            <button
              onClick={handleCompare}
              disabled={!date1 || !date2}
              className="compare-button"
            >
              Comparer
            </button>
          </div>
        </div>

        {loading && <div className="loading">Chargement...</div>}

        {comparisonData.length > 0 && !loading && (
          <div className="results">
            <h3>Résultats de la comparaison</h3>
            <div className="table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Pluie Normale</th>
                    <th>Pluie 2024-2025</th>
                    <th>Déficit (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i}>
                      <td>{row[0] || ""}</td>
                      <td>{row[1] || ""}</td>
                      <td>{row[2] || ""}</td>
                      <td>{row[3] || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
