import "./data.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { useState } from "react";

const Data = () => {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
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
      <Sidebar />
      <div className="dataContainer">
        <Navbar />

        <div className="uploadSection">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
          />
        </div>

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
