const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// In-memory storage for articles
let articles = [
  {
    id: 1,
    title: 'Contoh Artikel',
    author: 'Admin',
    content: 'Ini adalah contoh artikel pertama',
    category: 'Umum',
    image_url: '',
    created_at: new Date().toISOString()
  }
];

// Helper function to clean up files
const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// GET all articles
router.get('/', (req, res) => {
  try {
    // Sort by newest first
    const sortedArticles = [...articles].sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );
    res.json(sortedArticles);
  } catch (err) {
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

// GET single article
router.get('/:id', (req, res) => {
  try {
    const article = articles.find(a => a.id === parseInt(req.params.id));
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

// POST new article with file upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, author, content, category } = req.body;

    // Validation
    if (!title || !author || !content) {
      if (req.file) cleanupFile(req.file.path);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title, author, and content are required'
      });
    }

    // Build image URL
    const imageUrl = req.file ? `/api/articles/images/${path.basename(req.file.path)}` : '';

    // Create new article
    const newArticle = {
      id: articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1,
      title,
      author,
      content,
      category: category || 'Umum',
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };

    articles.push(newArticle);
    res.status(201).json(newArticle);
  } catch (err) {
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

// PUT update article with optional file upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, content, category } = req.body;

    const index = articles.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      if (req.file) cleanupFile(req.file.path);
      return res.status(404).json({ error: 'Article not found' });
    }

    // Store old image path for cleanup if new image is uploaded
    let oldImagePath = '';
    if (req.file && articles[index].image_url) {
      oldImagePath = path.join(uploadDir, path.basename(articles[index].image_url));
    }

    // Update article
    const updatedArticle = {
      ...articles[index],
      title: title || articles[index].title,
      author: author || articles[index].author,
      content: content || articles[index].content,
      category: category || articles[index].category,
      image_url: req.file
        ? `/api/articles/images/${path.basename(req.file.path)}`
        : articles[index].image_url
    };

    articles[index] = updatedArticle;

    // Clean up old image if new one was uploaded
    if (oldImagePath) cleanupFile(oldImagePath);

    res.json(updatedArticle);
  } catch (err) {
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

// DELETE article
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = articles.findIndex(a => a.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Clean up associated image file
    if (articles[index].image_url) {
      const imagePath = path.join(uploadDir, path.basename(articles[index].image_url));
      cleanupFile(imagePath);
    }

    articles = articles.filter(a => a.id !== parseInt(id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

// GET image file
router.get('/images/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (err) {
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

module.exports = router;