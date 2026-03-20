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

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await db.query(
      'SELECT user_id, username, email, created_at FROM `USER` WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).send('User not found');
    }

    const [listings] = await db.query(
      'SELECT listing_id, title, status, created_at FROM `FOOD_LISTING` WHERE user_id = ? ORDER BY listing_id ASC',
      [userId]
    );

    res.render('users/profile', {
      title: users[0].username,
      user: users[0],
      listings
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).send('Failed to load user profile');
  }
};
