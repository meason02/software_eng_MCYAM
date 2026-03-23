const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

router.get('/create', listingController.showCreateListing);
router.post('/create', listingController.createListing);
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);

module.exports = router;
