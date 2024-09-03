/**
 * Express router providing API routes.
 * @module routes/index
 * @requires express
 */
const express = require('express');
#!/usr/bin/node

const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');
const  AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController')
const AuthController = require('../controllers/AuthController')
const FilesController = require('../controllers/FilesController')

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);

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

/**
 * @summary:Upload a file
 * @description: Upload a new file
 * @route: POST /upload
 */
router.post('/files', FilesController.postUpload);

// Route to get a file document by ID
router.get('/files/:id', FilesController.getShow);

// Route to get all file documents with pagination
router.get('/files', FilesController.getIndex);

/**
 * ### GET /files/:id/data
 * Retrieves a file by ID.
 */
router.get('/files/:id/data', FilesController.getFile);

router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

module.exports = router;
