const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  const q = (req.query.q || '').trim();
  const currentUserId = req.session?.user?.user_id || 0;

  try {
    const likeValue = `%${q}%`;

    const [statsRows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM USER) AS total_members,
        (SELECT COUNT(*) FROM FOOD_LISTING) AS listings_shared,
        (SELECT COUNT(*) FROM CLAIM) AS claims_made,
        (SELECT COALESCE(SUM(quantity), 0) FROM FOOD_LISTING WHERE status = 'COMPLETED') AS total_food_shared
    `);

    const [users] = await db.query(`
      SELECT
        u.user_id,
        u.username,
        u.created_at,
        COUNT(DISTINCT fl.listing_id) AS listings_shared,
        COUNT(DISTINCT cl.claims_id) AS claims_made
      FROM USER u
      LEFT JOIN FOOD_LISTING fl ON fl.user_id = u.user_id
      LEFT JOIN CLAIM cl ON cl.user_id = u.user_id
      WHERE u.user_id <> ?
        AND (? = '' OR u.username LIKE ?)
      GROUP BY u.user_id, u.username, u.created_at
      ORDER BY u.username ASC
    `, [currentUserId, q, likeValue]);

    res.render('users/index', {
      title: 'Community',
      users,
      stats: statsRows[0],
      filters: { q }
    });
  } catch (error) {
    console.error('Community fetch error:', error);
    res.status(500).send('Failed to load community');
  }
};

exports.getUserById = async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).send('Invalid user ID');
  }

  try {
    const [users] = await db.query(
      'SELECT user_id, username, email, created_at FROM `USER` WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).send('User not found');
    }

    const [listings] = await db.query(
      'SELECT listing_id, title, status, create_at AS created_at FROM `FOOD_LISTING` WHERE user_id = ? ORDER BY listing_id ASC',
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
