import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import "./AlertesReset.scss";

const AlertesReset = () => {
  const [demandes, setDemandes] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" ou "error"

  useEffect(() => {
    axios.get("http://localhost:5000/api/alertes")
      .then(res => setDemandes(res.data))
      .catch(err => {
        console.error("Erreur lors du chargement des demandes :", err);
        setMessage("Erreur lors du chargement des demandes.");
        setMessageType("error");
      });
  }, []);

  const approuver = async (email) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/approve-reset", { email });
      setMessage(`✅ ${res.data.message || "Email envoyé avec succès."}`);
      setMessageType("success");
      setDemandes(demandes.filter(d => d.email !== email));
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
      const msg = error.response?.data?.message || "❌ Utilisateur non trouvé ou erreur serveur.";
      setMessage(msg);
      setMessageType("error");
    }

    // Supprimer le message après 5 secondes
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main style={{ flex: 1, padding: "20px" }}>
        <h2>Demandes de réinitialisation</h2>

        {/* Message d'état */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <ul className="demandes-list">
          {demandes.map((d, i) => (
            <li key={i}>
              {d.email}
              <button onClick={() => approuver(d.email)}>Approuver</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default AlertesReset;
