/**
 * Composant Data
 * 
 * Permet d'importer deux fichiers CSV contenant les colonnes "mois" et "pluie",
 * puis d'afficher un graphique comparatif ainsi que des statistiques (moyenne, min, max).
 * 
 * Fonctionnalités :
 * - Upload de 2 fichiers CSV (année 1 et année 2)
 * - Visualisation des données sur un LineChart superposé
 * - Calcul statistique pour chaque série de données
 * 
 * @component
 * @returns {JSX.Element} Composant React de comparaison interannuelle
 */

import "./data.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Papa from "papaparse";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const moyenne = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const min = (arr) => Math.min(...arr);
const max = (arr) => Math.max(...arr);

const Data = () => {
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [stats1, setStats1] = useState(null);
  const [stats2, setStats2] = useState(null);

  const parseFile = (file, setData, setStats) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row) => ({
          mois: row.mois?.trim(),
          pluie: parseFloat(row.pluie?.trim()),
        })).filter((d) => d.mois && !isNaN(d.pluie));

        setData(parsed);
        const values = parsed.map((d) => d.pluie);
        setStats({
          moyenne: moyenne(values),
          min: min(values),
          max: max(values),
        });
      },
    });
  };

  return (
    <div className="data">
      <Sidebar />
      <div className="dataContainer">
        <Navbar />
        <h2>📊 Comparaison inter-annuelle</h2>

        <div className="uploadSection">
          <div>
            <label>📁 Fichier Année 1 :</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => parseFile(e.target.files[0], setData1, setStats1)}
            />
          </div>
          <div>
            <label>📁 Fichier Année 2 :</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => parseFile(e.target.files[0], setData2, setStats2)}
            />
          </div>
        </div>

        {/* Chart */}
        {data1.length > 0 && data2.length > 0 && (
          <div className="chartGrid">
            <div className="chartCard">
              <div className="chartTitle">Évolution des précipitations</div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" type="category" allowDuplicatedCategory={false} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line data={data1} dataKey="pluie" name="Année 1" stroke="#8884d8" />
                  <Line data={data2} dataKey="pluie" name="Année 2" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Résumés statistiques */}
        {(stats1 && stats2) && (
          <div className="statsBox">
            <h3>📈 Statistiques</h3>
            <div className="statGroup">
              <div>
                <h4>Année 1</h4>
                <p>Moyenne : {stats1.moyenne.toFixed(2)} mm</p>
                <p>Min : {stats1.min.toFixed(2)} mm</p>
                <p>Max : {stats1.max.toFixed(2)} mm</p>
              </div>
              <div>
                <h4>Année 2</h4>
                <p>Moyenne : {stats2.moyenne.toFixed(2)} mm</p>
                <p>Min : {stats2.min.toFixed(2)} mm</p>
                <p>Max : {stats2.max.toFixed(2)} mm</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Data;
