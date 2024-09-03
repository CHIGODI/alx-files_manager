const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static getStatus(req, res) {
    try {
      const redisAlive = redisClient.isAlive();
      const dbAlive = dbClient.isAlive();

      res.status(200).json({
        redis: redisAlive,
        db: dbAlive,
      });
    } catch (error) {
      res.status(500).send('Error fetching status');
    }
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      res.status(200).json({
        users: usersCount,
        files: filesCount,
      });
    } catch (error) {
      console.log(`getStats error -> ${error}`)
      res.status(500).send({ error: 'Error fetching stats' });
    }
  }
}

module.exports = AppController;
