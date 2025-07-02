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

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const supprimer = async (email) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/alertes/${email}`);
      setMessage(`🗑️ ${res.data.message || "Demande supprimée avec succès."}`);
      setMessageType("success");
      setDemandes(demandes.filter(d => d.email !== email));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      const msg = error.response?.data?.error || "❌ Erreur lors de la suppression.";
      setMessage(msg);
      setMessageType("error");
    }

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

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {demandes.length === 0 ? (
          <p>Aucune demande en attente.</p>
        ) : (
          <table className="demandes-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d, i) => (
                <tr key={i}>
                  <td>{d.email}</td>
                  <td>
                    <button onClick={() => approuver(d.email)}>Approuver</button>
                    <button onClick={() => supprimer(d.email)} style={{ marginLeft: "10px", backgroundColor: "#dc3545", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px" }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default AlertesReset;
