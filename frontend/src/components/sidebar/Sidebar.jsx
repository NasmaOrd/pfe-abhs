import "./sidebar.scss";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MapIcon from "@mui/icons-material/Map";
import PlaceIcon from "@mui/icons-material/Place";
import LocationCityIcon from "@mui/icons-material/LocationCity";
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
      <hr />

      <div className="center">
        <ul>
          <p className="title">NAVIGATION</p>

          <Link to="/province" style={{ textDecoration: "none" }}>
            <li>
              <LocationCityIcon className="icon" />
              <span>Province</span>
            </li>
          </Link>

          <Link to="/station" style={{ textDecoration: "none" }}>
            <li>
              <PlaceIcon className="icon" />
              <span>Station</span>
            </li>
          </Link>

          <Link to="/region" style={{ textDecoration: "none" }}>
            <li>
              <MapIcon className="icon" />
              <span>Région</span>
            </li>
          </Link>

          <li onClick={handleLogout} style={{ cursor: "pointer" }}>
            <ExitToAppIcon className="icon" />
            <span>Déconnexion</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
