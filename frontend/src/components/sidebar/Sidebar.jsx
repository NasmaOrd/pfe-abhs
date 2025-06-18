import "./sidebar.scss";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MapIcon from "@mui/icons-material/Map";
import PlaceIcon from "@mui/icons-material/Place";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";

/**
 * Sidebar de navigation principale avec logo image.
 */
const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);

  return (
    <div className="sidebar">
      {/* Logo image au lieu du texte */}
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

          <li>
            <ExitToAppIcon className="icon" />
            <span>Déconnexion</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
