const crypto = require('crypto');
const dbClient = require('../utils/db');

class UsersController {
  static generateSHA1Hash(input) {
    const hash = crypto.createHash('sha1');
    hash.update(input);
    return hash.digest('hex');
  }

  static async postNew(req, res) {
    const reqData = req.body;
    const usersCollection = dbClient.client.db.collection('users');

    if (!reqData.email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!reqData.password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const emailExists = await usersCollection.findOne({ email: reqData.email });
    if (emailExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPwd = UsersController.generateSHA1Hash(reqData.password);
    const { insertedId } = await usersCollection.insertOne({
      email: reqData.email,
      password: hashedPwd,
    });

    return res.status(201).json({
      id: insertedId,
      email: reqData.email,
    });
  }
}

module.exports = UsersController;
