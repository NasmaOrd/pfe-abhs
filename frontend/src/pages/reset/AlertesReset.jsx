import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import "./AlertesReset.scss";


const AlertesReset = () => {
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/alertes").then(res => setDemandes(res.data));
  }, []);

  const approuver = async (email) => {
    await axios.post("https://pfe-abhs.vercel.app/api/auth/approve-reset", { email });
    alert("Email envoyé.");
    setDemandes(demandes.filter(d => d.email !== email));
  };

  return (
    <div className="app-container">
  <Sidebar />
  <main style={{ flex: 1 }}>
    <h2>Demandes de réinitialisation</h2>
    <ul>
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
