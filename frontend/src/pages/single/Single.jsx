import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";

/**
 * Composant Single
 * 
 * Affiche une vue détaillée d'un utilisateur avec :
 * - Une barre latérale (Sidebar)
 * - Une barre de navigation (Navbar)
 * - Une section supérieure contenant :
 *   - Les informations de l'utilisateur (photo, nom, email, téléphone, adresse, pays)
 *   - Un bouton d'édition
 *   - Un graphique des dépenses utilisateur sur les 6 derniers mois
 * - Une section inférieure affichant la liste des dernières transactions
 * 
 * Ce composant peut être utilisé pour visualiser le profil et les données associées d'un utilisateur.
 * 
 * @component
 * @returns {JSX.Element} Composant React affichant la page utilisateur détaillée.
 */
const Single = () => {
  return (
    <div className="single">
      {/* Barre latérale */}
      <Sidebar />

      <div className="singleContainer">
        {/* Barre de navigation */}
        <Navbar />

        {/* Partie supérieure : informations utilisateur et graphique */}
        <div className="top">
          {/* Colonne de gauche : détails utilisateur */}
          <div className="left">
            <div className="editButton">Edit</div>

            <h1 className="title">Information</h1>

            <div className="item">
              <img
                src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
                alt="User"
                className="itemImg"
              />

              <div className="details">
                <h1 className="itemTitle">Jane Doe</h1>

                <div className="detailItem">
                  <span className="itemKey">Email:</span>
                  <span className="itemValue">janedoe@gmail.com</span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Phone:</span>
                  <span className="itemValue">+1 2345 67 89</span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Address:</span>
                  <span className="itemValue">
                    Elton St. 234 Garden Yd. NewYork
                  </span>
                </div>

                <div className="detailItem">
                  <span className="itemKey">Country:</span>
                  <span className="itemValue">USA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite : graphique des dépenses utilisateur */}
          <div className="right">
            <Chart aspect={3 / 1} title="User Spending ( Last 6 Months)" />
          </div>
        </div>

        {/* Partie inférieure : liste des dernières transactions */}
        <div className="bottom">
          <h1 className="title">Last Transactions</h1>
          <List />
        </div>
      </div>
    </div>
  );
};

export default Single;
