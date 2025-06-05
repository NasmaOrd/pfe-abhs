import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";

/**
 * Composant React affichant un résumé des précipitations sous forme de widget visuel.
 * Il comprend un graphique circulaire, une mesure journalière et des comparaisons avec des périodes antérieures.
 *
 * @component
 * @returns {JSX.Element} Un widget de synthèse sur les taux de précipitations.
 */
const Featured = () => {
  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Taux de précipitations</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          {/* Graphique circulaire indiquant 70% de réalisation */}
          <CircularProgressbar value={70} text={"70%"} strokeWidth={5} />
        </div>
        <p className="title">Précipitations journalières</p>
        <p className="amount">14 mm</p>
        <p className="desc">
          Données issues des dernières mesures. Les valeurs peuvent ne pas être totalement à jour.
        </p>

        <div className="summary">
          {/* Comparaison avec l'objectif mensuel */}
          <div className="item">
            <div className="itemTitle">Objectif mensuel</div>
            <div className="itemResult negative">
              <KeyboardArrowDownIcon fontSize="small" />
              <div className="resultAmount">-8%</div>
            </div>
          </div>

          {/* Comparaison avec la semaine précédente */}
          <div className="item">
            <div className="itemTitle">Semaine dernière</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">+15%</div>
            </div>
          </div>

          {/* Comparaison avec le mois précédent */}
          <div className="item">
            <div className="itemTitle">Mois dernier</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">+25%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
