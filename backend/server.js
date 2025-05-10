const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');  
dotenv.config();  

const app = express();

// ✅ CORS configuré correctement
const allowedOrigins = [
  'https://pfe-abhs.vercel.app',
  'https://pfe-abhs.web.app',
  'http://localhost:3000' // (utile pour tests locaux)
];

app.use(cors({
  origin: function (origin, callback) {
    // Autorise requêtes sans origine (ex: Postman) ou si dans la liste
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ❌ Supprimé l'ancien middleware générique qui causait conflit
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

app.use(express.json());

app.use('/api/auth', authRoutes);

// ✅ Route de test
app.get("/", (req, res) => {
  res.send("Nasma API Marche :)!");
}); 

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));
