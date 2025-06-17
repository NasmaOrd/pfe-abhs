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

// Origines autorisées
const allowedOrigins = [
  "https://pfe-abhs.vercel.app",
  "https://pfe-abhs.web.app",
  "http://localhost:3000",
];

// Middleware CORS
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

// 📁 Configuration du stockage des fichiers avec Multer
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

    // Filtrer les fichiers qui commencent par l'id de la station suivi d'un underscore
    const matchingFiles = files.filter(file =>
      file.startsWith(`${stationId}_`) && /\.(csv|xlsx)$/i.test(file)
    );

    res.json(matchingFiles);
  });
});

// Accès public aux fichiers uploadés
app.use("/uploads", express.static("uploads"));

// Auth API
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API opérationnelle 🚀");
});

// Connexion MongoDB et lancement serveur
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
