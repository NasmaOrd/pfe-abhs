import "./chart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Données mensuelles des précipitations (en mm).
 * Chaque objet représente un mois de l'année hydrologique.
 * @type {{ name: string, Precipitations: number }[]}
 */
const data = [
  { name: "Sept", Precipitations: 70 },
  { name: "Oct", Precipitations: 110 },
  { name: "Nov", Precipitations: 140 },
  { name: "Déc", Precipitations: 200 },
  { name: "Jan", Precipitations: 180 },
  { name: "Fév", Precipitations: 150 },
  { name: "Mars", Precipitations: 90 },
  { name: "Avr", Precipitations: 60 },
];

/**
 * Composant React affichant une courbe des précipitations mensuelles.
 *
 * @component
 * @param {Object} props - Propriétés du composant.
 * @param {number} props.aspect - Ratio largeur/hauteur du graphique (ex: 2).
 * @param {string} props.title - Titre à afficher au-dessus du graphique (non utilisé ici directement).
 * @returns {JSX.Element} Un graphique de type AreaChart avec les précipitations mensuelles.
 */
const Chart = ({ aspect, title }) => {
  return (
    <div className="chart">
      <div className="title">{"Évolution des précipitations mensuelles"}</div>
      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="precip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1e90ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="gray" />
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="Precipitations"
            stroke="#1e90ff"
            fillOpacity={1}
            fill="url(#precip)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
