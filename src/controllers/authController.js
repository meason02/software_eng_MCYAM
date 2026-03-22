const db = require('../config/db');
const bcrypt = require('bcryptjs');

const renderRegister = (res, formData = {}, errors = [], statusCode = 200) => {
  return res.status(statusCode).render('auth/register', {
    title: 'Register',
    errors,
    formData
  });
};

const renderLogin = (res, formData = {}, errors = [], statusCode = 200) => {
  return res.status(statusCode).render('auth/login', {
    title: 'Login',
    errors,
    formData
  });
};

exports.showRegister = (req, res) => {
  return renderRegister(res, {}, []);
};

exports.register = async (req, res) => {
  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';

  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3 || username.length > 50) {
    errors.push('Username must be between 3 and 50 characters');
  }

  if (!email) {
    errors.push('Email is required');
  } else if (!emailPattern.test(email)) {
    errors.push('Enter a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return renderRegister(res, { username, email }, errors, 400);
  }

  try {
    const [existingUsers] = await db.query(
      'SELECT user_id FROM USER WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return renderRegister(
        res,
        { username, email },
        ['Username or email already exists'],
        400
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO USER (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, email, passwordHash, 'user']
    );

    return res.redirect('/login');
  } catch (error) {
    console.error('Register error:', error);
    return renderRegister(
      res,
      { username, email },
      ['Server error. Please try again.'],
      500
    );
  }
};

exports.showLogin = (req, res) => {
  return renderLogin(res, {}, []);
};

exports.login = async (req, res) => {
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';

  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.push('Email is required');
  } else if (!emailPattern.test(email)) {
    errors.push('Enter a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return renderLogin(res, { email }, errors, 400);
  }

  try {
    const [rows] = await db.query(
      'SELECT user_id, username, email, password_hash, role FROM USER WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return renderLogin(
        res,
        { email },
        ['Invalid email or password'],
        401
      );
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return renderLogin(
        res,
        { email },
        ['Invalid email or password'],
        401
      );
    }

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return res.redirect('/users');
  } catch (error) {
    console.error('Login error:', error);
    return renderLogin(
      res,
      { email },
      ['Server error. Please try again.'],
      500
    );
  }
};

exports.logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).send('Server error');
    }

    return res.redirect('/login');
  });
};
