import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { Line, Bar, Pie, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import Sidebar from "../../components/sidebar/Sidebar";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import stations from "../stations/stationdata";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./hydrofilter.scss";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const chartTypeOptions = [
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "radar", label: "Radar" },
];

const HydroFilter = () => {
  const [data, setData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [months] = useState([
    "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"
  ]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [viewMode, setViewMode] = useState("tableau");
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [chartTypes, setChartTypes] = useState([{ value: "line", label: "Line" }]);
  const [comparisonData, setComparisonData] = useState([]);
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  const chartRef = useRef(null);
  const mapRef = useRef(null);
  const tableRef = useRef(null);

  const monthIndexMap = {
    "Sep": 0, "Oct": 1, "Nov": 2, "Déc": 3, "Jan": 4, "Fév": 5,
    "Mar": 6, "Avr": 7, "Mai": 8, "Juin": 9, "Juil": 10, "Août": 11
  };

  const fetchFromGoogleSheet = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!A3:U4174?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`;
      const res = await fetch(url);
      const result = await res.json();
      const rows = result.values || [];

      // Les colonnes importantes : G = province, H = année, I - U = mois (12 mois)
      const monthColumns = ["Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"];
      const monthColStart = 8; // Colonne I (0-based)

      // Agrégation par province + année
      const aggregated = {};
      rows.forEach((row) => {
        const province = row[6]?.trim();
        const year = row[7]?.trim();
        if (!province || !year) return;

        const key = `${province}-${year}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            province,
            year,
            months: Array(12).fill(0),
          };
        }

        for (let i = 0; i < 12; i++) {
          const val = parseFloat(row[monthColStart + i]) || 0;
          aggregated[key].months[i] += val;
        }
      });

      const finalData = Object.values(aggregated).map((item) => {
        const entry = {
          "Province": item.province,
          "Année": item.year,
        };
        months.forEach((month, i) => {
          entry[month] = item.months[i].toFixed(1);
        });
        return entry;
      });

      const provinceList = [...new Set(finalData.map((r) => r.Province))];
      const yearList = [...new Set(finalData.map((r) => r.Année))];

      setData(finalData);
      setProvinces(provinceList);
      setYears(yearList);
    } catch (err) {
      console.error("❌ Erreur chargement Google Sheets:", err);
    }
  };

  useEffect(() => {
    fetchFromGoogleSheet();
    fetch("/sebou_reprojected_wgs84.json")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Erreur chargement GeoJSON :", err));
  }, []);

  const filterData = () => {
    return data.filter((row) =>
      (!selectedProvince || row.Province === selectedProvince) &&
      (selectedYears.length === 0 || selectedYears.includes(row.Année))
    );
  };

  const filtered = filterData();

  const chartData = {
    labels: filtered.map((row) => row["Année"]),
    datasets: selectedMonths.map((month, idx) => ({
      label: month,
      data: filtered.map((row) => parseFloat(row[month]) || null),
      backgroundColor: `hsla(${idx * 45}, 70%, 50%, 0.5)`,
      borderColor: `hsl(${idx * 45}, 70%, 50%)`,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: chartTypes.some(ct => ct.value !== "line")
    })),
  };

  const filteredStations = selectedProvince
    ? stations.filter((s) => s.province === selectedProvince)
    : stations;

  const renderChart = (type) => {
    const title = `Graphique ${type.charAt(0).toUpperCase() + type.slice(1)} - ${selectedProvince || "Toutes Provinces"}`;
    if (type === "line") return <div key={type} className="chart-container"><h3>{title}</h3><div className="chart-wrapper"><Line data={chartData} options={{ responsive: true }} /></div></div>;
    if (type === "bar") return <div key={type} className="chart-container"><h3>{title}</h3><div className="chart-wrapper"><Bar data={chartData} options={{ responsive: true }} /></div></div>;
    if (type === "pie") {
      if (selectedMonths.length === 0) return <div key={type} className="chart-container"><h3>{title}</h3><p>Sélectionnez des mois pour voir Pie.</p></div>;
      const pie = {
        labels: filtered.map(r => r["Année"]),
        datasets: [{
          label: selectedMonths[0],
          data: filtered.map(r => parseFloat(r[selectedMonths[0]]) || 0),
          backgroundColor: ["rgba(255,99,132,0.5)", "rgba(54,162,235,0.5)", "rgba(255,206,86,0.5)"],
          borderWidth: 1
        }]
      };
      return <div key={type} className="chart-container"><h3>{title}</h3><div className="chart-wrapper"><Pie data={pie} options={{ responsive: true }} /></div></div>;
    }
    if (type === "radar") return <div key={type} className="chart-container"><h3>{title}</h3><div className="chart-wrapper"><Radar data={chartData} options={{ responsive: true }} /></div></div>;
    return null;
  };

  const generatePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 10;
    let y = 20;
    pdf.setFontSize(20); pdf.text("Rapport Hydrologique Province", 105, y, { align: "center" }); y += 10;
    pdf.setFontSize(12); pdf.text(`Province: ${selectedProvince || "Toutes"}`, margin, y); y += 6; pdf.text(`Années: ${selectedYears.join(",") || "Toutes"}`, margin, y); y += 6; pdf.text(`Mois: ${selectedMonths.join(",") || "Tous"}`, margin, y); y += 10;
    if (viewMode === "tableau" && tableRef.current) {
      const c = await html2canvas(tableRef.current); const img = c.toDataURL("image/png"); const w = pdf.internal.pageSize.getWidth() - 2 * margin; const h = (c.height * w) / c.width;
      pdf.addImage(img, "PNG", margin, y, w, h); y += h + 5;
    }
    if (viewMode === "graphique" && chartRef.current) {
      const charts = chartRef.current.querySelectorAll(".chart-container");
      for (const cont of charts) {
        const c = await html2canvas(cont); const img = c.toDataURL("image/png"); const w = pdf.internal.pageSize.getWidth() - 2 * margin; const h = (c.height * w) / c.width;
        if (y + h > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
        pdf.addImage(img, "PNG", margin, y, w, h); y += h + 5;
      }
    }
    if (viewMode === "carte" && mapRef.current) {
      const c = await html2canvas(mapRef.current); const img = c.toDataURL("image/png"); const w = pdf.internal.pageSize.getWidth() - 2 * margin; const h = (c.height * w) / c.width;
      if (y + h > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
      pdf.addImage(img, "PNG", margin, y, w, h); y += h + 5;
    }
    if (viewMode === "comparaison" && comparisonData.length) {
      pdf.addPage(); y = 20; pdf.setFontSize(16); pdf.text("Comparaison", 105, y, { align: "center" }); y += 8;
      pdf.setFontSize(12); comparisonData.forEach(r => {
        if (y > pdf.internal.pageSize.getHeight() - 20) { pdf.addPage(); y = 20; }
        r.forEach((v, i) => pdf.text(`${v}`, margin + i * 40, y));
        y += 6;
      });
    }
    pdf.save(`rapport_province_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />
      <div className="hydro-filter">
        <h2>Analyse des Données Hydrologiques par Province</h2>

        <div className="action-buttons">
          <button onClick={generatePDF} className="pdf-button">Générer PDF</button>
        </div>

        <div className="tab-navigation">
          {["tableau", "graphique", "carte"].map((view) => (
            <button
              key={view}
              className={viewMode === view ? "active" : ""}
              onClick={() => setViewMode(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
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
                onChange={(e) =>
                  setSelectedYears(e ? e.map((i) => i.value) : [])
                }
                isMulti
                placeholder="Années"
              />
              <Select
                options={months.map((m) => ({ value: m, label: m }))}
                onChange={(e) =>
                  setSelectedMonths(e ? e.map((i) => i.value) : [])
                }
                isMulti
                placeholder="Mois"
              />
            </div>

            {viewMode === "tableau" && (
              <div className="data-table" ref={tableRef}>
                <table>
                  <thead>
                    <tr>
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
                        <td>{row.Province}</td>
                        <td>{row.Année}</td>
                        {selectedMonths.map((m, j) => (
                          <td key={j}>{row[m] || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === "graphique" && (
              <div ref={chartRef}>
                <Select
                  options={chartTypeOptions}
                  value={chartTypes}
                  onChange={setChartTypes}
                  isMulti
                  placeholder="Choisir type(s) de graphiques"
                />
                <div className="chart-section">
                  {chartTypes.length
                    ? chartTypes.map(ct => renderChart(ct.value))
                    : <p>Sélectionnez au moins un type de graphique.</p>}
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === "carte" && (
          <div ref={mapRef} className="mapContainer" style={{ height: "600px" }}>
            <MapContainer center={[34.1, -5.1]} zoom={9} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {geoJsonData && (
                <GeoJSON
                  data={geoJsonData}
                  style={{
                    color: "red",
                    weight: 2,
                    fillOpacity: 0.1,
                  }}
                />
              )}
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
              <input value={date1} onChange={e => setDate1(e.target.value)} placeholder="JJ/MM/AAAA" />
              <input value={date2} onChange={e => setDate2(e.target.value)} placeholder="JJ/MM/AAAA" />
              <button onClick={async () => {
                await fetch("https://pfe-abhs.vercel.app/update-dates", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ date1, date2 })
                });
                const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!AO5:AS53?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs");
                const { values } = await res.json();
                if (values) {
                  setComparisonData(values.map((r, i) => i ? [...r.slice(0, 4), `${(parseFloat(r[4].replace("%", "")) * 100).toFixed(1)}%`] : [...r.slice(0, 4), "Déficit"]));
                }
              }}>Valider</button>
            </div>
            {comparisonData.length > 0 && (
              <table className="comparison-table">
                <thead><tr>{comparisonData[0].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                <tbody>{comparisonData.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HydroFilter;