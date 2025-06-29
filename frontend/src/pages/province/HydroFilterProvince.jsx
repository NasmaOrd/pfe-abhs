import React, { useEffect, useState, useRef } from "react";
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
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import stations from "../stations/stationdata";
import "./hydrofilter.scss";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
  const [chartTypes, setChartTypes] = useState([{ value: "line", label: "Line" }]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const chartRef = useRef(null);
  const mapRef = useRef(null);
  const tableRef = useRef(null);

  const chartTypeOptions = [
    { value: "line", label: "Line" },
    { value: "bar", label: "Bar" },
    { value: "pie", label: "Pie" },
    { value: "radar", label: "Radar" },
  ];

  useEffect(() => {
    fetchFromGoogleSheet();
    fetch("/sebou_reprojected_wgs84.json")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Erreur chargement GeoJSON :", err));
  }, []);

  const fetchFromGoogleSheet = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!A1:Z4135?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`;
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
      setProvinces([...new Set(jsonData.map((r) => r["Nom du poste"]))]);
      setYears([...new Set(jsonData.map((r) => r["Année"]))]);
    } catch (err) {
      console.error("Erreur chargement Sheets :", err);
    }
  };

  const filterData = () => {
    return data.filter(
      (row) =>
        (!selectedProvince || row["Nom du poste"] === selectedProvince) &&
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

  const renderChartByType = (type) => {
    const chartTitle = `Graphique ${type.charAt(0).toUpperCase() + type.slice(1)} - ${selectedProvince || "Toutes stations"}`;
    
    switch (type) {
      case "line":
        return (
          <div key={type} className="chart-container">
            <h3>{chartTitle}</h3>
            <div className="chart-wrapper">
              <Line data={chartData} options={{ responsive: true }} />
            </div>
          </div>
        );
      case "bar":
        return (
          <div key={type} className="chart-container">
            <h3>{chartTitle}</h3>
            <div className="chart-wrapper">
              <Bar data={chartData} options={{ responsive: true }} />
            </div>
          </div>
        );
      case "pie":
        if (selectedMonths.length === 0)
          return (
            <div key={type} className="chart-container">
              <h3>{chartTitle}</h3>
              <p>Sélectionnez des mois pour voir le graphique Pie.</p>
            </div>
          );

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
        return (
          <div key={type} className="chart-container">
            <h3>{chartTitle}</h3>
            <div className="chart-wrapper">
              <Pie data={pieData} options={{ responsive: true }} />
            </div>
          </div>
        );
      case "radar":
        return (
          <div key={type} className="chart-container">
            <h3>{chartTitle}</h3>
            <div className="chart-wrapper">
              <Radar data={chartData} options={{ responsive: true }} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      let position = 20;
      
      // Ajout du titre principal
      pdf.setFontSize(20);
      pdf.text("Rapport Hydrologique", 105, position, { align: "center" });
      position += 15;
      
      // Ajout des informations de filtrage
      pdf.setFontSize(12);
      pdf.text(`Station: ${selectedProvince || "Toutes"}`, 14, position);
      position += 7;
      pdf.text(`Années: ${selectedYears.join(", ") || "Toutes"}`, 14, position);
      position += 7;
      pdf.text(`Mois: ${selectedMonths.join(", ") || "Tous"}`, 14, position);
      position += 15;
      
      // Capture du tableau si visible
      if (viewMode === "tableau" && tableRef.current) {
        const tableCanvas = await html2canvas(tableRef.current);
        const tableImgData = tableCanvas.toDataURL("image/png");
        const tableWidth = pdf.internal.pageSize.getWidth() - 20;
        const tableHeight = (tableCanvas.height * tableWidth) / tableCanvas.width;
        
        pdf.addImage(tableImgData, "PNG", 10, position, tableWidth, tableHeight);
        position += tableHeight + 10;
      }
      
      // Capture des graphiques si visibles
      if (viewMode === "graphique" && chartRef.current) {
        const chartContainers = chartRef.current.querySelectorAll(".chart-container");
        
        for (const container of chartContainers) {
          const chartCanvas = await html2canvas(container);
          const chartImgData = chartCanvas.toDataURL("image/png");
          const chartWidth = pdf.internal.pageSize.getWidth() - 20;
          const chartHeight = (chartCanvas.height * chartWidth) / chartCanvas.width;
          
          // Vérifier si on dépasse la page
          if (position + chartHeight > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            position = 20;
          }
          
          pdf.addImage(chartImgData, "PNG", 10, position, chartWidth, chartHeight);
          position += chartHeight + 10;
        }
      }
      
      // Capture de la carte si visible
      if (viewMode === "carte" && mapRef.current) {
        const mapCanvas = await html2canvas(mapRef.current);
        const mapImgData = mapCanvas.toDataURL("image/png");
        const mapWidth = pdf.internal.pageSize.getWidth() - 20;
        const mapHeight = (mapCanvas.height * mapWidth) / mapCanvas.width;
        
        // Vérifier si on dépasse la page
        if (position + mapHeight > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          position = 20;
        }
        
        pdf.addImage(mapImgData, "PNG", 10, position, mapWidth, mapHeight);
        position += mapHeight + 10;
      }
      
      // Capture des données de comparaison si visibles
      if (viewMode === "comparaison" && comparisonData.length > 0) {
        pdf.addPage();
        position = 20;
        pdf.setFontSize(16);
        pdf.text("Comparaison des périodes", 105, position, { align: "center" });
        position += 15;
        
        pdf.setFontSize(12);
        pdf.text(`Période 1: ${date1}`, 14, position);
        position += 7;
        pdf.text(`Période 2: ${date2}`, 14, position);
        position += 15;
        
        // Génération du tableau de comparaison
        pdf.setFontSize(10);
        comparisonData.forEach((row, rowIndex) => {
          if (position > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            position = 20;
          }
          
          row.forEach((cell, cellIndex) => {
            pdf.text(cell.toString(), 14 + (cellIndex * 40), position);
          });
          position += 7;
        });
      }
      
      pdf.save(`rapport_hydrologique_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />
      <div className="hydro-filter">
        <h2>Analyse des Données Hydrologiques Par Station</h2>
        
        <div className="action-buttons">
          <button 
            onClick={generatePDF} 
            disabled={isGeneratingPdf}
            className="pdf-button"
          >
            {isGeneratingPdf ? "Génération en cours..." : "Générer PDF"}
          </button>
        </div>

        <div className="tab-navigation">
          {["tableau", "graphique", "carte"].map((mode) => (
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
                placeholder="Choisir une Station"
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
              <div className="data-table" ref={tableRef}>
                <table>
                  <thead>
                    <tr>
                      <th>Station</th>
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
                        <td>{row["Année"]}</td>
                        {selectedMonths.map((m, j) => (
                          <td key={j}>
                            {isNaN(parseFloat(row[m])) ? "-" : parseFloat(row[m]).toFixed(1)}
                          </td>
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
              </div>
            )}
          </>
        )}

        {viewMode === "carte" && (
          <div className="mapContainer" ref={mapRef} style={{ height: "600px", marginTop: "20px" }}>
            <div style={{ marginBottom: "10px", textAlign: "right" }}>
              <button
                onClick={() => {
                  setSelectedProvince(null);
                  setSelectedYears([]);
                  setSelectedMonths([]);
                }}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Réinitialiser la carte
              </button>
            </div>

            <MapContainer 
              center={[34.1, -5.1]} 
              zoom={9} 
              style={{ height: "100%", width: "100%" }}
              whenCreated={(mapInstance) => mapRef.current = mapInstance}
            >
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
              <input value={date1} onChange={e => setDate1(e.target.value)} placeholder="JJ/MM/AAAA" />
              <input value={date2} onChange={e => setDate2(e.target.value)} placeholder="JJ/MM/AAAA" />
              <button onClick={async () => {
                await fetch("http://localhost:5000/update-dates", {
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

export default HydroFilterProvince;