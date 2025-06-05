import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";

/**
 * Composant Home
 * 
 * Page d'accueil du dashboard affichant plusieurs sections :
 * - Sidebar : barre latérale de navigation
 * - Navbar : barre de navigation en haut
 * - Widgets : indicateurs clés (employées, stations, précipitations, humidité)
 * - Featured : section mettant en avant des éléments importants
 * - Chart : graphique des revenus sur les 6 derniers mois
 * - Table : liste des dernières observations
 * 
 * @component
 * @returns {JSX.Element} Composant React affichant le tableau de bord principal
 */
const Home = () => {
  return (
    <div className="home">
      {/* Barre latérale de navigation */}
      <Sidebar />
      
      {/* Conteneur principal de la page */}
      <div className="homeContainer">
        {/* Barre de navigation en haut */}
        <Navbar />
        
        {/* Section des widgets d'indicateurs clés */}
        <div className="widgets">
          <Widget type="employées" />
          <Widget type="stations" />
          <Widget type="precipitations" />
          <Widget type="humidite" />
        </div>
        
        {/* Section des graphiques et éléments en vedette */}
        <div className="charts">
          <Featured />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>
        
        {/* Section liste des dernières observations */}
        <div className="listContainer">
          <div className="listTitle">Derniers Observations</div>
          <Table />
        </div>
      </div>
    </div>
  );
};

export default Home;
