const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const articles = require('./api/articles');
app.use('/api/articles', articles);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Buat folder uploads jika belum ada
  const fs = require('fs');
  const dir = './uploads';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});