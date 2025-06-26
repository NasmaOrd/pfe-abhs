import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { MapContainer, TileLayer, GeoJSON, LayersControl, Marker, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./stations.scss";

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Stations = () => {
  const [layers, setLayers] = useState({
    bassin: null,
    regions: null,
    provinces: null,
    stations: null
  });
  const [activeLayers, setActiveLayers] = useState({
    bassin: true,
    regions: true,
    provinces: true,
    stations: true
  });

  useEffect(() => {
    const loadLayers = async () => {
      try {
        const responses = await Promise.all([
          fetch("/sebou_reprojected_wgs84.json"),
          fetch("/Limites_des_régions.geojson"),
          fetch("/Limite_des_provinces.geojson"),
          fetch("/Station_Hydrologique.geojson")
        ]);

        const jsonData = await Promise.all(responses.map(async (res, i) => {
          if (!res.ok) throw new Error(`Erreur ${res.status} sur le fichier ${i}`);
          return await res.json();
        }));

        setLayers({
          bassin: jsonData[0],
          regions: jsonData[1],
          provinces: jsonData[2],
          stations: jsonData[3]
        });
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    };

    loadLayers();
  }, []);

  const layerStyles = {
    bassin: {
      color: "#3498db",
      weight: 4,
      fillOpacity: 0.3,
      fillColor: "#3498db",
      interactive: true
    },
    regions: {
      color: "#e74c3c",
      weight: 3,
      fillOpacity: 0.2,
      fillColor: "#e74c3c",
      interactive: true
    },
    provinces: {
      color: "#2ecc71",
      weight: 2,
      fillOpacity: 0.15,
      fillColor: "#2ecc71",
      interactive: true
    }
  };

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const formatNumber = (num) => {
    return num ? new Intl.NumberFormat('fr-FR').format(num) : 'N/A';
  };

  const getProvincePopupContent = (properties) => {
    return `
      <div class="custom-popup">
        <h3>${properties.Province || 'Province inconnue'}</h3>
        <p><strong>Superficie:</strong> ${formatNumber(properties.Superficie)} km²</p>
        <p><strong>Population:</strong> ${formatNumber(properties.Population)}</p>
        ${properties.Shape_Area ? `<p><strong>Surface totale:</strong> ${formatNumber(Math.round(properties.Shape_Area / 10000))} ha</p>` : ''}
        ${properties.percent ? `<p><strong>Couverture:</strong> ${(properties.percent * 100).toFixed(2)}%</p>` : ''}
      </div>
    `;
  };

  const getRegionPopupContent = (properties) => {
    return `
      <div class="custom-popup">
        <h3>${properties.Nom_de_ré || properties.FIRST_Rég || 'Région inconnue'}</h3>
        <p><strong>Population (2014):</strong> ${formatNumber(properties.Pop14)}</p>
        <p><strong>Taux d'urbanisation:</strong> ${properties.TxUrb14 ? properties.TxUrb14.toFixed(2) + '%' : 'N/A'}</p>
        <p><strong>Superficie:</strong> ${properties.Surface ? formatNumber(properties.Surface) + ' km²' : 'N/A'}</p>
      </div>
    `;
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="stations-content">
        <h2>Visualisation du Bassin du Sebou</h2>

        <div className="map-controls">
          {Object.keys(layers).map(layer => (
            layers[layer] && (
              <label key={layer}>
                <input
                  type="checkbox"
                  checked={activeLayers[layer]}
                  onChange={() => toggleLayer(layer)}
                />
                {layer === 'bassin' ? 'BASSIN' :
                  layer === 'regions' ? 'RÉGIONS' :
                  layer === 'provinces' ? 'PROVINCES' : 'STATIONS HYDROLOGIQUES'}
              </label>
            )
          ))}
        </div>

        <div className="map-wrapper">
          <MapContainer
            center={[34.1, -5.1]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
            minZoom={7}
            maxZoom={14}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <LayersControl position="topright">
              {layers.bassin && activeLayers.bassin && (
                <LayersControl.Overlay name="Bassin" checked>
                  <GeoJSON
                    data={layers.bassin}
                    style={layerStyles.bassin}
                    onEachFeature={(feature, layer) => {
                      layer.bindTooltip("Bassin du Sebou", { permanent: false, direction: 'top', className: 'map-tooltip' });
                      layer.bindPopup("<b>Bassin du Sebou</b>");
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {layers.regions && activeLayers.regions && (
                <LayersControl.Overlay name="Régions" checked>
                  <GeoJSON
                    data={layers.regions}
                    style={layerStyles.regions}
                    onEachFeature={(feature, layer) => {
                      const name = feature.properties?.Nom_de_ré || feature.properties?.FIRST_Rég || "Région";
                      layer.bindTooltip(name, { permanent: false, direction: 'top', className: 'map-tooltip' });
                      layer.bindPopup(getRegionPopupContent(feature.properties));
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {layers.provinces && activeLayers.provinces && (
                <LayersControl.Overlay name="Provinces" checked>
                  <GeoJSON
                    data={layers.provinces}
                    style={layerStyles.provinces}
                    onEachFeature={(feature, layer) => {
                      const name = feature.properties?.Province || "Province";
                      layer.bindTooltip(name, { permanent: false, direction: 'top', className: 'map-tooltip' });
                      layer.bindPopup(getProvincePopupContent(feature.properties));
                    }}
                  />
                </LayersControl.Overlay>
              )}

              {/* STATIONS HYDROLOGIQUES */}
              {layers.stations && activeLayers.stations && (
                <LayersControl.Overlay name="Stations Hydrologiques" checked>
                  <div>
                    {layers.stations.features.map((feature, idx) => {
                      const [lon, lat] = feature.geometry.coordinates;
                      const name = feature.properties?.Name || "Station inconnue";
                      const type = feature.properties?.Descript || "Type inconnu";
                      return (
                        <Marker key={idx} position={[lat, lon]}>
                          <Tooltip direction="top" offset={[0, -10]}>{name}</Tooltip>
                          <Popup>
                            <b>{name}</b><br />
                            <i>{type}</i>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </div>
                </LayersControl.Overlay>
              )}
            </LayersControl>
          </MapContainer>
        </div>
      </main>
    </div>
  );
};

export default Stations;
