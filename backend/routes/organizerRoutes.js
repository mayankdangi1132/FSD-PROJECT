const express = require('express');
const { getPublicOrganizers } = require('../controllers/userController');

const router = express.Router();

router.get('/', getPublicOrganizers);

module.exports = router;
