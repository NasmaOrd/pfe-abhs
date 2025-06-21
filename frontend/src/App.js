import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import Analyses from "./pages/analyses/Analyses";
import Modele from "./pages/modele/Modele";
import Stations from "./pages/stations/Stations";
import Data from "./pages/data/Data";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { productInputs, userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext, useState, useEffect } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import DataSearchPage from "./pages/datasearchpage/DataSearchPage";
import HydroFilter from "./pages/station/HydroFilter";
import HydroFilterProvince from "./pages/province/HydroFilterProvince";
import HydroFilterRegion from "./pages/region/HydroFilterRegion";
import AlertesReset from "./pages/reset/AlertesReset";
import DemandeReinitialisation from "./pages/reset/DemandeReinitialisation";
import ResetPassword from "./pages/reset/ResetPassword";
import UserList from "./pages/userlist/UserList";

/**
 * @file App.jsx
 * @description
 * Application web React pour la gestion des données hydrologiques et pluviométriques,
 * incluant des pages d'analyse, de gestion des utilisateurs, des produits, des stations,
 * et des données importées.
 * 
 * Fonctionnalités principales :
 * - Authentification basique via un token stocké dans localStorage.
 * - Mode sombre / clair via contexte React.
 * - Navigation protégée par authentification avec redirections conditionnelles.
 * - Gestion des routes pour utilisateurs, produits, analyses, données et autres modules.
 * 
 * Technologies utilisées :
 * - React avec React Router pour le routage.
 * - Contexte React pour le mode sombre.
 * - Stockage local pour la gestion d'authentification.
 */

/**
 * Vérifie si un utilisateur est authentifié
 * 
 * @returns {boolean} true si un token d'authentification est présent dans localStorage, false sinon
 */
const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

/**
 * Composant principal de l'application
 * 
 * @component
 * @returns {JSX.Element} L'application React avec le système de routage et d'authentification
 */
function App() {
  const { darkMode } = useContext(DarkModeContext);
  const [auth, setAuth] = useState(isAuthenticated());

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            {/* Page d'accueil 
            <Route index element={auth ? <Stations/> : <Navigate to="/login" />} />*/
            }
            <Route path="stations" element={<Stations />} />
            

            {/* Page de login */}
            <Route path="login" element={auth ? <Navigate to="/" /> : <Login />} />

            {/* Gestion des utilisateurs */}
            <Route path="users">
              <Route index element={auth ? <List /> : <Navigate to="/login" />} />
              <Route path=":userId" element={auth ? <Single /> : <Navigate to="/login" />} />
              <Route path="new" element={auth ? <New inputs={userInputs} /> : <Navigate to="/login" />} />
            </Route>

            {/* Gestion des produits */}
            <Route path="products">
              <Route index element={auth ? <List /> : <Navigate to="/login" />} />
              <Route path=":productId" element={auth ? <Single /> : <Navigate to="/login" />} />
              <Route path="new" element={auth ? <New inputs={productInputs} title="Add New Product" /> : <Navigate to="/login" />} />
            </Route>

            {/* Routes personnalisées pour les modules spécifiques */}
            <Route path="data" element={auth ? <Data /> : <Navigate to="/login" />} />
             <Route path="visualisation" element={<DataSearchPage />} />
             <Route path="station" element={<HydroFilter />} />
              <Route path="province" element={<HydroFilterProvince />} />
              <Route path="region" element={<HydroFilterRegion />} />
              <Route path="alertes-reset" element={<AlertesReset />} />
              <Route path="demande-reinitialisation" element={<DemandeReinitialisation />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/user-list" element={<UserList />} />
            <Route path="stations" element={auth ? <Stations /> : <Navigate to="/login" />} />
            <Route path="analyses" element={auth ? <Analyses /> : <Navigate to="/login" />} />
            <Route path="modele" element={auth ? <Modele /> : <Navigate to="/login" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
