/**
 * Express router providing API routes.
 * @module routes/index
 * @requires express
 */
const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');

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

/**
 * POST /user
 * @route Post /users
 * @description Retrieve new users
 */

router.post('/users', UserController.postNew);

/**
 * Route for connecting a user.
 * @name get/connect
 * @function
 * @memberof module:routes/index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.get('/connect', AuthController.getCoonect);

/**
 * Route for disconnecting a user.
 * @name get/disconnect
 * @function
 * @memberof module:routes/index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.get('/disconnect', AuthController.getDisconnect);

/**
 * Route for getting the current user.
 * @name get/users/me
 * @function
 * @memberof module:routes/index
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.get('/users/me', AuthController.getMe);

module.exports = router;
