require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const usersRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const listingsRoutes = require('./routes/listings');
const authRoutes = require('./routes/auth');
const listingController = require('./controllers/listingController');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'software_eng_mcyam_session_secret',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.use('/', authRoutes);
app.get('/my-listings', requireLogin, listingController.getMyListings);
app.use('/users', requireLogin, usersRoutes);
app.use('/listings', requireLogin, listingsRoutes);
app.use('/categories', requireLogin, categoryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

