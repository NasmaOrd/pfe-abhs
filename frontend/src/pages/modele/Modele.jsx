import "./modele.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Modele = () => {
  const [param1, setParam1] = useState("");
  const [param2, setParam2] = useState("");
  const [resultData, setResultData] = useState([]);

  const handleSimulate = () => {
    // Simulation fictive : calcule une courbe simple à partir des paramètres
    const data = Array.from({ length: 10 }, (_, i) => ({
      x: i,
      y: Number(param1) * i + Number(param2),
    }));
    setResultData(data);
  };

  return (
    <div className="modele">
      <Sidebar />
      <div className="modeleContainer">
        <Navbar />
        <div className="modelForm">
          <h2>Simulation de modèle</h2>
          <div className="formRow">
            <input
              type="number"
              placeholder="Paramètre 1 (ex: pente)"
              value={param1}
              onChange={(e) => setParam1(e.target.value)}
            />
            <input
              type="number"
              placeholder="Paramètre 2 (ex: constante)"
              value={param2}
              onChange={(e) => setParam2(e.target.value)}
            />
          </div>
          <button onClick={handleSimulate}>Lancer</button>
        </div>

        {resultData.length > 0 && (
          <div className="modelResult">
            <h4>Résultat :</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resultData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="y" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modele;
