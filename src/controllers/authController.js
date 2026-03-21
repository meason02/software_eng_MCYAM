const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register'
  });
};

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).send('All fields are required');
  }

  try {
    const [existingUsers] = await db.query(
      'SELECT user_id FROM USER WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).send('Username or email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO USER (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, email, passwordHash, role]
    );

    res.redirect('/login');
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).send('Server error');
  }
};

exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login'
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const [rows] = await db.query(
      'SELECT user_id, username, email, password_hash, role FROM USER WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).send('Invalid email or password');
    }

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.redirect('/users');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).send('Server error');
    }

    res.redirect('/login');
  });
};
