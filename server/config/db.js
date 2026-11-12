const mongoose = require('mongoose');
const seedDefaultsIfEmpty = require('../utils/seedDefaults');

let connectionPromise;
let mongodInstance;

const MONGOD_BINARY = 'C:\\Users\\g0526\\.cache\\mongodb-binaries\\mongod-x64-win32-8.2.6.exe';

process.env.MONGOMS_SYSTEM_BINARY = MONGOD_BINARY;
process.env.MONGOMS_PREFER_GLOBAL_PATH = 'true';
process.env.MONGOMS_DISABLE_POSTINSTALL = '1';

// Establish connection to the MongoDB database (with automatic in-memory fallback)
const connectDb = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = (async () => {
      const uri = process.env.MONGO_URI;

      // 1. Try external/Atlas MONGO_URI if configured
      if (
        uri &&
        !uri.includes('localhost') &&
        !uri.includes('127.0.0.1') &&
        !uri.includes('your_mongodb_uri') &&
        !uri.includes('<username>')
      ) {
        try {
          const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
          });
          console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
          await seedDefaultsIfEmpty();
          return conn.connection;
        } catch (err) {
          console.log(
            `Configured MongoDB unavailable (${err.message}). Falling back to In-Memory MongoDB...`.yellow
          );
        }
      }

      // 2. In-Memory fallback using MongoMemoryServer with cached binary
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        if (!mongodInstance) {
          mongodInstance = await MongoMemoryServer.create({
            binary: {
              systemBinary: MONGOD_BINARY,
            },
            instance: {
              launchTimeout: 60000,
            },
          });
        }
        const memoryUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`In-Memory MongoDB Connected at: ${memoryUri}`.green.bold);
        await seedDefaultsIfEmpty();
        return conn.connection;
      } catch (error) {
        connectionPromise = undefined;
        console.error(`MongoDB connection failed: ${error.message}`.red.underline.bold);
        throw error;
      }
    })();
  }

  return connectionPromise;
};

module.exports = connectDb;
