// utils/db.js

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

/**
 * DBClient class for managing MongoDB connection and operations.
 */
class DBClient {
  /**
   * Constructor that initializes the MongoDB client with the specified configuration.
   * The configuration is based on environment variables or default values.
   */
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;
    
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;
    this.isConnected = false;

    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        this.isConnected = true;
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
      });
  }

  /**
   * Checks if the MongoDB client is connected.
   * @returns {boolean} - Returns true if the connection is successful, otherwise false.
   */
  isAlive() {
    return this.isConnected;
  }

  /**
   * Asynchronously retrieves the number of users in the 'users' collection.
   * @returns {Promise<number>} - The number of documents in the 'users' collection.
   */
  async nbUsers() {
    if (!this.isAlive()) return 0;
    return this.db.collection('users').countDocuments();
  }

  /**
   * Asynchronously retrieves the number of files in the 'files' collection.
   * @returns {Promise<number>} - The number of documents in the 'files' collection.
   */
  async nbFiles() {
    if (!this.isAlive()) return 0;
    return this.db.collection('files').countDocuments();
  }
}

// Export a singleton instance of DBClient
const dbClient = new DBClient();
export default dbClient;
