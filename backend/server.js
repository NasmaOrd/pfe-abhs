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
const stationMap = require('./data/stations.json'); // { "1": "Pont du Mdez (Sebbou)", ... }

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

// 📌 Récupération des stations pour les suggestions
app.get("/api/stations", (req, res) => {
  res.json(stationMap);
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
