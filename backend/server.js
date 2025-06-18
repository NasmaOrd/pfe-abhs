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
const router = express.Router();

const uploadDir = path.join(__dirname, "uploads");

// Middleware CORS
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

// 📁 Multer config
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

// 📤 Upload fichier
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("✅ Fichier uploadé :", fileUrl);
  res.json({ fileUrl });
});

// 📥 Liste des fichiers pour une station
app.get("/api/files/:stationId", (req, res) => {
  const stationId = req.params.stationId;

  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Erreur lecture du dossier uploads" });

    const matchingFiles = files.filter(file =>
      file.startsWith(`${stationId}_`) && /\.(csv|xlsx)$/i.test(file)
    );

    res.json(matchingFiles);
  });
});

// 📂 Accès statique aux fichiers
app.use("/uploads", express.static("uploads"));

// ✅ 🔍 Recherche par nom (obligatoire) et date (optionnelle)
app.post("/api/files/search", async (req, res) => {
  const { stationName, date } = req.body;

  try {
    const matchedFiles = [];

    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.csv') || f.endsWith('.xlsx'));

    for (let file of files) {
      const [stationId, ...rest] = file.split('_');
      const fullName = rest.join('_');

      if (!stationName || !file.toLowerCase().includes(stationName.toLowerCase())) continue;

      if (date) {
        const content = fs.readFileSync(path.join(uploadDir, file), 'utf8');
        if (!content.includes(date)) continue;
      }

      matchedFiles.push({ fileName: file, stationId, stationName: fullName });
    }

    res.json(matchedFiles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la recherche");
  }
});

// ✅ 🔁 Liste dynamique des stations avec leurs fichiers
app.get("/api/stations", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Erreur lecture du dossier uploads" });

    const stationMap = {}; // { 1: [file1, file2], 2: [...] }

    files.forEach(file => {
      const match = file.match(/^(\d+)_/);
      if (match) {
        const stationId = match[1];
        if (!stationMap[stationId]) stationMap[stationId] = [];
        stationMap[stationId].push(file);
      }
    });

    res.json(stationMap);
  });
});

// ✅ Route test
app.get("/", (req, res) => {
  res.send("API opérationnelle 🚀");
});

// ✅ Auth
app.use("/api/auth", authRoutes);

// ✅ Connexion MongoDB
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
