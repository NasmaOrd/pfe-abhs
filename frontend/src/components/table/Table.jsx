import "./table.scss"; // Styles spécifiques à ce composant tableau
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

/**
 * Composant List affichant un tableau de stations météo.
 * Chaque ligne contient des informations sur une station, son observateur,
 * les précipitations mesurées, la méthode utilisée et le statut de validation.
 *
 * @component
 * @returns {JSX.Element} Un tableau complet des données météo.
 */
const List = () => {
  // Données simulées représentant plusieurs stations météo
  const rows = [
    {
      id: "ST-0001",
      station: "Station Aïn Sebaâ",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Weather_station.jpg/320px-Weather_station.jpg",
      observer: "Youssef El Idrissi",
      date: "28 Avril",
      amount: 42,
      method: "Pluviomètre manuel",
      status: "Validé",
    },
    {
      id: "ST-0002",
      station: "Station Kénitra",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Meteorological_station_-_NOAA.jpg/320px-Meteorological_station_-_NOAA.jpg",
      observer: "Salma Ait Omar",
      date: "28 Avril",
      amount: 18,
      method: "Capteur automatique",
      status: "En attente",
    },
    {
      id: "ST-0003",
      station: "Station Fès",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Automatic_weather_station.jpg/320px-Automatic_weather_station.jpg",
      observer: "Nabil Hamdane",
      date: "28 Avril",
      amount: 55,
      method: "Capteur automatique",
      status: "Validé",
    },
    {
      id: "ST-0004",
      station: "Station Oujda",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Weather_station_piedmont.jpg/320px-Weather_station_piedmont.jpg",
      observer: "Meryem Bekkali",
      date: "28 Avril",
      amount: 0,
      method: "Pluviomètre manuel",
      status: "En attente",
    },
    {
      id: "ST-0005",
      station: "Station Settat",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Weather_station.jpg/320px-Weather_station.jpg",
      observer: "Rachid Khouya",
      date: "28 Avril",
      amount: 12,
      method: "Capteur automatique",
      status: "Validé",
    },
  ];

  return (
    <TableContainer component={Paper} className="table">
      {/* Table Material UI avec un label accessible */}
      <Table sx={{ minWidth: 650 }} aria-label="table de données météo">
        {/* En-tête du tableau */}
        <TableHead>
          <TableRow>
            <TableCell className="tableCell">ID Station</TableCell>
            <TableCell className="tableCell">Station</TableCell>
            <TableCell className="tableCell">Observateur</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Précipitations (mm)</TableCell>
            <TableCell className="tableCell">Méthode</TableCell>
            <TableCell className="tableCell">Statut</TableCell>
          </TableRow>
        </TableHead>

        {/* Corps du tableau */}
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="tableCell">{row.id}</TableCell>
              <TableCell className="tableCell">
                {/* Affichage de l'image et du nom de la station côte à côte */}
                <div className="cellWrapper">
                  <img src={row.img} alt={`Image de ${row.station}`} className="image" />
                  {row.station}
                </div>
              </TableCell>
              <TableCell className="tableCell">{row.observer}</TableCell>
              <TableCell className="tableCell">{row.date}</TableCell>
              <TableCell className="tableCell">{row.amount}</TableCell>
              <TableCell className="tableCell">{row.method}</TableCell>
              <TableCell className="tableCell">
                {/* Statut avec coloration dynamique selon validation */}
                <span className={`status ${row.status === "Validé" ? "Approved" : "Pending"}`}>
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default List;
