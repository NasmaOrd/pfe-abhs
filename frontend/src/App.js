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

// Vérifie si l'utilisateur est authentifié
const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

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
            {/* Page d'accueil */}
            <Route index element={auth ? <Home /> : <Navigate to="/login" />} />

            {/* Page de login */}
            <Route path="login" element={auth ? <Navigate to="/" /> : <Login />} />

            {/* Utilisateurs */}
            <Route path="users">
              <Route index element={auth ? <List /> : <Navigate to="/login" />} />
              <Route path=":userId" element={auth ? <Single /> : <Navigate to="/login" />} />
              <Route path="new" element={auth ? <New inputs={userInputs} /> : <Navigate to="/login" />} />
            </Route>

            {/* Produits */}
            <Route path="products">
              <Route index element={auth ? <List /> : <Navigate to="/login" />} />
              <Route path=":productId" element={auth ? <Single /> : <Navigate to="/login" />} />
              <Route path="new" element={auth ? <New inputs={productInputs} title="Add New Product" /> : <Navigate to="/login" />} />
            </Route>

            {/* Routes personnalisées */}
            <Route path="data" element={auth ? <Data /> : <Navigate to="/login" />} />
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
