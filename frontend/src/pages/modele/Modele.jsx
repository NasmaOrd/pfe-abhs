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

/**
 * Composant Modele
 * 
 * Permet de simuler un modèle linéaire simple y = param1 * x + param2.
 * 
 * Fonctionnalités :
 * - Saisie de deux paramètres numériques (pente et constante)
 * - Calcul des résultats de la simulation sous forme d'une série de points
 * - Affichage d'un graphique linéaire des résultats
 * - Intégration d'une barre latérale (Sidebar) et d'une barre de navigation (Navbar)
 * 
 * @component
 * 
 * @returns {JSX.Element} Composant React affichant l'interface de simulation et le graphique des résultats.
 */
const Modele = () => {
  // États pour les paramètres de simulation
  const [param1, setParam1] = useState("");
  const [param2, setParam2] = useState("");
  // État pour stocker les résultats calculés (données du graphique)
  const [resultData, setResultData] = useState([]);

  /**
   * Génére la simulation à partir des paramètres saisis.
   * Calcule une série de points suivant la formule y = param1 * x + param2,
   * pour x allant de 0 à 9.
   * Met à jour l'état `resultData` pour affichage dans le graphique.
   */
  const handleSimulate = () => {
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

          {/* Formulaire de saisie des paramètres */}
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

          {/* Bouton pour lancer la simulation */}
          <button onClick={handleSimulate}>Lancer</button>
        </div>

        {/* Affichage du graphique uniquement si on a des résultats */}
        {resultData.length > 0 && (
          <div className="modelResult">
            <h4>Résultat :</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resultData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modele;
