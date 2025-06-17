/**
 * Page : Analyses - Affichage et analyse avancée de la pluviométrie mensuelle
 * Ajout d'une ligne de tendance basée sur la régression linéaire
 */

import "./analyses.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { saveAs } from "file-saver";
import Papa from "papaparse";
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
import { useState } from "react";

/**
 * Calcule la moyenne d'un tableau de nombres.
 * @param {number[]} arr - Tableau de nombres.
 * @returns {number} Moyenne.
 */
const moyenne = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

/**
 * Calcule l'écart-type d'un tableau de nombres.
 * @param {number[]} arr - Tableau de nombres.
 * @param {number} mean - Moyenne des nombres.
 * @returns {number} Écart-type.
 */
const ecartType = (arr, mean) =>
  Math.sqrt(arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length);

/**
 * Calcule la droite de tendance (régression linéaire) pour les données.
 * @param {{mois: string, pluie: number}[]} data - Données avec mois et pluie.
 * @returns {{mois: string, tendance: number}[]} Données avec mois et valeur de tendance.
 */
const calculerTendance = (data) => {
  const n = data.length;
  const x = data.map((_, i) => i);
  const y = data.map((d) => d.pluie);

  const meanX = moyenne(x);
  const meanY = moyenne(y);

  const numerateur = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
  const denominateur = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
  const pente = numerateur / denominateur;
  const intercept = meanY - pente * meanX;

  return data.map((_, i) => ({ mois: data[i].mois, tendance: pente * i + intercept }));
};

const Analyses = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [tendance, setTendance] = useState([]);

  /**
   * Gestion du chargement du fichier CSV et calcul des anomalies.
   * @param {React.ChangeEvent<HTMLInputElement>} event - Événement de changement du fichier.
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsedData = results.data
          .map((row) => ({
            mois: row.mois?.trim(),
            pluie: parseFloat(row.pluie?.trim()),
          }))
          .filter((d) => d.mois && !isNaN(d.pluie));

        if (parsedData.length === 0) {
          alert("Le fichier CSV est vide ou mal formaté !");
          return;
        }

        // Calcul statistiques
        const values = parsedData.map((d) => d.pluie);
        const mean = moyenne(values);
        const std = ecartType(values, mean);

        // Détection d'anomalies (z-score > 1 ou < -1)
        const withAnomalies = parsedData.map((d) => {
          const z = (d.pluie - mean) / std;
          let anomalie = null;
          if (z > 1) anomalie = "haute";
          else if (z < -1) anomalie = "basse";
          return { ...d, anomalie };
        });

        setData(withAnomalies);
        setStats({
          moyenne: mean,
          ecartType: std,
          hautes: withAnomalies.filter((d) => d.anomalie === "haute").length,
          basses: withAnomalies.filter((d) => d.anomalie === "basse").length,
        });

        setTendance(calculerTendance(parsedData));
      },
    });
  };

  /**
   * Rend un petit cercle coloré indiquant le type d'anomalie.
   * @param {string|null} value - Type d'anomalie ("haute", "basse", ou null).
   * @returns {JSX.Element|string} Élément React ou chaîne vide.
   */
  const renderColoredDot = (value) => {
    if (value === "haute") return <span style={{ color: "red" }}>🔴 Haute</span>;
    if (value === "basse") return <span style={{ color: "orange" }}>🟧 Basse</span>;
    return "-";
  };

  /**
   * Rend un point personnalisé sur le graphique selon l'anomalie.
   * @param {Object} props - Propriétés du point.
   * @returns {JSX.Element|null} Cercle SVG ou null.
   */
  const renderCustomDot = ({ cx, cy, payload }) => {
    if (cx === undefined || cy === undefined) return null;

    let fillColor = "#8884d8";
    if (payload.anomalie === "haute") fillColor = "red";
    else if (payload.anomalie === "basse") fillColor = "orange";

    return <circle cx={cx} cy={cy} r={5} fill={fillColor} stroke="#555" strokeWidth={1} />;
  };

  /**
   * Exporte les anomalies détectées sous forme d'un fichier CSV.
   */
  const exporterAnomaliesCSV = () => {
    const anomalies = data.filter((d) => d.anomalie);
    if (anomalies.length === 0) {
      alert("Aucune anomalie détectée à exporter.");
      return;
    }
    const header = "mois,pluie,anomalie\n";
    const rows = anomalies.map((d) => `${d.mois},${d.pluie},${d.anomalie}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "anomalies_detectees.csv");
  };

  return (
    <div className="analyses">
      <Sidebar />
      <div className="analysesContainer">
        <Navbar />
        <h2>
          <span>Analyses</span> Mensuelles
        </h2>

        <div className="importBox">
          <label htmlFor="csvUpload">📂 Importer un fichier CSV :</label>
          <input type="file" id="csvUpload" accept=".csv" onChange={handleFileUpload} />
        </div>

        {data.length > 0 && (
          <div className="chartGrid">
            <div className="chartCard">
              <div className="chartTitle">Pluviométrie mensuelle & ligne de tendance</div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pluie" stroke="#8884d8" dot={renderCustomDot} />
                  {tendance.length > 0 && (
                    <Line
                      type="monotone"
                      dataKey="tendance"
                      data={tendance}
                      stroke="#00b894"
                      dot={false}
                      name="Tendance"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {stats && (
          <div className="statsBox">
            <h3>Résumé Statistique</h3>
            <p>Moyenne : {stats.moyenne.toFixed(2)} mm</p>
            <p>Écart-type : {stats.ecartType.toFixed(2)}</p>
            <p>Anomalies hautes 🔴 : {stats.hautes}</p>
            <p>Anomalies basses 🟧 : {stats.basses}</p>
            <button onClick={exporterAnomaliesCSV}>📤 Exporter les anomalies</button>
          </div>
        )}

        {data.length > 0 && (
          <div className="anomalieTable">
            <h3>Détails des mois</h3>
            <table>
              <thead>
                <tr>
                  <th>Mois</th>
                  <th>Pluie (mm)</th>
                  <th>Anomalie</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor:
                        d.anomalie === "haute"
                          ? "#ffcccc"
                          : d.anomalie === "basse"
                          ? "#ffe0b3"
                          : "transparent",
                    }}
                  >
                    <td>{d.mois}</td>
                    <td>{d.pluie}</td>
                    <td>{renderColoredDot(d.anomalie)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyses;
