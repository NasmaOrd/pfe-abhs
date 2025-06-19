// ✅ HydroFilterProvince.jsx complet avec toutes les fonctionnalités restaurées et comparaison AO5:AS53
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from "chart.js";
import Sidebar from "../../components/sidebar/Sidebar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import stations from "../stations/stationdata";
import "./hydrofilter.scss";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const HydroFilterProvince = () => {
  const [data, setData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [months] = useState(["Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [viewMode, setViewMode] = useState("historique");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [comparisonData, setComparisonData] = useState([]);

  const fetchFromGoogleSheet = async () => {
    try {
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!A1:Z1000?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`;
      const res = await fetch(sheetUrl);
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
      setProvinces([...new Set(jsonData.map((row) => row["Province:"]))]);
      setYears([...new Set(jsonData.map((row) => row["Année"]))]);
    } catch (err) {
      console.error("Erreur chargement Sheets:", err);
    }
  };

  useEffect(() => {
    fetchFromGoogleSheet();
  }, []);

  const filterData = () => {
    return data.filter(
      (row) =>
        (!selectedProvince || row["Province:"] === selectedProvince) &&
        (selectedYears.length === 0 || selectedYears.includes(row["Année"]))
    );
  };

  const filtered = filterData();

  const chartData = {
    labels: filtered.map((row) => row["Année"]),
    datasets: selectedMonths.map((month, idx) => ({
      label: month,
      data: filtered.map((row) => parseFloat(row[month]) || null),
      borderColor: `hsl(${idx * 45}, 70%, 50%)`,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
    })),
  };

  const filteredStations = selectedProvince ? stations.filter((s) => s.province === selectedProvince) : stations;

  const sendDatesToServer = async () => {
    try {
      const res = await fetch("http://localhost:5000/update-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date1, date2 }),
      });
      const result = await res.json();
      console.log("✅ Serveur:", result);
      fetchComparisonData();
    } catch (error) {
      console.error("❌ Erreur envoi dates:", error);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!AO5:AS53?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`;
      const res = await fetch(sheetUrl);
      const result = await res.json();
      if (!result.values || result.values.length === 0) {
        setComparisonData([]);
        return;
      }
      const transformed = result.values.map((row, rowIndex) => {
        if (rowIndex === 0) {
          return [...row.slice(0, 4), "Déficit"];
        } else {
          const rawValue = row[4];
          const value = parseFloat(rawValue?.replace('%', '')) || 0;
          return [...row.slice(0, 4), `${(value*100).toFixed(1)}%`];
        }
      });
      setComparisonData(transformed);
    } catch (err) {
      console.error("❌ Erreur comparaison:", err);
      setComparisonData([]);
    }
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />
      <div className="hydro-filter">
        <h2>Analyse des Données Hydrologiques</h2>

        <div className="view-buttons">
          <button onClick={() => setViewMode("historique")} className={viewMode === "historique" ? "active" : ""}>Historique</button>
          <button onClick={() => setViewMode("carte")} className={viewMode === "carte" ? "active" : ""}>Carte</button>
          <button onClick={() => setViewMode("comparaison")} className={viewMode === "comparaison" ? "active" : ""}>Comparaison</button>
        </div>

        {viewMode === "historique" && (
          <>
            <div className="filters">
              <div>
                <label>Province :</label>
                <Select options={provinces.map((p) => ({ value: p, label: p }))} onChange={(e) => setSelectedProvince(e?.value || null)} isClearable placeholder="Choisir une province" />
              </div>
              <div>
                <label>Année(s) :</label>
                <Select options={years.map((y) => ({ value: y, label: y }))} onChange={(e) => setSelectedYears(e ? e.map((i) => i.value) : [])} isMulti placeholder="Choisir des années" />
              </div>
              <div>
                <label>Mois :</label>
                <Select options={months.map((m) => ({ value: m, label: m }))} onChange={(e) => setSelectedMonths(e ? e.map((i) => i.value) : [])} isMulti placeholder="Mois à afficher" />
              </div>
            </div>
            <div className="table-or-chart">
              {selectedMonths.length > 0 ? <Line data={chartData} /> : <p>Sélectionnez des mois pour afficher la courbe.</p>}
            </div>
          </>
        )}

        {viewMode === "carte" && (
          <div className="mapContainer" style={{ height: "600px", marginTop: "20px" }}>
            <MapContainer center={[34.1, -5.1]} zoom={9} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              {filteredStations.map((station, idx) => (
                <Marker key={idx} position={[station.latitude, station.longitude]}>
                  <Popup>
                    <strong>{station.nom}</strong>
                    <br />Province: {station.province}
                    <br />Altitude: {station.z} m
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {viewMode === "comparaison" && (
          <div>
            <label>Date 1 :</label>
            <input type="text" value={date1} onChange={(e) => setDate1(e.target.value)} placeholder="JJ/MM/AAAA" />
            <label>Date 2 :</label>
            <input type="text" value={date2} onChange={(e) => setDate2(e.target.value)} placeholder="JJ/MM/AAAA" />
            <button onClick={sendDatesToServer}>Valider et comparer</button>

            {comparisonData.length > 0 && (
              <table className="comparison-table">
                <thead>
                  <tr>
                    {comparisonData[0].map((header, i) => <th key={i}>{header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => <td key={j}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HydroFilterProvince;
