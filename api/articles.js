const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

// GET all articles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new article
router.post('/', async (req, res) => {
  const { title, author, content, category, image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO articles (title, author, content, category, image_url, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [title, author, content, category, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update article
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, content, category, image_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE articles SET title=$1, author=$2, content=$3, category=$4, image_url=$5 WHERE id=$6 RETURNING *',
      [title, author, content, category, image_url, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE article
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM articles WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
