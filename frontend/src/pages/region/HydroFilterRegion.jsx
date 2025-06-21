import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from "../../components/sidebar/Sidebar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import stations from "../stations/stationdata";
import "./hydrofilter.scss";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// @ts-ignore
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
 * @file HydroFilterRegion.jsx
 * @description Composant React pour le filtrage et l'affichage des données hydrologiques par région (avec correspondance province-région).
 * Inclut des vues sous forme de tableau, graphique, carte et comparaison.
 */
const HydroFilterRegion = () => {
  const [data, setData] = useState([]);
  const [regionMap, setRegionMap] = useState({});
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [months] = useState(["Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [viewMode, setViewMode] = useState("tableau");
  const [comparisonData, setComparisonData] = useState([]);
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  /** Charge les données de la feuille Google Sheets */
  const fetchFromGoogleSheet = async () => {
    try {
      const baseUrl = "https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw";
      const apiKey = "AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs";

      // Chargement des données principales
      const dataUrl = `${baseUrl}/values/Feuil1!A1:Z1000?key=${apiKey}`;
      const dataRes = await fetch(dataUrl);
      const dataResult = await dataRes.json();
      const headers = dataResult.values[0];
      const rows = dataResult.values.slice(1);
      const jsonData = rows.map((row) => {
        const obj = {};
        headers.forEach((key, i) => { obj[key.trim()] = row[i] || ""; });
        return obj;
      });
      setData(jsonData);
      setYears([...new Set(jsonData.map((r) => r["Année"]))]);

      // Chargement de la correspondance province → région
      const mappingUrl = `${baseUrl}/values/Feuil1!AA6:AB52?key=${apiKey}`;
      const mapRes = await fetch(mappingUrl);
      const mapResult = await mapRes.json();
      const mapPairs = mapResult.values;
      const mapObject = {};
      mapPairs.forEach(([province, region]) => {
        if (province && region) mapObject[province.trim()] = region.trim();
      });
      setRegionMap(mapObject);
      setRegions([...new Set(Object.values(mapObject))]);

    } catch (err) {
      console.error("❌ Erreur chargement Google Sheets:", err);
    }
  };

  useEffect(() => {
    fetchFromGoogleSheet();
  }, []);

  const filterData = () => {
    return data.filter((row) => {
      const province = row["Province:"];
      const region = regionMap[province] || "";
      return (!selectedRegion || region === selectedRegion) && (selectedYears.length === 0 || selectedYears.includes(row["Année"]));
    });
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

  const filteredStations = selectedRegion
    ? stations.filter((s) => regionMap[s.province] === selectedRegion)
    : stations;

  const sendDatesToServer = async () => {
    try {
      const res = await fetch("http://localhost:5000/update-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date1, date2 }),
      });
      await res.json();
      fetchComparisonData();
    } catch (err) {
      console.error("Erreur envoi des dates:", err);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!AO5:AS53?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`;
      const res = await fetch(url);
      const result = await res.json();
      if (!result.values || result.values.length === 0) return setComparisonData([]);
      const transformed = result.values.map((row, i) => {
        if (i === 0) return [...row.slice(0, 4), "Déficit"];
        const raw = row[4];
        const value = parseFloat((raw || "").replace("%", ""));
        const deficit = isNaN(value) ? "" : `${(value * 100).toFixed(1)}%`;
        return [...row.slice(0, 4), deficit];
      });
      setComparisonData(transformed);
    } catch (err) {
      console.error("Erreur comparaison:", err);
      setComparisonData([]);
    }
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />
      <div className="hydro-filter">
        <h2>Données Hydrologiques par Région</h2>

        <div className="tab-navigation">
          {["tableau", "graphique", "carte"].map((mode) => (
            <button key={mode} className={viewMode === mode ? "active" : ""} onClick={() => setViewMode(mode)}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {(viewMode === "tableau" || viewMode === "graphique") && (
          <>
            <div className="filters">
              <Select options={regions.map((r) => ({ value: r, label: r }))} onChange={(e) => setSelectedRegion(e?.value || null)} isClearable placeholder="Choisir une région" />
              <Select options={years.map((y) => ({ value: y, label: y }))} onChange={(e) => setSelectedYears(e ? e.map((i) => i.value) : [])} isMulti placeholder="Années" />
              <Select options={months.map((m) => ({ value: m, label: m }))} onChange={(e) => setSelectedMonths(e ? e.map((i) => i.value) : [])} isMulti placeholder="Mois" />
            </div>
            {viewMode === "tableau" && (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Région</th>
                      <th>Province</th>
                      <th>Année</th>
                      {selectedMonths.map((m, i) => <th key={i}>{m}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <tr key={i}>
                        <td>{regionMap[row["Province:"]]}</td>
                        <td>{row["Province:"]}</td>
                        <td>{row["Année"]}</td>
                        {selectedMonths.map((m, j) => <td key={j}>{parseFloat(row[m])?.toFixed(1) || "-"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {viewMode === "graphique" && (
              <div className="chart-section">
                {selectedMonths.length > 0 ? <Line data={chartData} /> : <p>Sélectionnez des mois pour voir le graphique.</p>}
              </div>
            )}
          </>
        )}

        {viewMode === "carte" && (
          <div className="mapContainer" style={{ height: "600px", marginTop: "20px" }}>
            <MapContainer center={[34.1, -5.1]} zoom={9} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredStations.map((s, i) => (
                <Marker key={i} position={[s.latitude, s.longitude]}>
                  <Popup>
                    <strong>{s.nom}</strong>
                    <br />Province: {s.province}
                    <br />Altitude: {s.z} m
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {viewMode === "comparaison" && (
          <div className="comparison-section">
            <div className="dates-input">
              <input type="text" value={date1} onChange={(e) => setDate1(e.target.value)} placeholder="JJ/MM/AAAA" />
              <input type="text" value={date2} onChange={(e) => setDate2(e.target.value)} placeholder="JJ/MM/AAAA" />
              <button onClick={sendDatesToServer}>Valider</button>
            </div>
            {comparisonData.length > 0 && (
              <table className="comparison-table">
                <thead>
                  <tr>{comparisonData[0].map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {comparisonData.slice(1).map((row, i) => (
                    <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
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

export default HydroFilterRegion;
