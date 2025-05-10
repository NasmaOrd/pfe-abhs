import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { productInputs, userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext, useState, useEffect } from "react";
import { DarkModeContext } from "./context/darkModeContext";

// Fonction pour vérifier si l'utilisateur est authentifié
const isAuthenticated = () => {
  return !!localStorage.getItem("authToken"); // Vérifie si le token est présent dans localStorage
};

function App() {
  const { darkMode } = useContext(DarkModeContext);
  const [auth, setAuth] = useState(isAuthenticated()); // Vérifie l'état de l'authentification au chargement de l'application

  // Met à jour l'état de l'authentification si le token change
  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route
              index
              element={auth ? <Home /> : <Navigate to="/login" />} // Redirige vers login si non authentifié
            />
            <Route path="login" element={auth ? <Navigate to="/" /> : <Login />} /> {/* Redirige vers la home si déjà connecté */}

            <Route path="users">
              <Route
                index
                element={auth ? <List /> : <Navigate to="/login" />}
              />
              <Route
                path=":userId"
                element={auth ? <Single /> : <Navigate to="/login" />}
              />
              <Route
                path="new"
                element={auth ? <New inputs={userInputs} /> : <Navigate to="/login" />}
              />
            </Route>

            <Route path="products">
              <Route
                index
                element={auth ? <List /> : <Navigate to="/login" />}
              />
              <Route
                path=":productId"
                element={auth ? <Single /> : <Navigate to="/login" />}
              />
              <Route
                path="new"
                element={auth ? <New inputs={productInputs} title="Add New Product" /> : <Navigate to="/login" />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
