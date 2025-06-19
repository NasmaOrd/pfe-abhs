/**
 * @file HydroFilter.jsx
 * @description Composant React pour le filtrage et l'affichage des données hydrologiques depuis Google Sheets.
 * Affiche les données par station, année et mois sous forme de tableau ou de graphique.
 */

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

/**
 * Composant principal pour afficher les données hydrologiques par station
 * à partir d'une feuille Google Sheet.
 * @component
 */
const HydroFilter = () => {
  /** @type {Array<Object>} */
  const [data, setData] = useState([]);

  /** @type {Array<string>} */
  const [stations, setStations] = useState([]);

  /** @type {string|null} */
  const [selectedStation, setSelectedStation] = useState(null);

  /** @type {Array<string|number>} */
  const [years, setYears] = useState([]);

  /** @type {Array<string|number>} */
  const [selectedYears, setSelectedYears] = useState([]);

  /** @type {Array<string>} */
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

  /** @type {Array<string>} */
  const [selectedMonths, setSelectedMonths] = useState([]);

  /** @type {string} */
  const [viewMode, setViewMode] = useState("table");

  /**
   * Récupère les données hydrologiques depuis Google Sheets via API
   */
  const fetchFromGoogleSheet = async () => {
    try {
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!A1:Z1000?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs`;
      const res = await fetch(sheetUrl);
      const result = await res.json();

      if (!result.values || result.values.length === 0) {
        console.error("❌ Feuille vide ou non accessible.");
        return;
      }

      const headers = result.values[0];
      const rows = result.values.slice(1);

      const jsonData = rows.map((row) => {
        const obj = {};
        headers.forEach((key, i) => {
          obj[key.trim()] = row[i] || ""; // garde les cellules vides
        });
        return obj;
      });

      setData(jsonData);
      setStations([...new Set(jsonData.map((row) => row["Nom du poste"]))]);
      setYears([...new Set(jsonData.map((row) => row["Année"]))]);
    } catch (err) {
      console.error("❌ Erreur chargement Google Sheets :", err);
    }
  };

  useEffect(() => {
    fetchFromGoogleSheet();
  }, []);

  /**
   * Filtre les données selon la station et les années sélectionnées
   * @returns {Array<Object>}
   */
  const filterData = () => {
    return data.filter(
      (row) =>
        (!selectedStation || row["Nom du poste"] === selectedStation) &&
        (selectedYears.length === 0 || selectedYears.includes(row["Année"]))
    );
  };

  const filtered = filterData();

  /**
   * Données à afficher dans le graphique
   */
  const chartData = {
    labels: filtered.map((row) => row["Année"]),
    datasets: selectedMonths.map((month, idx) => ({
      label: month,
      data: filtered.map((row) => {
        const value = row[month];
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? null : numericValue;
      }),
      borderColor: `hsl(${idx * 45}, 70%, 50%)`,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
    })),
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />

      <div className="hydro-filter">
        <h2>📊 Données Hydrologiques par Station</h2>

        <div className="filters">
          <div>
            <label>Station :</label>
            <Select
              options={stations.map((s) => ({ value: s, label: s }))}
              onChange={(e) => setSelectedStation(e ? e.value : null)}
              isClearable
              placeholder="Choisir une station"
            />
          </div>

          <div>
            <label>Année(s) :</label>
            <Select
              options={years.map((y) => ({ value: y, label: y }))}
              onChange={(e) => setSelectedYears(e ? e.map((i) => i.value) : [])}
              isMulti
              placeholder="Choisir des années"
            />
          </div>

          <div>
            <label>Mois :</label>
            <Select
              options={months.map((m) => ({ value: m, label: m }))}
              onChange={(e) =>
                setSelectedMonths(e ? e.map((i) => i.value) : [])
              }
              isMulti
              placeholder="Mois à afficher"
            />
          </div>
        </div>

        <div className="view-buttons">
          <button
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "active" : ""}
          >
            Afficher en Tableau
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={viewMode === "chart" ? "active" : ""}
          >
            Afficher en Courbe
          </button>
        </div>

        {viewMode === "table" ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {filtered[0] &&
                    Object.keys(filtered[0])
                      .filter(
                        (col) =>
                          !months.includes(col) || selectedMonths.includes(col)
                      )
                      .map((col, idx) => <th key={idx}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    {Object.entries(row)
                      .filter(
                        ([col]) =>
                          !months.includes(col) || selectedMonths.includes(col)
                      )
                      .map(([_, val], j) => (
                        <td key={j}>{val}</td>
                      ))}
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

export default HydroFilter;
