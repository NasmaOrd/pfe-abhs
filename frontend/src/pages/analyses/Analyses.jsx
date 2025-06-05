import "./analyses.scss";
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

/**
 * Données fictives représentant la pluviométrie mensuelle (en mm).
 * @constant {Array<{mois: string, pluie: number}>}
 */
const dummyData = [
  { mois: "Jan", pluie: 80 },
  { mois: "Fév", pluie: 60 },
  { mois: "Mar", pluie: 100 },
  { mois: "Avr", pluie: 40 },
  { mois: "Mai", pluie: 20 },
  { mois: "Juin", pluie: 10 },
  { mois: "Juil", pluie: 30 },
  { mois: "Août", pluie: 50 },
  { mois: "Sep", pluie: 90 },
  { mois: "Oct", pluie: 110 },
  { mois: "Nov", pluie: 95 },
  { mois: "Déc", pluie: 70 },
];

/**
 * Composant Analyses
 * 
 * Affiche une page d'analyse mensuelle avec un graphique de pluviométrie.
 * 
 * Structure :
 * - Sidebar de navigation latérale
 * - Navbar en haut
 * - Titre de la page
 * - Graphique en ligne responsive représentant la pluviométrie mensuelle
 * 
 * Utilise la bibliothèque Recharts pour les graphiques.
 * 
 * @component
 * @returns {JSX.Element} Composant React affichant les analyses sous forme graphique
 */
const Analyses = () => {
  return (
    <div className="analyses">
      {/* Barre latérale de navigation */}
      <Sidebar />

      {/* Conteneur principal avec navbar et contenu */}
      <div className="analysesContainer">
        {/* Barre de navigation en haut */}
        <Navbar />

        {/* Titre de la page */}
        <h2>Analyses Mensuelles</h2>

        {/* Grille contenant les graphiques */}
        <div className="chartGrid">
          <div className="chartCard">
            <div className="chartTitle">Pluviométrie mensuelle</div>

            {/* Graphique réactif avec largeur 100% et hauteur 300px */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dummyData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                {/* Grille de fond */}
                <CartesianGrid strokeDasharray="3 3" />

                {/* Axe X avec les mois */}
                <XAxis dataKey="mois" />

                {/* Axe Y automatique */}
                <YAxis />

                {/* Tooltip affiché au survol */}
                <Tooltip />

                {/* Légende du graphique */}
                <Legend />

                {/* Ligne représentant la pluie */}
                <Line
                  type="monotone"
                  dataKey="pluie"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyses;
