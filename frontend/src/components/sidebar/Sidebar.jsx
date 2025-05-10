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

const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);
  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">AHBS </span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">PRINCIPAL</p>
          <li>
            <DashboardIcon className="icon" />
            <span>Tableau de bord</span>
          </li>

          <p className="title">GESTION</p>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <li>
              <PeopleAltIcon className="icon" />
              <span>Employés</span>
            </li>
          </Link>
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
          <Link to="/modele" style={{ textDecoration: "none" }}>
            <li>
              <FunctionsIcon className="icon" />
              <span>Modèle de simulation</span>
            </li>
          </Link>

          <p className="title">UTILITAIRE</p>
          <li>
            <InsightsIcon className="icon" />
            <span>Statistiques</span>
          </li>
          <li>
            <NotificationsActiveIcon className="icon" />
            <span>Alertes</span>
          </li>

          <p className="title">SYSTÈME</p>
          <li>
            <SensorsIcon className="icon" />
            <span>État des capteurs</span>
          </li>
          <li>
            <HistoryIcon className="icon" />
            <span>Historique</span>
          </li>
          <li>
            <SettingsIcon className="icon" />
            <span>Paramètres</span>
          </li>

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
      <div className="bottom">
        <div className="colorOption" onClick={() => dispatch({ type: "LIGHT" })}></div>
        <div className="colorOption" onClick={() => dispatch({ type: "DARK" })}></div>
      </div>
    </div>
  );
};

export default Sidebar;
