import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { Line, Bar, Pie, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import Sidebar from "../../components/sidebar/Sidebar";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import stations from "../stations/stationdata";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./hydrofilter.scss";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const chartTypeOptions = [
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "radar", label: "Radar" },
];

const HydroFilterRegion = () => {
  const [data, setData] = useState([]);
  const [regionMap, setRegionMap] = useState({});
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const months = ["Sep","Oct","Nov","Déc","Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août"];
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [viewMode, setViewMode] = useState("tableau"); 
  const [comparisonData, setComparisonData] = useState([]);
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [chartTypes, setChartTypes] = useState([{ value: "line", label: "Line" }]);

  const chartRef = useRef(null);
  const mapRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const base = "https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw";
        const key = "AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs";

        const resData = await fetch(`${base}/values/Feuil1!A1:Z4174?key=${key}`);
        const { values: all } = await resData.json();
        const headers = all[0], rows = all.slice(1);
        const json = rows.map(r => {
          const o = {};
          headers.forEach((k,i) => o[k.trim()] = r[i] || "");
          return o;
        });
        setData(json);
        setYears([...new Set(json.map(r => r["Année"]))]);

        const mapRes = await fetch(`${base}/values/Feuil1!AA6:AB52?key=${key}`);
        const { values: mapVals } = await mapRes.json();
        const m = {};
        mapVals.forEach(([prov, reg]) => prov && reg && (m[prov.trim()] = reg.trim()));
        setRegionMap(m);
        setRegions([...new Set(Object.values(m))]);

        const geo = await fetch("/sebou_reprojected_wgs84.json").then(r => r.json());
        setGeoJsonData(geo);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const filterData = () => {
    return data.filter(r => {
      const prov = r["Province:"], reg = regionMap[prov] || "";
      return (!selectedRegion || reg === selectedRegion)
        && (selectedYears.length === 0 || selectedYears.includes(r["Année"]));
    });
  };
  const filtered = filterData();

  const chartData = {
    labels: filtered.map(r => r["Année"]),
    datasets: selectedMonths.map((m,idx)=>({
      label: m,
      data: filtered.map(r => parseFloat(r[m])||0),
      backgroundColor: `hsla(${idx*45},70%,50%,0.5)`,
      borderColor: `hsl(${idx*45},70%,50%)`,
      borderWidth:2,
      tension:0.3,
      pointRadius:4,
      pointHoverRadius:6,
      fill: chartTypes.some(ct=>ct.value!=="line")
    }))
  };

  const filteredStations = selectedRegion
    ? stations.filter(s => regionMap[s.province] === selectedRegion)
    : stations;

  const renderChart = (type) => {
    const title = `Graphique ${type.charAt(0).toUpperCase()+type.slice(1)} - ${selectedRegion||"Toutes Régions"}`;
    if(type==="line") return <div key={type} className="chart-container"><h3>{title}</h3><div className="chart-wrapper"><Line data={chartData} options={{responsive:true}} /></div></div>;
    if(type==="bar") return <div key={type} className="chart-container"><h3>{title}</h3><div className="chart-wrapper"><Bar data={chartData} options={{responsive:true}} /></div></div>;
    if(type==="pie") {
      if(selectedMonths.length===0) return <div key={type} className="chart-container"><h3>{title}</h3><p>Sélectionnez des mois pour voir Pie.</p></div>;
      const pie = { labels: filtered.map(r=>r["Année"]), datasets: [{ label:selectedMonths[0], data:filtered.map(r=>parseFloat(r[selectedMonths[0]])||0), backgroundColor:["rgba(255,99,132,0.5)","rgba(54,162,235,0.5)","rgba(255,206,86,0.5)"], borderWidth:1 }] };
      return <div key={type} className="chart-container"><h3>{title}</h3><div className="chart-wrapper"><Pie data={pie} options={{responsive:true}}/></div></div>;
    }
    if(type==="radar") return <div key={type} className="chart-container"><h3>{title}</h3><div className="chart-wrapper"><Radar data={chartData} options={{responsive:true}}/></div></div>;
    return null;
  };

  const generatePDF = async () => {
    const pdf = new jsPDF("p","mm","a4");
    const margin=10;
    let y=20;
    pdf.setFontSize(20); pdf.text("Rapport Hydrologique Région",105,y,{align:"center"}); y+=10;
    pdf.setFontSize(12); pdf.text(`Région: ${selectedRegion||"Toutes"}`, margin, y); y+=6; pdf.text(`Années: ${selectedYears.join(",")||"Toutes"}`, margin,y); y+=6; pdf.text(`Mois: ${selectedMonths.join(",")||"Tous"}`, margin,y); y+=10;
    if(viewMode==="tableau" && tableRef.current){
      const c = await html2canvas(tableRef.current); const img=c.toDataURL("image/png"); const w=pdf.internal.pageSize.getWidth()-2*margin; const h=(c.height*w)/c.width;
      pdf.addImage(img,"PNG",margin,y,w,h); y+=h+5;
    }
    if(viewMode==="graphique" && chartRef.current){
      const charts = chartRef.current.querySelectorAll(".chart-container");
      for(const cont of charts){
        const c = await html2canvas(cont); const img=c.toDataURL("image/png"); const w=pdf.internal.pageSize.getWidth()-2*margin; const h=(c.height*w)/c.width;
        if(y+h>pdf.internal.pageSize.getHeight()-margin){ pdf.addPage(); y=margin;}
        pdf.addImage(img,"PNG",margin,y,w,h); y+=h+5;
      }
    }
    if(viewMode==="carte" && mapRef.current){
      const c = await html2canvas(mapRef.current); const img=c.toDataURL("image/png"); const w=pdf.internal.pageSize.getWidth()-2*margin; const h=(c.height*w)/c.width;
      if(y+h>pdf.internal.pageSize.getHeight()-margin){ pdf.addPage(); y=margin;}
      pdf.addImage(img,"PNG",margin,y,w,h); y+=h+5;
    }
    if(viewMode==="comparaison" && comparisonData.length){
      pdf.addPage(); y=20; pdf.setFontSize(16); pdf.text("Comparaison",105,y,{align:"center"}); y+=8;
      pdf.setFontSize(12); comparisonData.forEach(r=>{
        if(y>pdf.internal.pageSize.getHeight()-20){ pdf.addPage(); y=20;}
        r.forEach((v,i)=>pdf.text(`${v}`,margin+i*40,y));
        y+=6;
      });
    }
    pdf.save(`rapport_region_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="app-container" style={{display:"flex"}}>
      <Sidebar />
      <div className="hydro-filter">
        <h2>Analyse des Données Hydrologiques par Région</h2>

        <div className="action-buttons">
          <button onClick={generatePDF} className="pdf-button">Générer PDF</button>
        </div>

        <div className="tab-navigation">
          {["tableau","graphique","carte"].map(mode=>(
            <button key={mode} className={viewMode===mode?"active":""} onClick={()=>setViewMode(mode)}>
              {mode.charAt(0).toUpperCase()+mode.slice(1)}
            </button>
          ))}
        </div>

        {(viewMode==="tableau"||viewMode==="graphique") && (
          <>
            <div className="filters">
              <Select
                options={regions.map(r=>({value:r,label:r}))}
                onChange={o=>setSelectedRegion(o?.value||null)}
                isClearable placeholder="Choisir une région"
              />
              <Select
                options={years.map(y=>({value:y,label:y}))}
                onChange={arr=>setSelectedYears(arr?.map(a=>a.value)||[])}
                isMulti placeholder="Années"
              />
              <Select
                options={months.map(m=>({value:m,label:m}))}
                onChange={arr=>setSelectedMonths(arr?.map(a=>a.value)||[])}
                isMulti placeholder="Mois"
              />
            </div>

            {viewMode==="tableau" && (
              <div className="data-table" ref={tableRef}>
                <table>
                  <thead>
                    <tr><th>Région</th><th>Province</th><th>Année</th>{selectedMonths.map(m=><th key={m}>{m}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.map((r,i)=>(
                      <tr key={i}>
                        <td>{regionMap[r["Province:"]]}</td>
                        <td>{r["Province:"]}</td>
                        <td>{r["Année"]}</td>
                        {selectedMonths.map(m=><td key={m}>{parseFloat(r[m])?.toFixed(1)||"-"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode==="graphique" && (
              <div ref={chartRef}>
                <Select
                  options={chartTypeOptions}
                  value={chartTypes}
                  onChange={setChartTypes}
                  isMulti placeholder="Choisir type(s) de graphiques"
                />
                <div className="chart-section">
                  {chartTypes.length
                    ? chartTypes.map(ct=>renderChart(ct.value))
                    : <p>Sélectionnez au moins un type de graphique.</p>}
                </div>
              </div>
            )}
          </>
        )}

        {viewMode==="carte" && (
          <div ref={mapRef} className="mapContainer" style={{height:"600px"}}>
            <MapContainer center={[34.1,-5.1]} zoom={9} style={{height:"100%",width:"100%"}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              {geoJsonData && <GeoJSON data={geoJsonData} style={{color:"red",weight:2,fillOpacity:0.1}} />}
              {filteredStations.map((s,i)=>(
                <Marker key={i} position={[s.latitude,s.longitude]}>
                  <Popup><strong>{s.nom}</strong><br/>Province: {s.province}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {viewMode==="comparaison" && (
          <div className="comparison-section">
            <div className="dates-input">
              <input value={date1} onChange={e=>setDate1(e.target.value)} placeholder="JJ/MM/AAAA"/>
              <input value={date2} onChange={e=>setDate2(e.target.value)} placeholder="JJ/MM/AAAA"/>
              <button onClick={async ()=>{
                await fetch("https://pfe-abhs.vercel.app/update-dates",{
                  method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date1,date2})
                });
                const res=await fetch("https://sheets.googleapis.com/v4/spreadsheets/1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw/values/Feuil1!AO5:AS53?key=AIzaSyDOLJN_Y7moGzrywl7m8NQ5YOPSvxjqgUs");
                const {values} = await res.json();
                if(values){
                  setComparisonData(values.map((r,i)=> i? [...r.slice(0,4),`${(parseFloat(r[4].replace("%",""))*100).toFixed(1)}%`]: [...r.slice(0,4),"Déficit"]));
                }
              }}>Valider</button>
            </div>
            {comparisonData.length>0 && (
              <table className="comparison-table">
                <thead><tr>{comparisonData[0].map((h,i)=><th key={i}>{h}</th>)}</tr></thead>
                <tbody>{comparisonData.slice(1).map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HydroFilterRegion;
