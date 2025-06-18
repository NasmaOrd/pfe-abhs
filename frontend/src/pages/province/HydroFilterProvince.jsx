/**
 * @file HydroFilterProvince.jsx
 * @description Composant React pour le filtrage et l'affichage des données hydrologiques par province via un fichier Excel. Permet une visualisation tabulaire ou graphique.
 */

import React, { useEffect, useState, useContext } from "react";
import * as XLSX from "xlsx";
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
  Legend
} from "chart.js";
import Sidebar from "../../components/sidebar/Sidebar";
import "./hydrofilter.scss";
import { DarkModeContext } from "../../context/darkModeContext";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

/**
 * Composant principal pour afficher et filtrer les données Excel hydrologiques par province.
 * @component
 */
const HydroFilterProvince = () => {
  const [data, setData] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [months] = useState([
    "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"
  ]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [viewMode, setViewMode] = useState("table");

  const fetchExcel = async () => {
    try {
      const res = await fetch("http://localhost:5000/uploads/data.xlsx");
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const cleaned = json.map(row => {
          const cleanedRow = {};
          for (const key in row) {
            if (!key.startsWith("__EMPTY")) {
              cleanedRow[key.trim()] = row[key];
            }
          }
          return cleanedRow;
        });

        setData(cleaned);
        setProvinces([...new Set(cleaned.map(row => row["Province:"]))]);
        setYears([...new Set(cleaned.map(row => row["Année"]))]);
      };
      reader.readAsBinaryString(blob);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
    }
  };

  useEffect(() => {
    fetchExcel();
  }, []);

  const filterData = () => {
    return data.filter(row =>
      (!selectedProvince || row["Province:"] === selectedProvince) &&
      (selectedYears.length === 0 || selectedYears.includes(row["Année"]))
    );
  };

  const filtered = filterData();

  const chartData = {
    labels: filtered.map(row => row["Année"]),
    datasets: selectedMonths.map((month, idx) => ({
      label: month,
      data: filtered.map(row => {
        const value = row[month];
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? null : numericValue;
      }),
      borderColor: `hsl(${idx * 45}, 70%, 50%)`,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false
    }))
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />

      <div className="hydro-filter">
        <h2>📊 Données Hydrologiques par Province</h2>

        <div className="filters">
          <div>
            <label>Province :</label>
            <Select
              options={provinces.map(p => ({ value: p, label: p }))}
              onChange={e => setSelectedProvince(e ? e.value : null)}
              isClearable
              placeholder="Choisir une province"
            />
          </div>

          <div>
            <label>Année(s) :</label>
            <Select
              options={years.map(y => ({ value: y, label: y }))}
              onChange={e => setSelectedYears(e ? e.map(i => i.value) : [])}
              isMulti
              placeholder="Choisir des années"
            />
          </div>

          <div>
            <label>Mois :</label>
            <Select
              options={months.map(m => ({ value: m, label: m }))}
              onChange={e => setSelectedMonths(e ? e.map(i => i.value) : [])}
              isMulti
              placeholder="Mois à afficher"
            />
          </div>
        </div>

        <div className="view-buttons">
          <button onClick={() => setViewMode("table")} className={viewMode === "table" ? "active" : ""}>Afficher en Tableau</button>
          <button onClick={() => setViewMode("chart")} className={viewMode === "chart" ? "active" : ""}>Afficher en Courbe</button>
        </div>

        {viewMode === "table" ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {filtered[0] &&
                    Object.keys(filtered[0])
                      .filter(col => !months.includes(col) || selectedMonths.includes(col))
                      .map((col, idx) => <th key={idx}>{col}</th>)}
                  {selectedMonths.map((month, idx) =>
                    !(filtered[0] && Object.keys(filtered[0]).includes(month)) ? <th key={idx}>{month}</th> : null
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    {Object.entries(row)
                      .filter(([col]) => !months.includes(col) || selectedMonths.includes(col))
                      .map(([_, val], j) => <td key={j}>{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chart-container">
            <Line data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HydroFilterProvince;
