const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const listingUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'listings');
fs.mkdirSync(listingUploadDir, { recursive: true });

const getListingImagePath = (listingId) => {
  const extensions = ['jpg', 'jpeg', 'png', 'webp'];

  for (const extension of extensions) {
    const imageFile = path.join(listingUploadDir, `listing-${listingId}.${extension}`);

    if (fs.existsSync(imageFile)) {
      return `/uploads/listings/listing-${listingId}.${extension}`;
    }
  }

  return null;
};

const attachListingImages = (listings = []) => {
  return listings.map((listing) => ({
    ...listing,
    image_path: getListingImagePath(listing.listing_id)
  }));
};

const deleteTempUpload = (file) => {
  if (file && file.path) {
    fs.unlink(file.path, () => {});
  }
};

const LISTING_STATUS_OPTIONS = ['AVAILABLE', 'CLAIM_PENDING', 'COMPLETED'];

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

const getClaimFeedback = (req) => {
  const successMessages = {
    '1': 'Claim request submitted successfully.',
    created: 'Claim request submitted successfully.',
    confirmed: 'Claim confirmed successfully.',
    rejected: 'Claim rejected successfully.',
    completed: 'Claim completed successfully.'
  };

  const successCode = (req.query.claim_success || '').trim();
  if (successCode && successMessages[successCode]) {
    return { type: 'success', message: successMessages[successCode] };
  }

  const errorMessages = {
    own_listing: 'You cannot claim your own listing.',
    not_available: 'This listing is not currently available for claiming.',
    already_claimed: 'This listing already has a live claim.',
    server_error: 'Server error. Please try again.',
    not_authorized: 'You are not allowed to manage this claim.',
    claim_not_found: 'Claim not found.',
    invalid_action: 'Invalid claim action.',
    invalid_state: 'That claim action is not allowed in the current status.'
  };

  const errorCode = (req.query.claim_error || '').trim();
  if (!errorCode || !errorMessages[errorCode]) {
    return null;
  }

  return { type: 'error', message: errorMessages[errorCode] };
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
        filters: { q, status, category_id: categoryIdRaw },
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

    const conditions = ["fl.status <> 'REMOVED'", "(fl.expiry_date IS NULL OR fl.expiry_date >= CURDATE())"];
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
      listings: attachListingImages(listings),
      categories,
      filters: { q, status, category_id: categoryIdRaw },
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

  if (req.uploadError) {
    errors.push(req.uploadError);
  }

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
    deleteTempUpload(req.file);
    return renderCreateListing(res, formData, errors, 400);
  }

  try {
    const [categoryRows] = await db.query(
      'SELECT category_id FROM CATEGORY WHERE category_id = ?',
      [categoryId]
    );

    if (categoryRows.length === 0) {
      deleteTempUpload(req.file);
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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

    if (req.file) {
      const extension = path.extname(req.file.originalname).toLowerCase();
      const finalPath = path.join(listingUploadDir, `listing-${result.insertId}${extension}`);
      fs.renameSync(req.file.path, finalPath);
    }

    return res.redirect(`/listings/${result.insertId}`);
  } catch (error) {
    console.error('Create listing error:', error);
    deleteTempUpload(req.file);
    return renderCreateListing(
      res,
      formData,
      ['Server error. Please try again.'],
      500
    );
  }
};

exports.createClaim = async (req, res) => {
  const currentUserId = req.session?.user?.user_id;
  const listingId = Number(req.params.id);

  if (!currentUserId) {
    return res.redirect('/login');
  }

  if (!Number.isInteger(listingId) || listingId < 1) {
    return res.status(404).send('Listing not found');
  }

  try {
    const [listingRows] = await db.query(`
      SELECT listing_id, user_id, status
      FROM FOOD_LISTING
      WHERE listing_id = ?
    `, [listingId]);

    if (listingRows.length === 0) {
      return res.status(404).send('Listing not found');
    }

    const listing = listingRows[0];

    if (listing.user_id === currentUserId) {
      return res.redirect(`/listings/${listingId}?claim_error=own_listing`);
    }

    if (listing.status !== 'AVAILABLE') {
      return res.redirect(`/listings/${listingId}?claim_error=not_available`);
    }

    const [activeClaimRows] = await db.query(`
      SELECT claims_id
      FROM CLAIM
      WHERE listing_id = ?
        AND status IN ('PENDING', 'CONFIRMED')
      LIMIT 1
    `, [listingId]);

    if (activeClaimRows.length > 0) {
      return res.redirect(`/listings/${listingId}?claim_error=already_claimed`);
    }

    await db.query(`
      INSERT INTO CLAIM (listing_id, user_id, called_at, status)
      VALUES (?, ?, NOW(), 'PENDING')
    `, [listingId, currentUserId]);

    await db.query(`
      UPDATE FOOD_LISTING
      SET status = 'CLAIM_PENDING'
      WHERE listing_id = ?
    `, [listingId]);

    return res.redirect(`/listings/${listingId}?claim_success=created`);
  } catch (error) {
    console.error('Create claim error:', error);
    return res.redirect(`/listings/${listingId}?claim_error=server_error`);
  }
};

exports.updateClaimStatus = async (req, res) => {
  const currentUserId = req.session?.user?.user_id;
  const listingId = Number(req.params.id);
  const claimId = Number(req.params.claimId);
  const action = (req.body.action || '').trim().toLowerCase();

  if (!currentUserId) {
    return res.redirect('/login');
  }

  if (!Number.isInteger(listingId) || listingId < 1 || !Number.isInteger(claimId) || claimId < 1) {
    return res.status(404).send('Listing not found');
  }

  const validActions = ['confirm', 'reject', 'complete'];
  if (!validActions.includes(action)) {
    return res.redirect(`/listings/${listingId}?claim_error=invalid_action`);
  }

  try {
    const [listingRows] = await db.query(`
      SELECT listing_id, user_id
      FROM FOOD_LISTING
      WHERE listing_id = ?
    `, [listingId]);

    if (listingRows.length === 0) {
      return res.status(404).send('Listing not found');
    }

    const listing = listingRows[0];

    if (listing.user_id !== currentUserId) {
      return res.redirect(`/listings/${listingId}?claim_error=not_authorized`);
    }

    const [claimRows] = await db.query(`
      SELECT claims_id, status
      FROM CLAIM
      WHERE claims_id = ?
        AND listing_id = ?
      LIMIT 1
    `, [claimId, listingId]);

    if (claimRows.length === 0) {
      return res.redirect(`/listings/${listingId}?claim_error=claim_not_found`);
    }

    const claim = claimRows[0];

    if (action === 'confirm') {
      if (claim.status !== 'PENDING') {
        return res.redirect(`/listings/${listingId}?claim_error=invalid_state`);
      }

      await db.query(`
        UPDATE CLAIM
        SET status = 'CONFIRMED'
        WHERE claims_id = ?
      `, [claimId]);

      await db.query(`
        UPDATE FOOD_LISTING
        SET status = 'CLAIM_PENDING'
        WHERE listing_id = ?
      `, [listingId]);

      return res.redirect(`/listings/${listingId}?claim_success=confirmed`);
    }

    if (action === 'reject') {
      if (claim.status !== 'PENDING') {
        return res.redirect(`/listings/${listingId}?claim_error=invalid_state`);
      }

      await db.query(`
        UPDATE CLAIM
        SET status = 'REJECTED'
        WHERE claims_id = ?
      `, [claimId]);

      await db.query(`
        UPDATE FOOD_LISTING
        SET status = 'AVAILABLE'
        WHERE listing_id = ?
      `, [listingId]);

      return res.redirect(`/listings/${listingId}?claim_success=rejected`);
    }

    if (claim.status !== 'CONFIRMED') {
      return res.redirect(`/listings/${listingId}?claim_error=invalid_state`);
    }

    await db.query(`
      UPDATE CLAIM
      SET status = 'COMPLETED'
      WHERE claims_id = ?
    `, [claimId]);

    await db.query(`
      UPDATE FOOD_LISTING
      SET status = 'COMPLETED'
      WHERE listing_id = ?
    `, [listingId]);

    return res.redirect(`/listings/${listingId}?claim_success=completed`);
  } catch (error) {
    console.error('Update claim status error:', error);
    return res.redirect(`/listings/${listingId}?claim_error=server_error`);
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

    const [activeClaimRows] = await db.query(`
      SELECT
        c.claims_id,
        c.user_id,
        c.called_at,
        c.status,
        u.username AS claimant_username,
        u.email AS claimant_email
      FROM CLAIM c
      JOIN USER u ON c.user_id = u.user_id
      WHERE c.listing_id = ?
        AND c.status IN ('PENDING', 'CONFIRMED')
      ORDER BY c.claims_id DESC
      LIMIT 1
    `, [listingId]);

    const currentUserId = req.session?.user?.user_id || null;
    const activeClaim = activeClaimRows.length > 0 ? activeClaimRows[0] : null;
    const isOwner = currentUserId !== null && rows[0].owner_id === currentUserId;
    const isExpired = rows[0].expiry_date && new Date(rows[0].expiry_date) < new Date(new Date().toDateString());
    const isRemoved = rows[0].status === 'REMOVED';

    if ((isExpired || isRemoved) && !isOwner) {
      return res.status(404).send('Listing not found');
    }

    return res.render('listings/detail', {
      title: rows[0].title,
      listing: { ...rows[0], image_path: getListingImagePath(rows[0].listing_id) },
      claimState: {
        activeClaim,
        canClaim: currentUserId !== null && !isOwner && rows[0].status === 'AVAILABLE' && !activeClaim && !isExpired && !isRemoved,
        isOwner,
        canConfirm: isOwner && !!activeClaim && activeClaim.status === 'PENDING',
        canReject: isOwner && !!activeClaim && activeClaim.status === 'PENDING',
        canComplete: isOwner && !!activeClaim && activeClaim.status === 'CONFIRMED'
      },
      claimFeedback: getClaimFeedback(req)
    });
  } catch (error) {
    console.error('Listing detail error:', error);
    return res.status(500).send('Server error');
  }
};


exports.getMyListings = async (req, res) => {
  const currentUserId = req.session?.user?.user_id;
  const tab = (req.query.tab || 'active').trim().toLowerCase();

  if (!currentUserId) {
    return res.redirect('/login');
  }

  const validTabs = ['active', 'pending', 'completed', 'expired'];
  const selectedTab = validTabs.includes(tab) ? tab : 'active';

  const conditions = ['fl.user_id = ?'];
  const params = [currentUserId];

  if (selectedTab === 'active') {
    conditions.push("fl.status = 'AVAILABLE'");
    conditions.push('(fl.expiry_date IS NULL OR fl.expiry_date >= CURDATE())');
  }

  if (selectedTab === 'pending') {
    conditions.push("fl.status = 'CLAIM_PENDING'");
  }

  if (selectedTab === 'completed') {
    conditions.push("fl.status = 'COMPLETED'");
  }

  if (selectedTab === 'expired') {
    conditions.push("fl.expiry_date < CURDATE()");
    conditions.push("fl.status <> 'COMPLETED'");
  }

  try {
    const [countRows] = await db.query(`
      SELECT
        SUM(CASE WHEN status = 'AVAILABLE' AND (expiry_date IS NULL OR expiry_date >= CURDATE()) THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN status = 'CLAIM_PENDING' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN expiry_date < CURDATE() AND status <> 'COMPLETED' THEN 1 ELSE 0 END) AS expired_count
      FROM FOOD_LISTING
      WHERE user_id = ?
    `, [currentUserId]);

    const [listings] = await db.query(`
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
        fl.create_at,
        c.name AS category_name,
        COALESCE(COUNT(cl.claims_id), 0) AS claim_count
      FROM FOOD_LISTING fl
      JOIN CATEGORY c ON fl.category_id = c.category_id
      LEFT JOIN CLAIM cl ON cl.listing_id = fl.listing_id
      WHERE ${conditions.join(' AND ')}
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
        fl.create_at,
        c.name
      ORDER BY fl.create_at DESC, fl.listing_id DESC
    `, params);

    return res.render('listings/my-listings', {
      title: 'My Listings',
      listings: attachListingImages(listings),
      selectedTab,
      counts: countRows[0] || {}
    });
  } catch (error) {
    console.error('My listings error:', error);
    return res.status(500).send('Failed to load my listings');
  }
};






exports.showEditListing = async (req, res) => {
  const currentUserId = req.session?.user?.user_id;
  const listingId = Number(req.params.id);

  if (!currentUserId) {
    return res.redirect('/login');
  }

  if (!Number.isInteger(listingId) || listingId < 1) {
    return res.status(404).send('Listing not found');
  }

  try {
    const [rows] = await db.query(`
      SELECT
        listing_id,
        user_id,
        category_id,
        title,
        description,
        quantity,
        expiry_date,
        collection_start,
        collection_end,
        pickup_location,
        status
      FROM FOOD_LISTING
      WHERE listing_id = ?
    `, [listingId]);

    if (rows.length === 0) {
      return res.status(404).send('Listing not found');
    }

    const listing = rows[0];

    if (listing.user_id !== currentUserId) {
      return res.status(403).send('You are not allowed to edit this listing');
    }

    const isExpired = listing.expiry_date && new Date(listing.expiry_date) < new Date(new Date().toDateString());
    const isRemoved = listing.status === 'REMOVED';

    if (isExpired || isRemoved) {
      return res.status(403).send('Expired or removed listings cannot be edited.');
    }

    const categories = await getCategories();

    return res.render('listings/edit', {
      title: 'Edit Listing',
      listing: {
        ...listing,
        image_path: getListingImagePath(listing.listing_id)
      },
      categories,
      errors: [],
      formData: listing
    });
  } catch (error) {
    console.error('Edit listing form error:', error);
    return res.status(500).send('Failed to load edit listing page');
  }
};

exports.updateListing = async (req, res) => {
  const currentUserId = req.session?.user?.user_id;
  const listingId = Number(req.params.id);

  if (!currentUserId) {
    return res.redirect('/login');
  }

  if (!Number.isInteger(listingId) || listingId < 1) {
    deleteTempUpload(req.file);
    return res.status(404).send('Listing not found');
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

  if (req.uploadError) {
    errors.push(req.uploadError);
  }

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

  const renderEditWithErrors = async (statusCode = 400) => {
    const categories = await getCategories();

    return res.status(statusCode).render('listings/edit', {
      title: 'Edit Listing',
      listing: {
        listing_id: listingId,
        image_path: getListingImagePath(listingId)
      },
      categories,
      errors,
      formData
    });
  };

  if (errors.length > 0) {
    deleteTempUpload(req.file);
    return renderEditWithErrors(400);
  }

  try {
    const [listingRows] = await db.query(
      'SELECT listing_id, user_id, expiry_date, status FROM FOOD_LISTING WHERE listing_id = ?',
      [listingId]
    );

    if (listingRows.length === 0) {
      deleteTempUpload(req.file);
      return res.status(404).send('Listing not found');
    }

    if (listingRows[0].user_id !== currentUserId) {
      deleteTempUpload(req.file);
      return res.status(403).send('You are not allowed to edit this listing');
    }

    const isExpired = listingRows[0].expiry_date && new Date(listingRows[0].expiry_date) < new Date(new Date().toDateString());
    const isRemoved = listingRows[0].status === 'REMOVED';

    if (isExpired || isRemoved) {
      deleteTempUpload(req.file);
      return res.status(403).send('Expired or removed listings cannot be edited.');
    }

    const [categoryRows] = await db.query(
      'SELECT category_id FROM CATEGORY WHERE category_id = ?',
      [categoryId]
    );

    if (categoryRows.length === 0) {
      deleteTempUpload(req.file);
      errors.push('Selected category does not exist');
      return renderEditWithErrors(400);
    }

    await db.query(`
      UPDATE FOOD_LISTING
      SET
        category_id = ?,
        title = ?,
        description = ?,
        quantity = ?,
        expiry_date = ?,
        collection_start = ?,
        collection_end = ?,
        pickup_location = ?
      WHERE listing_id = ?
        AND user_id = ?
    `, [
      categoryId,
      title,
      description,
      quantity,
      expiryDate,
      collectionStart,
      collectionEnd,
      pickupLocation,
      listingId,
      currentUserId
    ]);

    if (req.file) {
      const extension = path.extname(req.file.originalname).toLowerCase();
      const finalPath = path.join(listingUploadDir, `listing-${listingId}${extension}`);

      for (const existingExtension of ['jpg', 'jpeg', 'png', 'webp']) {
        const existingPath = path.join(listingUploadDir, `listing-${listingId}.${existingExtension}`);

        if (fs.existsSync(existingPath)) {
          fs.unlinkSync(existingPath);
        }
      }

      fs.renameSync(req.file.path, finalPath);
    }

    return res.redirect(`/listings/${listingId}`);
  } catch (error) {
    console.error('Update listing error:', error);
    deleteTempUpload(req.file);
    errors.push('Server error. Please try again.');
    return renderEditWithErrors(500);
  }
};

exports.removeListing = async (req, res) => {
  const currentUserId = req.session?.user?.user_id;
  const listingId = Number(req.params.id);

  if (!currentUserId) {
    return res.redirect('/login');
  }

  if (!Number.isInteger(listingId) || listingId < 1) {
    return res.status(404).send('Listing not found');
  }

  try {
    const [listingRows] = await db.query(
      'SELECT listing_id, user_id, expiry_date, status FROM FOOD_LISTING WHERE listing_id = ?',
      [listingId]
    );

    if (listingRows.length === 0) {
      return res.status(404).send('Listing not found');
    }

    if (listingRows[0].user_id !== currentUserId) {
      return res.status(403).send('You are not allowed to remove this listing');
    }

    await db.query(
      "UPDATE FOOD_LISTING SET status = 'REMOVED' WHERE listing_id = ? AND user_id = ?",
      [listingId, currentUserId]
    );

    return res.redirect('/my-listings');
  } catch (error) {
    console.error('Remove listing error:', error);
    return res.status(500).send('Failed to remove listing');
  }
};

exports.getMyClaims = async (req, res) => {
  const currentUserId = req.session?.user?.user_id;
  const tab = (req.query.tab || 'active').trim().toLowerCase();

  if (!currentUserId) {
    return res.redirect('/login');
  }

  const validTabs = ['active', 'pending', 'completed', 'expired'];
  const selectedTab = validTabs.includes(tab) ? tab : 'active';

  const conditions = ['cl.user_id = ?'];
  const params = [currentUserId];

  if (selectedTab === 'active') {
    conditions.push("cl.status = 'CONFIRMED'");
    conditions.push('(fl.expiry_date IS NULL OR fl.expiry_date >= CURDATE())');
  }

  if (selectedTab === 'pending') {
    conditions.push("cl.status = 'PENDING'");
  }

  if (selectedTab === 'completed') {
    conditions.push("cl.status = 'COMPLETED'");
  }

  if (selectedTab === 'expired') {
    conditions.push("fl.expiry_date < CURDATE()");
    conditions.push("cl.status <> 'COMPLETED'");
  }

  try {
    const [countRows] = await db.query(`
      SELECT
        SUM(CASE WHEN cl.status = 'CONFIRMED' AND (fl.expiry_date IS NULL OR fl.expiry_date >= CURDATE()) THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN cl.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN cl.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN fl.expiry_date < CURDATE() AND cl.status <> 'COMPLETED' THEN 1 ELSE 0 END) AS expired_count
      FROM CLAIM cl
      JOIN FOOD_LISTING fl ON cl.listing_id = fl.listing_id
      WHERE cl.user_id = ?
    `, [currentUserId]);

    const [claims] = await db.query(`
      SELECT
        cl.claims_id,
        cl.called_at,
        cl.status AS claim_status,
        fl.listing_id,
        fl.title,
        fl.description,
        fl.quantity,
        fl.expiry_date,
        fl.collection_start,
        fl.collection_end,
        fl.pickup_location,
        fl.status AS listing_status,
        c.name AS category_name,
        u.username AS owner_username
      FROM CLAIM cl
      JOIN FOOD_LISTING fl ON cl.listing_id = fl.listing_id
      JOIN CATEGORY c ON fl.category_id = c.category_id
      JOIN USER u ON fl.user_id = u.user_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY cl.called_at DESC, cl.claims_id DESC
    `, params);

    return res.render('claims/my-claims', {
      title: 'My Claims',
      claims: attachListingImages(claims),
      selectedTab,
      counts: countRows[0] || {}
    });
  } catch (error) {
    console.error('My claims error:', error);
    return res.status(500).send('Failed to load my claims');
  }
};






