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
