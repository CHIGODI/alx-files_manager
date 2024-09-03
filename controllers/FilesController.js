const { ReplSet } = require('mongodb/lib/core');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await redisClient.get(`Auth_${token}`);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorised' });
      }

      const { name, type, data, parentID } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (!data && type != folder) {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentID){
        const file = await dbClient.client.db.collections('files').findOne({'parentID': parentID});
        if (!file){
            return res.status(400).json({error: 'Parent not found'})
        }
        if (file.type !== folder){
            return res.status(400).json({error: 'Parent is not a folder'});
        } else {
            await dbClient.client.db.collections('file_manager').updateOne({name: name}, {userID: })
        }
      }
        const { insertedId } = await dbClient.client.db.collections('users').findOne({email: user.email})
        await dbClient.client.db.collections('files').insertOne({
            name: name,
            type: type,
            data: data,
            userID: insertedId,
            parentID: parentID,
        });


    } catch (error) {
      console.log(`postUpload Error -> ${error}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = FilesController;
