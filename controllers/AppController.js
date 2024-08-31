const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

exports.getStatus = (req, res) => {
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
};

exports.getStats = async (req, res) => {
  try {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    res.status(200).json({
      users: usersCount,
      files: filesCount,
    });
  } catch (error) {
    res.status(500).send('Error fetching stats');
  }
};
