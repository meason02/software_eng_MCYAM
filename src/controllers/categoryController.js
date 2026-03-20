const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT category_id, name
      FROM CATEGORY
      ORDER BY name ASC
    `);

    res.render('categories/index', {
      title: 'Categories',
      categories,
      selectedCategory: null,
      listings: []
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).send('Server error');
  }
};

exports.getCategoryListings = async (req, res) => {
  const categoryId = Number(req.params.id);

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    return res.status(404).send('Category not found');
  }

  try {
    const [categories] = await db.query(`
      SELECT category_id, name
      FROM CATEGORY
      ORDER BY name ASC
    `);

    const [selectedRows] = await db.query(`
      SELECT category_id, name
      FROM CATEGORY
      WHERE category_id = ?
    `, [categoryId]);

    if (selectedRows.length === 0) {
      return res.status(404).send('Category not found');
    }

    const [listings] = await db.query(`
      SELECT
        fl.listing_id,
        fl.title,
        fl.quantity,
        fl.expiry_date,
        fl.pickup_location,
        fl.status,
        COALESCE(GROUP_CONCAT(t.tag_name ORDER BY t.tag_name SEPARATOR ', '), '') AS tags
      FROM FOOD_LISTING fl
      LEFT JOIN LISTING_TAG lt ON fl.listing_id = lt.listing_id
      LEFT JOIN TAGS t ON lt.tag_id = t.tag_id
      WHERE fl.category_id = ?
      GROUP BY fl.listing_id, fl.title, fl.quantity, fl.expiry_date, fl.pickup_location, fl.status
      ORDER BY fl.listing_id DESC
    `, [categoryId]);

    res.render('categories/index', {
      title: 'Categories',
      categories,
      selectedCategory: selectedRows[0],
      listings
    });
  } catch (error) {
    console.error('Error loading category listings:', error);
    res.status(500).send('Server error');
  }
};
