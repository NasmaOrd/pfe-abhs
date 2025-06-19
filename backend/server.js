const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://pfe-abhs.vercel.app",
  "https://pfe-abhs.web.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
const XLSX = require("xlsx");
const ExcelJS = require("exceljs");


app.post("/update-dates", async (req, res) => {
  const { date1, date2 } = req.body;
  const filePath = path.join(__dirname, "data", "data.xlsx");

  if (!date1 || !date2) {
    return res.status(400).json({ error: "Deux dates sont requises." });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.worksheets[0];

    sheet.getCell("AQ2").value = date1;
    sheet.getCell("AQ3").value = date2;

    await workbook.xlsx.writeFile(filePath);
    console.log("✅ AQ2 et AQ3 mises à jour :", date1, date2);
    res.json({ message: "Dates enregistrées avec succès." });
  } catch (error) {
    console.error("❌ Erreur mise à jour Excel :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du fichier Excel." });
  }
});

// ✅ Route pour lire et renvoyer le tableau AO5:AS53
app.get("/get-comparison-table", async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.worksheets[0];

    const rows = [];

    for (let i = 5; i <= 53; i++) {
      const row = {
        station: sheet.getCell(`AP${i}`).value,
        pluie_normale: sheet.getCell(`AQ${i}`).value,
        pluie_2024: sheet.getCell(`AR${i}`).value,
        pourcentage: sheet.getCell(`AS${i}`).text, // garde le format (%)
      };
      rows.push(row);
    }

    res.json(rows);
  } catch (error) {
    console.error("❌ Erreur lecture Excel :", error);
    res.status(500).json({ error: "Erreur lors de la lecture du tableau." });
  }
});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const stationId = req.query.stationId || "unknown";
    const cleanName = file.originalname.replace(/\s+/g, "_");
    const newFilename = `${stationId}_${cleanName}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage });
const uploadDir = path.join(__dirname, "uploads");

// 📤 Upload d’un fichier CSV lié à une station
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("✅ Fichier uploadé :", fileUrl);
  res.json({ fileUrl });
});

// 📥 Récupération des fichiers pour une station donnée
app.get("/api/files/:stationId", (req, res) => {
  const stationId = req.params.stationId;
  const uploadsPath = path.join(__dirname, "uploads");

  fs.readdir(uploadsPath, (err, files) => {
    if (err) return res.status(500).json({ error: "Erreur lecture du dossier uploads" });

    const matchingFiles = files.filter(file =>
      file.startsWith(`${stationId}_`) && /\.(csv|xlsx)$/i.test(file)
    );

    res.json(matchingFiles);
  });
});

// 📃 Récupération de tous les fichiers CSV
app.get("/api/files/all", (req, res) => {
  const uploadsDir = path.join(__dirname, "uploads");
  console.log("Chemin uploads utilisé :", uploadsDir);

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Erreur lecture uploads :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    const csvFiles = files.filter(f => f.endsWith(".csv"));
    res.json(csvFiles);
  });
});


// 🔍 Recherche avancée : par nom de station et date
app.post('/api/files/search', async (req, res) => {
  const { stationName, date } = req.body;
  const uploadsDir = path.join(__dirname, 'uploads');

  try {
    const allFiles = await fs.promises.readdir(uploadsDir);

    // Filtrer uniquement les fichiers liés à la station demandée
    const matchingFiles = allFiles.filter(file => {
      const fileParts = file.split('_');
      if (fileParts.length < 2) return false;

      const stationId = fileParts[0];
      const name = fileParts.slice(1).join('_'); // nomDuFichier.csv

      // Vérifie si la station correspond
      const isMatch = stationName
        ? name.toLowerCase().includes(stationName.toLowerCase())
        : true;

      // Vérifie si la date correspond (si spécifiée)
      const isDateMatch = date
        ? name.toLowerCase().includes(date.toLowerCase())
        : true;

      return isMatch && isDateMatch;
    });

    // Format de retour
    const result = matchingFiles.map(file => {
      const [stationId, ...rest] = file.split('_');
      return {
        fileName: file,
        stationId,
        stationName // Si besoin, retrouve le nom par ID si tu as une map id → nom
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Erreur recherche de fichiers :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// 📂 Fichiers uploadés accessibles publiquement
app.use("/uploads", express.static("uploads"));

// 🔐 Auth API
app.use("/api/auth", authRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API opérationnelle 🚀");
});

// 🔌 Connexion MongoDB + Lancement serveur
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connecté");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Serveur en écoute sur le port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log("❌ Erreur MongoDB :", err));
