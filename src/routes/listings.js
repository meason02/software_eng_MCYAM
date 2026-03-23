const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

router.get('/create', listingController.showCreateListing);
router.post('/create', listingController.createListing);
router.post('/:id/claim', listingController.createClaim);
router.post('/:id/claim/:claimId/status', listingController.updateClaimStatus);
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);

module.exports = router;
