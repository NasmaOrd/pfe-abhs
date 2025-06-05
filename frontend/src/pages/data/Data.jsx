import "./data.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { useState } from "react";

/**
 * Composant Data
 * 
 * Permet d'importer un fichier CSV ou Excel, d'en extraire les données,
 * puis d'afficher ces données sous forme de tableau.
 * 
 * Fonctionnalités principales :
 * - Upload d'un fichier CSV, XLSX ou XLS
 * - Parsing des données via PapaParse (CSV) ou XLSX (Excel)
 * - Affichage dynamique des colonnes et des lignes extraites
 * 
 * @component
 * @returns {JSX.Element} Composant React pour l'import et la visualisation de données tabulaires
 */
const Data = () => {
  // État pour stocker les données extraites du fichier (tableau d'objets)
  const [tableData, setTableData] = useState([]);
  // État pour stocker les noms de colonnes à afficher dans le tableau
  const [columns, setColumns] = useState([]);

  /**
   * Gestionnaire d'import de fichier (CSV ou Excel)
   * @param {React.ChangeEvent<HTMLInputElement>} e - Événement de changement sur l'input fichier
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      // Lecture et parsing du CSV via PapaParse
      reader.onload = (event) => {
        const parsed = Papa.parse(event.target.result, {
          header: true,
          skipEmptyLines: true,
        });
        setTableData(parsed.data);
        setColumns(Object.keys(parsed.data[0] || {}));
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // Lecture du fichier Excel avec XLSX
      reader.onload = (event) => {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        setTableData(jsonData);
        setColumns(Object.keys(jsonData[0] || {}));
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Type de fichier non supporté !");
    }
  };

  return (
    <div className="data">
      {/* Sidebar de navigation */}
      <Sidebar />
      
      {/* Conteneur principal */}
      <div className="dataContainer">
        {/* Barre de navigation en haut */}
        <Navbar />

        {/* Section d'upload de fichier */}
        <div className="uploadSection">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
          />
        </div>

        {/* Prévisualisation du fichier chargé sous forme de tableau */}
        <div className="filePreview">
          {tableData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucun fichier chargé</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Data;
