import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { employeeColumns, employeeRows } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useState } from "react";

/**
 * Composant React représentant une table de gestion des employés.
 * Utilise MUI DataGrid pour afficher les données des employés avec actions personnalisées.
 *
 * @component
 * @returns {JSX.Element} Une table interactive permettant de visualiser, ajouter et supprimer des employés.
 */
const Datatable = () => {
  /**
   * État local contenant les données des employés affichés.
   * @type {[Array<Object>, Function]}
   */
  const [data, setData] = useState(employeeRows);

  /**
   * Supprime un employé de la table en filtrant par ID.
   *
   * @param {number|string} id - L'identifiant de l'employé à supprimer.
   */
  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  /**
   * Colonne d'actions personnalisée pour la table (voir / supprimer).
   * @type {Array<Object>}
   */
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/employees/${params.row.id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">Voir</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Supprimer
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Ajouter un Employé
        <Link to="/employees/new" className="link">
          Nouveau
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={employeeColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
    </div>
  );
};

export default Datatable;
