import "./analyses.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

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
            {/* Graphique ici */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyses;
