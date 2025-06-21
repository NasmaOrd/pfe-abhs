import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./stations.scss";

// Fix icônes Leaflet (safe même si pas de marker ici)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
    <div className="app-container">
      <Sidebar />
      <main className="stations-content">
        <h2>Bassin du Sebou - Stations Hydrologiques</h2>

        <div className="map-wrapper">
          <MapContainer
            center={[34.1, -5.1]}
            zoom={9}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoJsonData && (
              <GeoJSON
                data={geoJsonData}
                style={{
                  color: "red",
                  weight: 2,
                  fillOpacity: 0.1,
                }}
              />
            )}
          </MapContainer>
        </div>
      </main>
    </div>
  );
};

export default Stations;
