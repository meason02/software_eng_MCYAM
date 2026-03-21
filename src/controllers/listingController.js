const db = require('../config/db');

exports.getAllListings = async (req, res) => {
  try {
    const [listings] = await db.query(`
      SELECT listing_id, title, quantity, expiry_date, pickup_location, status
      FROM FOOD_LISTING
      ORDER BY listing_id ASC
    `);

    res.render('listings/index', {
      title: 'Listings',
      listings
    });
  } catch (error) {
    console.error('Listing fetch error:', error);
    res.status(500).send('Server error');
  }
};

exports.getListingById = async (req, res) => {
  const listingId = Number(req.params.id);

  if (!Number.isInteger(listingId) || listingId < 1) {
    return res.status(404).send('Listing not found');
  }

  try {
    const [rows] = await db.query(`
      SELECT
        fl.listing_id,
        fl.title,
        fl.description,
        fl.quantity,
        fl.expiry_date,
        fl.collection_start,
        fl.collection_end,
        fl.pickup_location,
        fl.status,
        c.name AS category_name,
        u.user_id AS owner_id,
        u.username AS owner_username,
        u.email AS owner_email,
        COALESCE(GROUP_CONCAT(t.tag_name ORDER BY t.tag_name SEPARATOR ', '), '') AS tags
      FROM FOOD_LISTING fl
      JOIN CATEGORY c ON fl.category_id = c.category_id
      JOIN USER u ON fl.user_id = u.user_id
      LEFT JOIN LISTING_TAG lt ON fl.listing_id = lt.listing_id
      LEFT JOIN TAGS t ON lt.tag_id = t.tag_id
      WHERE fl.listing_id = ?
      GROUP BY
        fl.listing_id,
        fl.title,
        fl.description,
        fl.quantity,
        fl.expiry_date,
        fl.collection_start,
        fl.collection_end,
        fl.pickup_location,
        fl.status,
        c.name,
        u.user_id,
        u.username,
        u.email
    `, [listingId]);

    if (rows.length === 0) {
      return res.status(404).send('Listing not found');
    }

    res.render('listings/detail', {
      title: rows[0].title,
      listing: rows[0]
    });
  } catch (error) {
    console.error('Listing detail error:', error);
    res.status(500).send('Server error');
  }
};
