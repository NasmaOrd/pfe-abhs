import "./sidebar.scss";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MapIcon from "@mui/icons-material/Map";
import PlaceIcon from "@mui/icons-material/Place";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { Link, useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useEffect } from "react";

/**
 * Sidebar de navigation avec déconnexion sécurisée.
 */
const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const navigate = useNavigate();

  /**
   * Déconnexion manuelle avec confirmation.
   */
  const handleLogout = () => {
    const confirmed = window.confirm("Voulez-vous vous déconnecter ?");
    if (confirmed) {
      localStorage.removeItem("authToken");
      navigate("https://pfe-abhs.web.app/login");
    }
  };

  /**
   * Déconnexion automatique à la fermeture de l’onglet.
   */
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("authToken");
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/stations" style={{ textDecoration: "none" }}>
          <img src="/logo.png" alt="Logo ABHS" className="logo-img" />
        </Link>
      </div>

      <div className="center">
        <ul>
          <p className="title">NAVIGATION</p>

          <li>
            <Link to="/province" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <LocationCityIcon className="icon" />
              <span>Province</span>
            </Link>
          </li>

          <li>
            <Link to="/station" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <PlaceIcon className="icon" />
              <span>Station</span>
            </Link>
          </li>

          <li>
            <Link to="/region" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <MapIcon className="icon" />
              <span>Région</span>
            </Link>
          </li>

          <li>
            <Link to="/alertes-reset" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <NotificationsIcon className="icon" />
              <span>Alertes</span>
            </Link>
          </li>

          <li className="logout-btn" onClick={handleLogout}>
            <ExitToAppIcon className="icon" />
            <span>Déconnexion</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
