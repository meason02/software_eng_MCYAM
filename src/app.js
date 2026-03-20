require('dotenv').config();
const express = require('express');
const path = require('path');
const usersRoutes = require('./routes/users');

const categoryRoutes = require('./routes/categories');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/users');
});

app.use('/users', usersRoutes);

app.get('/listings', (req, res) => {
  res.send('Listings page coming soon');
});
app.use('/categories', categoryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



