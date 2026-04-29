const db = require('../config/db');
const bcrypt = require('bcryptjs');

const renderRegister = (res, formData = {}, errors = [], statusCode = 200) => {
  return res.status(statusCode).render('auth/register', {
    title: 'Register',
    errors,
    formData
  });
};

const renderLogin = (res, formData = {}, errors = [], statusCode = 200, success = null) => {
  return res.status(statusCode).render('auth/login', {
    title: 'Login',
    errors,
    formData,
    success
  });
};

exports.showRegister = (req, res) => {
  return renderRegister(res, {}, []);
};

exports.register = async (req, res) => {
  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';
  const confirmPassword = req.body.confirmPassword || '';
  const termsAccepted = req.body.terms === 'on';

  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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
  } else if (!passwordPattern.test(password)) {
    errors.push('Password must be at least 8 characters and include uppercase, lowercase and a number');
  }

  if (!confirmPassword) {
    errors.push('Confirm password is required');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match. Please re-enter your password.');
  }

  if (!termsAccepted) {
    errors.push('You must agree to the Terms and Conditions before creating an account.');
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

    return res.redirect('/login?registered=success');
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
  const success = req.query.registered === 'success'
    ? 'Account created successfully. Please log in.'
    : null;

  return renderLogin(res, {}, [], 200, success);
};

exports.login = async (req, res) => {
  const identifier = (req.body.identifier || req.body.email || '').trim();
  const password = req.body.password || '';

  const errors = [];

  if (!identifier) {
    errors.push('Email or username is required');
  } else if (identifier.length > 100) {
    errors.push('Email or username must be 100 characters or fewer');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return renderLogin(res, { identifier }, errors, 400);
  }

  try {
    const [rows] = await db.query(
      'SELECT user_id, username, email, password_hash, role FROM USER WHERE email = ? OR username = ?',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return renderLogin(
        res,
        { identifier },
        ['Invalid username/email or password'],
        401
      );
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return renderLogin(
        res,
        { identifier },
        ['Invalid username/email or password'],
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
      { identifier },
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
