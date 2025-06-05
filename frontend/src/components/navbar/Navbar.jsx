import "./navbar.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";

/**
 * Composant Navbar affichant la barre de navigation supérieure.
 * Comprend des icônes interactives (recherche, mode sombre, notifications, messages, etc.)
 * et une image d'utilisateur (avatar).
 *
 * Utilise le contexte DarkModeContext pour activer/désactiver le thème sombre.
 *
 * @component
 * @returns {JSX.Element} La barre de navigation principale de l'application.
 */
const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext); // Permet de basculer entre les thèmes

  return (
    <div className="navbar">
      <div className="wrapper">
        {/* Champ de recherche */}
        <div className="search">
          <input type="text" placeholder="Search..." />
          <SearchOutlinedIcon />
        </div>

        {/* Ensemble des icônes */}
        <div className="items">
          {/* Bouton pour activer/désactiver le mode sombre */}
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => dispatch({ type: "TOGGLE" })}
            />
          </div>

          {/* Icône de plein écran */}
          <div className="item">
            <FullscreenExitOutlinedIcon className="icon" />
          </div>

          {/* Icône de notifications avec badge */}
          <div className="item">
            <NotificationsNoneOutlinedIcon className="icon" />
            <div className="counter">1</div>
          </div>

          {/* Icône de messages avec badge */}
          <div className="item">
            <ChatBubbleOutlineOutlinedIcon className="icon" />
            <div className="counter">2</div>
          </div>

          {/* Icône de menu déroulant */}
          <div className="item">
            <ListOutlinedIcon className="icon" />
          </div>

          {/* Avatar utilisateur */}
          <div className="item">
            <img
              src="https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
              alt=""
              className="avatar"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
