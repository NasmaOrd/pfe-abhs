import "./login.scss";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Hook pour la navigation en React Router v6

/**
 * Composant Login
 * 
 * Interface de connexion utilisateur.
 * 
 * Fonctionnalités :
 * - Saisie de l'email et du mot de passe
 * - Envoi d'une requête POST à l'API d'authentification
 * - Gestion du token JWT retourné et stockage dans localStorage
 * - Redirection vers la page d'accueil en cas de succès
 * - Affichage d'un message d'erreur en cas d'échec
 * 
 * @component
 * 
 * @returns {JSX.Element} Composant React affichant le formulaire de connexion.
 */
const Login = () => {
  // États pour gérer les inputs et le message d'erreur
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Pour rediriger après connexion réussie

  /**
   * Gestionnaire de la soumission du formulaire de connexion.
   * Envoie les identifiants à l'API, récupère le token JWT,
   * le stocke dans localStorage, et redirige l'utilisateur.
   * En cas d'erreur, affiche un message.
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - L'événement de soumission du formulaire
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Requête POST vers l'API d'authentification
      const response = await axios.post("https://pfe-abhs.vercel.app/api/auth/login", {
        email,
        password,
      });

      // Récupération du token JWT retourné par le serveur
      const { token } = response.data;

      // Stockage du token dans localStorage pour les requêtes ultérieures
      localStorage.setItem("authToken", token);

      // Redirection vers la page d'accueil après connexion
      navigate("/stations");
    } catch (error) {
      // En cas d'erreur, affichage d'un message à l'utilisateur
      setError("Erreur de connexion. Vérifiez vos informations.");
    }
  };

  return (
    <div className="login">
  <div className="login-box">
    <h2>Connexion</h2>

    <form onSubmit={handleLogin}>
      <div>
        <label>Email :</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Mot de passe :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit">Se connecter</button>
    </form>

    <p className="reset-link">
      <Link to="/demande-reinitialisation">Mot de passe oublié ?</Link>
    </p>

    {error && <p className="error">{error}</p>}
  </div>
</div>

  );
};

export default Login;
