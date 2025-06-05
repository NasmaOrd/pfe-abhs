import "./modele.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const Modele = () => {
  return (
    <div className="modele">
      <Sidebar />
      <div className="modeleContainer">
        <Navbar />
        <div className="modelForm">
          <h2>Simulation de modèle</h2>
          <div className="formRow">
            <input type="text" placeholder="Paramètre 1" />
            <input type="text" placeholder="Paramètre 2" />
          </div>
          <button>Lancer</button>
        </div>
        <div className="modelResult">
          <h4>Résultat :</h4>
          <p>Graphique ou sortie ici</p>
        </div>
      </div>
    </div>
  );
};

export default Modele;
