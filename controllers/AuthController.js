const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

/**
 * AuthController class handles user authentication.
 */
class AuthController {
/**
 * Connects a user by validating the provided Basic Auth credentials.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers.authorization - The authorization header
 *  containing Basic Auth credentials.
 * @param {Object} res - The response object.
 * @returns {Object} - Returns a JSON response with a token
 * if authentication is successful, otherwise an error message.
 */
  static async connect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credential = Buffer.from(base64Credentials, 'base64').toString('ut-8');
    const [email, password] = credential.split(':');

    if (!email || !password) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    //  Hash the password to compare with stored one
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    // Find the user in the database
    const user = await dbClient.getUser({ email, password: hashedPassword });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = uuidv4();

    await redisClient.set(token, user);

    return res.status(200).json({ token });
  }

  /**
 * Disconnects a user by invalidating their token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers['x-token'] - The token used for authentication.
 * @param {Object} res - The response object.
 *
 * @returns {Object} - Returns a 401 status with an 'Unauthorized'
 *                      message if the token is missing or invalid.
 *                    - Returns a 204 status with no content if the token
 *                     is successfully invalidated.
 */
  static async disconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await redisClient.get(token);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await redisClient.del(token);

    return res.status(204).end();
  }
}
module.exports = AuthController;
