import { createContext, useReducer } from "react";
import DarkModeReducer from "./darkModeReducer";

/**
 * État initial du contexte DarkMode
 * @constant {Object}
 * @property {boolean} darkMode - indique si le mode sombre est activé ou non
 */
const INITIAL_STATE = {
  darkMode: false,
};

/**
 * Création du contexte DarkMode avec l'état initial
 * Ce contexte permet de partager la gestion du mode sombre dans toute l'application
 */
export const DarkModeContext = createContext(INITIAL_STATE);

/**
 * Fournisseur de contexte pour DarkMode
 * Utilise useReducer avec le reducer DarkModeReducer pour gérer les changements d'état
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Les composants enfants enveloppés par ce provider
 * @returns {JSX.Element} Provider qui enveloppe les enfants avec le contexte DarkMode
 */
export const DarkModeContextProvider = ({ children }) => {
  // useReducer renvoie l'état actuel et la fonction dispatch pour envoyer des actions
  const [state, dispatch] = useReducer(DarkModeReducer, INITIAL_STATE);

  return (
    <DarkModeContext.Provider value={{ darkMode: state.darkMode, dispatch }}>
      {children}
    </DarkModeContext.Provider>
  );
};
