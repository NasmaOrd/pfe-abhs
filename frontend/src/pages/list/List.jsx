import "./list.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable from "../../components/datatable/Datatable";

/**
 * Composant List
 * 
 * Affiche la liste des éléments sous forme de tableau de données.
 * 
 * Structure du composant :
 * - Sidebar : barre latérale de navigation
 * - Navbar : barre de navigation en haut
 * - Datatable : composant principal affichant le tableau des données
 * 
 * @component
 * @returns {JSX.Element} Composant React affichant la liste avec sidebar, navbar et datatable.
 */
const List = () => {
  return (
    <div className="list">
      {/* Barre latérale de navigation */}
      <Sidebar />
      
      {/* Conteneur principal de la page */}
      <div className="listContainer">
        {/* Barre de navigation en haut */}
        <Navbar />
        
        {/* Composant tableau de données */}
        <Datatable />
      </div>
    </div>
  );
};

export default List;
