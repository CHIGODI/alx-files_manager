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
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.log('Missing authorization  headers');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const base64Credentials = authHeader.split(' ')[1];
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

      const [email, password] = decodedCredentials.split(':');
      const hashedPwd = crypto.createHash('sha1').update(password).digest('hex');

      const usersCollection = dbClient.client.db.collection('users');
      const found = await usersCollection.findOne({ email, password: hashedPwd });

      if (!found) {
        console.log('User not found');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const redisKey = `Auth_${uuidv4()}`;
      const expiration = 3600 * 24;

      await redisClient.set(redisKey, JSON.stringify(found), expiration);
      return res.json({ token: redisKey });
    } catch (error) {
      console.log(`getConnect Error -> ${error}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await redisClient.get(`Auth_${token}`);
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(token);

      return res.status(204).send();
    } catch (error) {
      console.error(`getDisconnect Error -> ${error}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
