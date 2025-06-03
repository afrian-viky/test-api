const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Setup Multer untuk handle file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Simpan data dalam memori
let articles = []; // Tetap sama seperti sebelumnya

// POST new article dengan file upload
router.post('/', upload.single('image'), async (req, res) => {
  const { title, author, content, category } = req.body;
  const imagePath = req.file ? req.file.path : '';

  if (!title || !author || !content) {
    return res.status(400).json({ error: 'Title, author, and content are required' });
  }

  try {
    const newArticle = {
      id: articles.length + 1,
      title,
      author,
      content,
      category: category || 'Umum',
      image_url: imagePath, // Sekarang menyimpan path file
      created_at: new Date().toISOString()
    };

    articles.push(newArticle);
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update article dengan file upload
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, author, content, category } = req.body;
  const imagePath = req.file ? req.file.path : undefined;

  try {
    const index = articles.findIndex(a => a.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedArticle = {
      ...articles[index],
      title: title || articles[index].title,
      author: author || articles[index].author,
      content: content || articles[index].content,
      category: category || articles[index].category,
      image_url: imagePath || articles[index].image_url
    };

    articles[index] = updatedArticle;
    res.json(updatedArticle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET endpoint untuk mengakses gambar
router.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, 'uploads', filename));
});

module.exports = router;