import "./stations.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

/**
 * Composant Stations
 * 
 * Affiche la page des stations hydrologiques avec :
 * - Une barre latérale (Sidebar)
 * - Une barre de navigation (Navbar)
 * - Un titre principal
 * - Une carte simple représentant une station avec ses informations (coordonnées, type, etc.)
 * 
 * Ce composant peut être étendu pour afficher plusieurs stations dynamiquement.
 */
const Stations = () => {
  return (
    <div className="stations">
      {/* Barre latérale de navigation */}
      <Sidebar />

      <div className="stationsContainer">
        {/* Barre de navigation en haut */}
        <Navbar />

        {/* Titre de la page */}
        <h2>Stations Hydrologiques</h2>

        {/* Carte d'une station avec ses détails */}
        <div className="stationCard">
          <div className="stationTitle">Station A</div>
          <p>Coordonnées, type, etc.</p>
        </div>
      </div>
    </div>
  );
};

export default Stations;
