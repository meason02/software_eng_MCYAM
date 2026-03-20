require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.send(`DB connected: ${rows[0].ok}`);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Database connection failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});