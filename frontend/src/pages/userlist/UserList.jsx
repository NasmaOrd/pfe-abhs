import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import "./UserList.scss";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const disableUser = async (userId) => {
    if (!window.confirm("Confirmer la désactivation de cet utilisateur ?")) return;

    setError("");
    setMessage("");
    try {
      await axios.put(`/api/users/${userId}/disable`);
      setMessage("Utilisateur désactivé avec succès.");
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de la désactivation.");
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="userlist-main">
        <h2>Liste des utilisateurs</h2>

        {loading && <p>Chargement...</p>}
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <table className="userlist-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nom</th>
              <th>Actif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="no-users">Aucun utilisateur trouvé.</td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user._id} className={user.active ? "" : "inactive"}>
                <td>{user.email}</td>
                <td>{user.name || "-"}</td>
                <td>{user.active ? "Oui" : "Non"}</td>
                <td>
                  {user.active ? (
                    <button className="disable-btn" onClick={() => disableUser(user._id)}>
                      Désactiver
                    </button>
                  ) : (
                    <em>Compte désactivé</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default UserList;
