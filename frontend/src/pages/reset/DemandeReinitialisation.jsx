import { useState } from "react";
import axios from "axios";
import "./DemandeReinitialisation.scss";

const DemandeReinitialisation = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("https://pfe-abhs.vercel.app/api/auth/request-reset", { email });
    setMsg(res.data.message || "Demande envoyée.");
  };

  return (
    <div className="reset-request">
      <div className="reset-box">
        <div className="reset-header">
          <h2>Demande de réinitialisation</h2>
          <img src="/logo.png" alt="Logo ABHS" />
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Envoyer la demande</button>
        </form>
        {msg && <div className="success-msg">{msg}</div>}
      </div>
    </div>
  );
};

export default DemandeReinitialisation;
