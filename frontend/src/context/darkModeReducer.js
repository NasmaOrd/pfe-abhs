/**
 * Reducer pour gérer le mode sombre (dark mode)
 * Modifie l'état en fonction de l'action reçue.
 * 
 * @param {Object} state - État actuel
 * @param {boolean} state.darkMode - Indique si le mode sombre est activé
 * @param {Object} action - Action envoyée par dispatch
 * @param {string} action.type - Type d'action ("LIGHT", "DARK", "TOGGLE")
 * @returns {Object} Nouvel état après application de l'action
 */
const DarkModeReducer = (state, action) => {
  switch (action.type) {
    case "LIGHT": {
      return {
        darkMode: false, // Mode clair activé
      };
    }
    case "DARK": {
      return {
        darkMode: true, // Mode sombre activé
      };
    }
    case "TOGGLE": {
      return {
        darkMode: !state.darkMode, // Inverse l'état actuel
      };
    }
    default:
      return state; // Retourne l'état actuel si l'action est inconnue
  }
};

export default DarkModeReducer;
