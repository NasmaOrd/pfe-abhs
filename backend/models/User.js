const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // ton "nom" d'utilisateur
  name:     { type: String }, // un champ optionnel pour le vrai nom, que tu peux renseigner ou pas
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  active:   { type: Boolean, default: true }, // pour gérer si l'utilisateur est actif ou non
});

module.exports = mongoose.model('User', UserSchema);
