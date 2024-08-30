const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');

/**
 * GET /status
 *
 * @route GET /status
 * @summary Get the stats of the API
 * @description Retrieves the count of users and files
 */
router.get('/status', AppController.getStatus);

/**
 * GET /stats
 * @route GET /stats
 * @summary Get the stats of the API
 * @description Retrieves the count of users and files
 */
router.get('/stats', AppController.getStats);

module.exports = router;
