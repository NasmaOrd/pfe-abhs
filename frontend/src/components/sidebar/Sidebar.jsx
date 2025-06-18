import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TimelineIcon from "@mui/icons-material/Timeline";
import FunctionsIcon from "@mui/icons-material/Functions";
import InsightsIcon from "@mui/icons-material/Insights";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SensorsIcon from "@mui/icons-material/Sensors";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";

/**
 * Composant Sidebar représentant la barre latérale de navigation.
 * Contient des liens vers différentes sections de l'application AHBS.
 * Permet également de changer le thème (clair/sombre).
 *
 * @component
 * @returns {JSX.Element} La barre latérale de l'application.
 */
const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext); // Accès à la gestion du mode sombre

  return (
    <div className="sidebar">
      {/* Logo en haut */}
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">AHBS </span>
        </Link>
      </div>
      <hr />

      {/* Section centrale contenant les menus */}
      <div className="center">
        <ul>
          {/* Section PRINCIPAL */}
          <p className="title">PRINCIPAL</p>
          <li>
            <DashboardIcon className="icon" />
            <span>Tableau de bord</span>
          </li>

          {/* Section GESTION */}
          <p className="title">GESTION</p>
          <Link to="/stations" style={{ textDecoration: "none" }}>
            <li>
              <WaterDropIcon className="icon" />
              <span>Stations hydro.</span>
            </li>
          </Link>
          <Link to="/data" style={{ textDecoration: "none" }}>
            <li>
              <UploadFileIcon className="icon" />
              <span>Données CSV</span>
            </li>
          </Link>
          <Link to="/analyses" style={{ textDecoration: "none" }}>
            <li>
              <TimelineIcon className="icon" />
              <span>Analyses mensuelles</span>
            </li>
          </Link>
          <Link to="/visualisation" style={{ textDecoration: "none" }}>
            <li>
              <FunctionsIcon className="icon" />
              <span>Modèle de simulation</span>
            </li>
          </Link>

          {/* Section UTILITAIRE */}
          <p className="title">UTILITAIRE</p>
          <li>
            <InsightsIcon className="icon" />
            <span>Statistiques</span>
          </li>
          <li>
            <NotificationsActiveIcon className="icon" />
            <span>Alertes</span>
          </li>

          {/* Section SYSTÈME */}
          <p className="title">SYSTÈME</p>
          <li>
            <SettingsIcon className="icon" />
            <span>Paramètres</span>
          </li>

          {/* Section UTILISATEUR */}
          <p className="title">UTILISATEUR</p>
          <li>
            <AccountCircleOutlinedIcon className="icon" />
            <span>Profil</span>
          </li>
          <li>
            <ExitToAppIcon className="icon" />
            <span>Déconnexion</span>
          </li>
        </ul>
      </div>

      {/* Choix du thème (clair ou sombre) */}
    </div>
  );
};

export default Sidebar;
