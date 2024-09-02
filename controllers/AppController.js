const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
/**
   * Get the status of the API
   *
   * @async
   * @method getStatus
   * @param {Request} req - The HTTP request
   * @param {Response} res - The HTTP response
   * @returns {Object} - Status of the API
   * @description Calls the `isAlive` method to check if the Redis connection is alive
   */
  static async getStatus(req, res) {
    const redisStatus = await redisClient.isAlive();
    res.status(200).send({
      redis: redisStatus,
    });
  }
  /**
   * Get the stats of the API
   *
   * @async
   * @method getStats
   * @param {Request} req - The HTTP request
   * @param {Response} res - The HTTP response
   * @returns {Object} - Stats of the API
   * @description Retrieves the count of users and files
   */

  static async getStats(req, res) {
    try {
      const userscount = await dbClient.nbUser();
      const fileCount = await dbClient.nbFiles();

      res.Status(200).send({
        users: userscount,
        files: fileCount,
      });
    } catch (error) {
      res.Status(500).send({ error: 'Error fetching stats' });
    }
  }
}

module.exports = AppController;
