const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

router.get('/', listingController.getAllListings);

module.exports = router;
