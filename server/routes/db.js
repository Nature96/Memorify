const { MongoClient } = require('mongodb');
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoUser = process.env.MONGODB_USERNAME;

const uri = `mongodb+srv://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPassword)}@cluster0.aqjapeo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let database; // Variable to store the database instance

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    database = client.db('memorifyDb'); // Replace with your database name
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

function getDatabase() {
  return database;
}

module.exports = {
  connectToDatabase,
  getDatabase,
};
