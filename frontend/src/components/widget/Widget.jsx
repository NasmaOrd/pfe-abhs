import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import DeviceThermostatOutlinedIcon from "@mui/icons-material/DeviceThermostatOutlined";
import RadarIcon from "@mui/icons-material/Radar";

const Widget = ({ type }) => {
  let data;

  // Valeurs fictives à remplacer par des données dynamiques
  const amount = 100;
  const diff = 20;

  switch (type) {
    case "employées":
      data = {
        title: "EMPLOYÉES",
        isMoney: false,
        link: "Voir toutes les équipes",
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "darkblue",
              backgroundColor: "rgba(0, 0, 139, 0.2)",
            }}
          />
        ),
      };
      break;
    case "stations":
      data = {
        title: "STATIONS",
        isMoney: false,
        link: "Voir les stations",
        icon: (
          <RadarIcon
            className="icon"
            style={{
              backgroundColor: "rgba(30, 144, 255, 0.2)",
              color: "dodgerblue",
            }}
          />
        ),
      };
      break;
    case "precipitations":
      data = {
        title: "PRÉCIPITATIONS",
        isMoney: false,
        link: "Voir le cumul",
        icon: (
          <WaterDropOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 191, 255, 0.2)", color: "deepskyblue" }}
          />
        ),
      };
      break;
    case "humidite":
      data = {
        title: "HUMIDITÉ",
        isMoney: false,
        link: "Détails du taux",
        icon: (
          <DeviceThermostatOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(46, 139, 87, 0.2)",
              color: "seagreen",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney && "€"} {amount}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className="percentage positive">
          <KeyboardArrowUpIcon />
          {diff} %
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
