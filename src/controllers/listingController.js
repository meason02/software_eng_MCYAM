const db = require('../config/db');

const LISTING_STATUS_OPTIONS = ['AVAILABLE', 'CLAIM_PENDING'];

const getCategories = async () => {
  const [categories] = await db.query(`
    SELECT category_id, name
    FROM CATEGORY
    ORDER BY name ASC
  `);

  return categories;
};

const normalizeDateTimeInput = (value = '') => {
  const clean = value.trim();

  if (!clean) {
    return '';
  }

  const normalized = clean.replace('T', ' ');
  return normalized.length === 16 ? `${normalized}:00` : normalized;
};

const renderCreateListing = async (res, formData = {}, errors = [], statusCode = 200) => {
  try {
    const categories = await getCategories();

    return res.status(statusCode).render('listings/create', {
      title: 'Create Listing',
      categories,
      errors,
      formData
    });
  } catch (error) {
    console.error('Create listing form error:', error);
    return res.status(500).send('Server error');
  }
};

exports.getAllListings = async (req, res) => {
  const q = (req.query.q || '').trim();
  const status = (req.query.status || '').trim();
  const categoryIdRaw = (req.query.category_id || '').trim();

  const errors = [];
  let categoryId = null;

  if (categoryIdRaw) {
    categoryId = Number(categoryIdRaw);

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      errors.push('Invalid category filter');
    }
  }

  if (status && !LISTING_STATUS_OPTIONS.includes(status)) {
    errors.push('Invalid status filter');
  }

  try {
    const categories = await getCategories();

    if (errors.length > 0) {
      return res.status(400).render('listings/index', {
        title: 'Listings',
        listings: [],
        categories,
        filters: {
          q,
          status,
          category_id: categoryIdRaw
        },
        errors,
        statusOptions: LISTING_STATUS_OPTIONS
      });
    }

    let sql = `
      SELECT
        fl.listing_id,
        fl.title,
        fl.quantity,
        fl.expiry_date,
        fl.pickup_location,
        fl.status,
        c.name AS category_name
      FROM FOOD_LISTING fl
      JOIN CATEGORY c ON fl.category_id = c.category_id
    `;

    const conditions = [];
    const params = [];

    if (q) {
      const likeValue = `%${q}%`;
      conditions.push('(fl.title LIKE ? OR fl.description LIKE ? OR fl.pickup_location LIKE ?)');
      params.push(likeValue, likeValue, likeValue);
    }

    if (categoryIdRaw) {
      conditions.push('fl.category_id = ?');
      params.push(categoryId);
    }

    if (status) {
      conditions.push('fl.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY fl.listing_id DESC';

    const [listings] = await db.query(sql, params);

    return res.render('listings/index', {
      title: 'Listings',
      listings,
      categories,
      filters: {
        q,
        status,
        category_id: categoryIdRaw
      },
      errors: [],
      statusOptions: LISTING_STATUS_OPTIONS
    });
  } catch (error) {
    console.error('Listing fetch error:', error);
    return res.status(500).send('Server error');
  }
};

exports.showCreateListing = async (req, res) => {
  return renderCreateListing(res, {}, []);
};

exports.createListing = async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.redirect('/login');
  }

  const categoryIdRaw = (req.body.category_id || '').trim();
  const title = (req.body.title || '').trim();
  const description = (req.body.description || '').trim();
  const quantityRaw = (req.body.quantity || '').trim();
  const expiryDate = (req.body.expiry_date || '').trim();
  const collectionStartRaw = (req.body.collection_start || '').trim();
  const collectionEndRaw = (req.body.collection_end || '').trim();
  const pickupLocation = (req.body.pickup_location || '').trim();

  const errors = [];

  const categoryId = Number(categoryIdRaw);
  const quantity = Number(quantityRaw);
  const collectionStart = normalizeDateTimeInput(collectionStartRaw);
  const collectionEnd = normalizeDateTimeInput(collectionEndRaw);

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    errors.push('Category is required');
  }

  if (!title) {
    errors.push('Title is required');
  } else if (title.length > 255) {
    errors.push('Title must be 255 characters or fewer');
  }

  if (!description) {
    errors.push('Description is required');
  } else if (description.length > 255) {
    errors.push('Description must be 255 characters or fewer');
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    errors.push('Quantity must be a whole number greater than 0');
  }

  if (!expiryDate) {
    errors.push('Expiry date is required');
  }

  if (!collectionStartRaw) {
    errors.push('Collection start is required');
  }

  if (!collectionEndRaw) {
    errors.push('Collection end is required');
  }

  if (collectionStartRaw && collectionEndRaw) {
    const startDate = new Date(collectionStartRaw);
    const endDate = new Date(collectionEndRaw);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      errors.push('Enter valid collection dates');
    } else if (endDate <= startDate) {
      errors.push('Collection end must be after collection start');
    }
  }

  if (!pickupLocation) {
    errors.push('Pickup location is required');
  } else if (pickupLocation.length > 255) {
    errors.push('Pickup location must be 255 characters or fewer');
  }

  const formData = {
    category_id: categoryIdRaw,
    title,
    description,
    quantity: quantityRaw,
    expiry_date: expiryDate,
    collection_start: collectionStartRaw,
    collection_end: collectionEndRaw,
    pickup_location: pickupLocation
  };

  if (errors.length > 0) {
    return renderCreateListing(res, formData, errors, 400);
  }

  try {
    const [categoryRows] = await db.query(
      'SELECT category_id FROM CATEGORY WHERE category_id = ?',
      [categoryId]
    );

    if (categoryRows.length === 0) {
      return renderCreateListing(
        res,
        formData,
        ['Selected category does not exist'],
        400
      );
    }

    const [result] = await db.query(`
      INSERT INTO FOOD_LISTING (
        user_id,
        category_id,
        title,
        description,
        quantity,
        expiry_date,
        collection_start,
        collection_end,
        pickup_location,
        status,
        create_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId,
      categoryId,
      title,
      description,
      quantity,
      expiryDate,
      collectionStart,
      collectionEnd,
      pickupLocation,
      'AVAILABLE'
    ]);

    return res.redirect(`/listings/${result.insertId}`);
  } catch (error) {
    console.error('Create listing error:', error);
    return renderCreateListing(
      res,
      formData,
      ['Server error. Please try again.'],
      500
    );
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

    return res.render('listings/detail', {
      title: rows[0].title,
      listing: rows[0]
    });
  } catch (error) {
    console.error('Listing detail error:', error);
    return res.status(500).send('Server error');
  }
};
