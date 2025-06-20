const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();
app.use(cors());
app.use(express.json());

const articles = require('./api/articles');
app.use('/api/articles', articles);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
