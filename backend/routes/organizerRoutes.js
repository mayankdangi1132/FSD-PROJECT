const express = require('express');
const { getPublicOrganizers } = require('../controllers/userController');

const router = express.Router();

// public: just the names / descriptions / logos of clubs and departments (no events)
router.get('/', getPublicOrganizers);

module.exports = router;
