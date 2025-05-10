import "./login.scss";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Utilisation de useNavigate dans React Router v6

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Pour la redirection après la connexion réussie

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Envoi des données au backend pour validation
      const response = await axios.post("https://pfe-abhs.vercel.app/api/auth/login", {
        email,
        password,
      });

      // Si la connexion est réussie, on récupère le token et on le stocke
      const { token } = response.data;
      localStorage.setItem("authToken", token);

      // Rediriger vers la page d'accueil ou une page protégée
      navigate("/"); // Utilisation de navigate pour la redirection
    } catch (error) {
      setError("Erreur de connexion. Vérifiez vos informations.");
    }
  };

  return (
    <div className="login">
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Se connecter</button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
