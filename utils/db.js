const mongoose = require('mongoose');

// load environment variables
require('dotenv').config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    mongoose.connect(uri);
    this.client = mongoose.connection;
  }

  isAlive() {
    return this.client.readyState === 1;
  }

  async nbUsers() {
    if (!this.isAlive()) return 0;
    return this.client.db.collection('users').countDocuments();
  }

  async nbFiles() {
    if (!this.isAlive()) return 0;
    return this.client.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
