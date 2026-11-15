const express = require('express');
const { getPublicOrganizers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getPublicOrganizers);

module.exports = router;
