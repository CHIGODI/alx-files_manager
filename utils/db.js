const mongoose = require('mongoose');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

/**
 * Class for performing operations with Mongo service using Mongoose
 */
class DBClient {
  constructor() {
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected successfully to MongoDB server');
      this.db = mongoose.connection;
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      this.db = null;
    }
  }

  /**
   * Checks if connection to MongoDB is alive
   * @return {boolean} true if connection alive or false if not
   */
  isAlive() {
    return this.db && this.db.readyState === 1;
  }

  /**
   * Returns the number of documents in the collection users
   * @return {Promise<number>} amount of users
   */
  async nbUsers() {
    if (!this.isAlive()) return 0;
    const User = mongoose.model('User', new mongoose.Schema({}), 'users');
    return User.countDocuments();
  }

  /**
   * Returns the number of documents in the collection files
   * @return {Promise<number>} amount of files
   */
  async nbFiles() {
    if (!this.isAlive()) return 0;
    const File = mongoose.model('File', new mongoose.Schema({}), 'files');
    return File.countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
