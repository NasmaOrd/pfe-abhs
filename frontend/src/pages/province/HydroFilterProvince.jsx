import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import { Line, Bar, Pie, Radar } from "react-chartjs-2";
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
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale
);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const HydroFilterProvince = () => {
  const [data, setData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [months] = useState([
    "Sep",
    "Oct",
    "Nov",
    "Déc",
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
  ]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [viewMode, setViewMode] = useState("tableau");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [comparisonData, setComparisonData] = useState([]);

  // Nouveauté : state des types de graphiques sélectionnés
  const [chartTypes, setChartTypes] = useState([{ value: "line", label: "Line" }]);

  const chartTypeOptions = [
    { value: "line", label: "Line" },
    { value: "bar", label: "Bar" },
    { value: "pie", label: "Pie" },
    { value: "radar", label: "Radar" },
  ];

  useEffect(() => {
    fetchFromGoogleSheet();
  }, []);

  const fetchFromGoogleSheet = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!A1:Z1000?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`;
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
      setProvinces([...new Set(jsonData.map((r) => r["Province:"]))]);
      setYears([...new Set(jsonData.map((r) => r["Année"]))]);
    } catch (err) {
      console.error("Erreur chargement Sheets :", err);
    }
  };

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
      backgroundColor: `hsla(${idx * 45}, 70%, 50%, 0.5)`,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
    })),
  };

  const filteredStations = selectedProvince
    ? stations.filter((s) => s.province === selectedProvince)
    : stations;

  const sendDatesToServer = async () => {
    try {
      const res = await fetch("https://pfe-abhs.vercel.app/update-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date1, date2 }),
      });
      const result = await res.json();
      fetchComparisonData();
    } catch (err) {
      console.error("Erreur envoi des dates :", err);
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
      console.error("Erreur comparaison :", err);
      setComparisonData([]);
    }
  };

  // Fonction pour afficher chaque type de graphique selon sélection
  const renderChartByType = (type) => {
    switch (type) {
      case "line":
        return <Line key={type} data={chartData} />;
      case "bar":
        return <Bar key={type} data={chartData} />;
      case "pie":
        if (selectedMonths.length === 0)
          return <p key={type}>Sélectionnez des mois pour voir le graphique Pie.</p>;

        const pieData = {
          labels: filtered.map((row) => row["Année"]),
          datasets: [
            {
              label: selectedMonths[0],
              data: filtered.map((row) => parseFloat(row[selectedMonths[0]]) || 0),
              backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(153, 102, 255, 0.5)",
                "rgba(255, 159, 64, 0.5)",
              ],
              borderWidth: 1,
            },
          ],
        };
        return <Pie key={type} data={pieData} />;
      case "radar":
        return <Radar key={type} data={chartData} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />
      <div className="hydro-filter">
        <h2>Analyse des Données Hydrologiques</h2>

        <div className="tab-navigation">
          {["tableau", "graphique", "carte", "comparaison"].map((mode) => (
            <button
              key={mode}
              className={viewMode === mode ? "active" : ""}
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {(viewMode === "tableau" || viewMode === "graphique") && (
          <>
            <div className="filters">
              <Select
                options={provinces.map((p) => ({ value: p, label: p }))}
                onChange={(e) => setSelectedProvince(e?.value || null)}
                isClearable
                placeholder="Choisir une province"
              />
              <Select
                options={years.map((y) => ({ value: y, label: y }))}
                onChange={(e) => setSelectedYears(e ? e.map((i) => i.value) : [])}
                isMulti
                placeholder="Années"
              />
              <Select
                options={months.map((m) => ({ value: m, label: m }))}
                onChange={(e) => setSelectedMonths(e ? e.map((i) => i.value) : [])}
                isMulti
                placeholder="Mois"
              />
            </div>

            {viewMode === "tableau" && (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Station</th>
                      <th>Province</th>
                      <th>Année</th>
                      {selectedMonths.map((m, i) => (
                        <th key={i}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <tr key={i}>
                        <td>{row["Station"] || row["Nom du poste"]}</td>
                        <td>{row["Province:"]}</td>
                        <td>{row["Année"]}</td>
                        {selectedMonths.map((m, j) => (
                          <td key={j}>{parseFloat(row[m])?.toFixed(1) || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === "graphique" && (
              <>
                <Select
                  options={chartTypeOptions}
                  onChange={(selected) => setChartTypes(selected || [])}
                  isMulti
                  placeholder="Choisissez un ou plusieurs types de graphiques"
                  value={chartTypes}
                  className="chart-type-select"
                />
                <div className="chart-section">
                  {chartTypes.length > 0 ? (
                    chartTypes.map((ct) => renderChartByType(ct.value))
                  ) : (
                    <p>Sélectionnez au moins un type de graphique.</p>
                  )}
                </div>
              </>
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
                    <br />
                    Province: {s.province}
                    <br />
                    Altitude: {s.z} m
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {viewMode === "comparaison" && (
          <div className="comparison-section">
            <div className="dates-input">
              <input
                type="text"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                placeholder="JJ/MM/AAAA"
              />
              <input
                type="text"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                placeholder="JJ/MM/AAAA"
              />
              <button onClick={sendDatesToServer}>Valider</button>
            </div>
            {comparisonData.length > 0 && (
              <table className="comparison-table">
                <thead>
                  <tr>{comparisonData[0].map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {comparisonData.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
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
