const redis = require("redis");

class RedisClient {
    constructor() {
        this.client = redis.createClient();
        this.client.on("error", (err) => {
            console.error("Redis client error:", err);
        });
    }
    // check if the redis client si connected
    isAlive() {
        return this.client.connected;
    }
    // Retrieves a value from Redis for a given key
    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, vakue) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    }
    // Store  a value in Redis with an expiration time
    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, "EX", duration, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
    //  Deletes a value from Redis for a given Key
    async del(key) {
        return new Promise((resolve, reject) => {
          this.client.del(key, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
}

const RedisClient = new RedisClient();
module.exports = redisClient;