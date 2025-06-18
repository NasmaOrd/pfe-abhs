import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
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

import "./analyses.scss";

const stations = [
  { id: 1, nom: "Pont du Mdez (Sebbou)" },
  { id: 2, nom: "Aïn Timedrine (Sebbou)" },
  { id: 3, nom: "Azzaba (Sebbou)" },
  { id: 4, nom: "Source Aïn Sebou" },
];

const moyenne = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const ecartType = (arr, mean) =>
  Math.sqrt(arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length);

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

const renderCustomDot = ({ cx, cy, payload }) => {
  if (cx === undefined || cy === undefined) return null;

  let fillColor = "#8884d8";
  if (payload.anomalie === "haute") fillColor = "red";
  else if (payload.anomalie === "basse") fillColor = "orange";

  return <circle cx={cx} cy={cy} r={5} fill={fillColor} stroke="#555" strokeWidth={1} />;
};

const Analyses = () => {
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [stationId, setStationId] = useState("");

  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [tendance, setTendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        const all = [];
        for (const station of stations) {
          const res = await axios.get(`http://localhost:5000/api/files/${station.id}`);
          res.data.forEach((file) => {
            all.push({
              stationId: station.id,
              stationNom: station.nom,
              file,
            });
          });
        }
        setAllFiles(all);
        setFilteredFiles(all);
      } catch (err) {
        console.error("Erreur lors du chargement des fichiers :", err);
      }
    };
    fetchAllFiles();
  }, []);

  useEffect(() => {
    if (!stationId) {
      setFilteredFiles(allFiles);
    } else {
      setFilteredFiles(allFiles.filter((f) => f.stationId === parseInt(stationId)));
    }
  }, [stationId, allFiles]);

  const handleFileSelect = async (fileName) => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/uploads/${fileName}`;
      const res = await axios.get(url);
      const csvText = res.data;

      Papa.parse(csvText, {
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
            setLoading(false);
            return;
          }

          const values = parsedData.map((d) => d.pluie);
          const mean = moyenne(values);
          const std = ecartType(values, mean);

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
          setLoading(false);
        },
        error: () => {
          alert("Erreur lors du parsing du fichier CSV.");
          setLoading(false);
        },
      });
    } catch (err) {
      alert("Erreur lors du téléchargement du fichier.");
      setLoading(false);
    }
  };

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

        <div className="filters">
          <select value={stationId} onChange={(e) => setStationId(e.target.value)}>
            <option value="">-- Toutes les stations --</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.id} - {station.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="results">
          {filteredFiles.length === 0 ? (
            <p>Aucun fichier trouvé.</p>
          ) : (
            <ul>
              {filteredFiles.map((item, index) => (
                <li key={index}>
                  <div className="fileInfo">
                    <span className="station">{item.stationNom}</span>
                    <span className="filename">{item.file.replace(`${item.stationId}_`, "")}</span>
                  </div>
                  <button onClick={() => handleFileSelect(item.file)}>
                    📈 Analyser ce fichier
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading && <p>Chargement du fichier...</p>}

        {data.length > 0 && !loading && (
          <>
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

            <div className="statsBox">
              <h3>Résumé Statistique</h3>
              <p>Moyenne : {stats.moyenne.toFixed(2)} mm</p>
              <p>Écart type : {stats.ecartType.toFixed(2)}</p>
              <p>Anomalies hautes : {stats.hautes}</p>
              <p>Anomalies basses : {stats.basses}</p>
              <button onClick={exporterAnomaliesCSV}>Exporter anomalies CSV</button>
            </div>

            <div className="dataTableContainer">
              <table>
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th>Pluie (mm)</th>
                    <th>Anomalie</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, idx) => (
                    <tr key={idx}>
                      <td>{d.mois}</td>
                      <td>{d.pluie}</td>
                      <td>
                        {d.anomalie === "haute" && (
                          <span style={{ color: "red" }}>🔴 Haute</span>
                        )}
                        {d.anomalie === "basse" && (
                          <span style={{ color: "orange" }}>🟠 Basse</span>
                        )}
                        {!d.anomalie && <span>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analyses
