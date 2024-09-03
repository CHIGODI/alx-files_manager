const mongoose = require('mongoose');
require('dotenv').config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    mongoose.connect(uri);
    this.client = mongoose.connection;
    this.client.on('error', console.error.bind(console, 'MongoDB connection error:'));
  }

  isAlive() {
    return this.client.readyState === 1;
  }

  async nbUsers() {
    try {
      const count = await this.client.db.collection('users').countDocuments();
      return count;
    } catch (err) {
      console.error(`nbUsers Error -> ${err}`);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const count = await this.client.db.collection('files').countDocuments();
      return count;
    } catch (err) {
      console.error(`bnFiles Error -> ${err}`);
      return 0;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
