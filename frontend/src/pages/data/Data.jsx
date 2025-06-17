import "./data.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";

const stations = [
  { id: 1, nom: "Pont du Mdez (Sebbou)" },
  { id: 2, nom: "Aïn Timedrine (Sebbou)" },
  { id: 3, nom: "Azzaba (Sebbou)" },
  { id: 4, nom: "Source Aïn Sebou" },
];

const moyenne = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const min = (arr) => Math.min(...arr);
const max = (arr) => Math.max(...arr);

const Data = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [file1, setFile1] = useState("");
  const [file2, setFile2] = useState("");
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [diffData, setDiffData] = useState([]);
  const [stats1, setStats1] = useState(null);
  const [stats2, setStats2] = useState(null);

  const parseFile = (fileName, setData, setStats) => {
    axios
      .get(`http://localhost:5000/uploads/${fileName}`)
      .then((response) => {
        Papa.parse(response.data, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data
              .map((row) => ({
                mois: row.mois?.trim(),
                pluie: parseFloat(row.pluie?.trim()),
              }))
              .filter((d) => d.mois && !isNaN(d.pluie));

            setData(parsed);
            const values = parsed.map((d) => d.pluie);
            setStats({
              moyenne: moyenne(values),
              min: min(values),
              max: max(values),
            });
          },
        });
      })
      .catch((error) => {
        console.error("Erreur chargement fichier :", error);
      });
  };

  useEffect(() => {
    if (selectedStation) {
      axios
        .get(`http://localhost:5000/api/files/${selectedStation.id}`)
        .then((res) => {
          setFileList(res.data);
          setFile1("");
          setFile2("");
          setData1([]);
          setData2([]);
          setStats1(null);
          setStats2(null);
          setDiffData([]);
        })
        .catch((err) => {
          console.error("Erreur récupération fichiers :", err);
        });
    }
  }, [selectedStation]);

  useEffect(() => {
    if (file1 && file2) {
      parseFile(file1, setData1, setStats1);
      parseFile(file2, setData2, setStats2);
    }
  }, [file1, file2]);

  useEffect(() => {
    if (data1.length && data2.length) {
      const merged = data1.map((item, i) => ({
        mois: item.mois,
        annee1: item.pluie,
        annee2: data2[i]?.pluie || 0,
        ecart: Math.abs(item.pluie - (data2[i]?.pluie || 0)),
        variation: item.pluie > (data2[i]?.pluie || 0) ? "⬆️" : "⬇️",
      }));
      setDiffData(merged);
    }
  }, [data1, data2]);

  return (
    <div className="data">
      <Sidebar />
      <div className="dataContainer">
        <Navbar />
        <h2>📊 Comparaison inter-annuelle</h2>

        {/* Sélection station */}
        <div className="stationSelector">
          <label>📍 Sélectionnez une station :</label>
          <select
            onChange={(e) => {
              const id = parseInt(e.target.value);
              const station = stations.find((s) => s.id === id);
              setSelectedStation(station);
            }}
          >
            <option value="">-- Choisir --</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Sélection fichiers */}
        {fileList.length > 0 && (
          <div className="fileSelectors">
            <div>
              <label>📂 Fichier année 1 :</label>
              <select value={file1} onChange={(e) => setFile1(e.target.value)}>
                <option value="">-- Choisir fichier --</option>
                {fileList.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>📂 Fichier année 2 :</label>
              <select value={file2} onChange={(e) => setFile2(e.target.value)}>
                <option value="">-- Choisir fichier --</option>
                {fileList.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Affichage des résultats */}
        {diffData.length > 0 && (
          <>
            <div className="chartCard">
              <h3>📈 Précipitations mensuelles</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={diffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="annee1" stroke="#8884d8" name="Année 1" />
                  <Line dataKey="annee2" stroke="#82ca9d" name="Année 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chartCard">
              <h3>📊 Écart mensuel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={diffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ecart" fill="#ff8042" name="Écart (mm)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="variationTable">
              <h3>📉 Détail des variations</h3>
              <table>
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th>Année 1</th>
                    <th>Année 2</th>
                    <th>Variation</th>
                    <th>Écart</th>
                  </tr>
                </thead>
                <tbody>
                  {diffData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.mois}</td>
                      <td>{row.annee1} mm</td>
                      <td>{row.annee2} mm</td>
                      <td>{row.variation}</td>
                      <td>{row.ecart.toFixed(2)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="statsBox">
              <h3>📌 Statistiques globales</h3>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Data;
