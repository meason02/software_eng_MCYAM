const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, username, email, created_at FROM `USER` ORDER BY user_id ASC'
    );

    res.render('users/index', {
      title: 'Users',
      users
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).send('Failed to load users');
  }
};
