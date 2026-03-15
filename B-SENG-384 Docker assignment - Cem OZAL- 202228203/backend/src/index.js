const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME || 'seng384_db',
});

// Test Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL');
  release();
});

// E-posta doğrulama için basit bir kural (Regex)
const emailRegex = /\S+@\S+\.\S+/;

// --- API Endpoints ---

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Backend is running smoothly' });
});

// 2. GET all people
app.get('/api/people', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM people ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 3. POST new person
app.post('/api/people', async (req, res) => {
  const { full_name, email } = req.body;
  
  // ÖDEV KURALI: Backend validation (Ad, e-posta boş mu ve formatı doğru mu?)
  if (!full_name || !email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Valid full name and email are required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO people (full_name, email) VALUES ($1, $2) RETURNING *',
      [full_name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      // ÖDEV KURALI: Email çakışması 409 dönmeli
      return res.status(409).json({ error: 'EMAIL_ALREADY_EXISTS' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 4. PUT update person
app.put('/api/people/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email } = req.body;

  // Güncelleme yaparken de bilgilerin doğru formatta olduğunu kontrol ediyoruz
  if (!full_name || !email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Valid full name and email are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE people SET full_name = $1, email = $2 WHERE id = $3 RETURNING *',
      [full_name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { 
      // Güncelleme yaparken de başka birinin e-postasıyla çakışırsa 409 dönmeli
      return res.status(409).json({ error: 'EMAIL_ALREADY_EXISTS' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 5. DELETE person
app.delete('/api/people/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM people WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
