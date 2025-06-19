import React, { useEffect, useState } from "react";
import "./stations.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icônes Leaflet (même si pas de marqueur ici, c'est safe)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Stations = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    fetch("/sebou_reprojected_wgs84.json")
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Erreur chargement GeoJSON :", err));
  }, []);

  return (
    <div className="stations">
      <Sidebar />
      <div className="stationsContainer">
        <h2>Bassin du Sebou</h2>
        <div className="mapContainer" style={{ height: "600px", marginTop: "20px" }}>
          <MapContainer center={[34.1, -5.1]} zoom={9} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoJsonData && (
              <GeoJSON
                data={geoJsonData}
                style={{
                  color: "red",
                  weight: 2,
                  fillOpacity: 0.1
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Stations;
