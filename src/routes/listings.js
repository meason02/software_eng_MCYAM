const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const listingController = require('../controllers/listingController');

const uploadTempDir = path.join(__dirname, '..', 'public', 'uploads', 'listings', 'tmp');
fs.mkdirSync(uploadTempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadTempDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, or WEBP images are allowed.'));
    }

    cb(null, true);
  }
});

const handleListingImageUpload = (req, res, next) => {
  upload.single('listing_image')(req, res, (error) => {
    if (error) {
      req.uploadError = error.message || 'Image upload failed.';
    }

    next();
  });
};

router.get('/create', listingController.showCreateListing);
router.post('/create', handleListingImageUpload, listingController.createListing);
router.post('/:id/claim', listingController.createClaim);
router.post('/:id/claim/:claimId/status', listingController.updateClaimStatus);
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);

module.exports = router;
