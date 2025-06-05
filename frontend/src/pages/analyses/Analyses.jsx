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

const Analyses = () => {
  return (
    <div className="analyses">
      <Sidebar />
      <div className="analysesContainer">
        <Navbar />
        <h2>Analyses Mensuelles</h2>
        <div className="chartGrid">
          <div className="chartCard">
            <div className="chartTitle">Pluviométrie mensuelle</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dummyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pluie" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyses;
