// models/UploadedFile.js
const mongoose = require('mongoose');

const UploadedFileSchema = new mongoose.Schema({
  stationId: String,
  filename: String,
  content: Object,
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UploadedFile', UploadedFileSchema);
