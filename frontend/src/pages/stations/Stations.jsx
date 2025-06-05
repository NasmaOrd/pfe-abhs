import "./stations.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const Stations = () => {
  return (
    <div className="stations">
      <Sidebar />
      <div className="stationsContainer">
        <Navbar />
        <h2>Stations Hydrologiques</h2>
        <div className="stationCard">
          <div className="stationTitle">Station A</div>
          <p>Coordonnées, type, etc.</p>
        </div>
      </div>
    </div>
  );
};

export default Stations;
