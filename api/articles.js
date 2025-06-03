const express = require('express');
const router = express.Router();

// Simpan data dalam memori (array)
let articles = [
  {
    id: 1,
    title: 'Artikel Contoh',
    author: 'John Doe',
    content: 'Ini adalah konten artikel contoh.',
    category: 'Teknologi',
    image_url: 'https://example.com/image.jpg',
    created_at: new Date().toISOString()
  }
];

// GET all articles
router.get('/', async (req, res) => {
  try {
    // Urutkan berdasarkan created_at DESC
    const sortedArticles = [...articles].sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );
    res.json(sortedArticles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new article
router.post('/', async (req, res) => {
  const { title, author, content, category, image_url } = req.body;

  if (!title || !author || !content) {
    return res.status(400).json({ error: 'Title, author, and content are required' });
  }

  try {
    const newArticle = {
      id: articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1,
      title,
      author,
      content,
      category: category || 'Umum',
      image_url: image_url || '',
      created_at: new Date().toISOString()
    };

    articles.push(newArticle);
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update article
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, content, category, image_url } = req.body;

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
      image_url: image_url || articles[index].image_url
    };

    articles[index] = updatedArticle;
    res.json(updatedArticle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE article
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const index = articles.findIndex(a => a.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    articles = articles.filter(a => a.id !== parseInt(id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;