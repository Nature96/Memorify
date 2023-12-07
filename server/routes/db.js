const { MongoClient } = require('mongodb');
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoUser = process.env.MONGODB_USERNAME;

const uri = `mongodb+srv://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPassword)}@cluster0.aqjapeo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let databasePromise;

async function connectToDatabase() {
  if (!databasePromise) {
    databasePromise = client.connect()
      .then(() => {
        console.log('Connected to MongoDB');
        return client.db('memorifyDb');
      })
      .catch(error => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }

  return databasePromise;
}

async function saveToDatabase(db, userDataId, email) {
  const userCollection = db.collection("users");

  const userDocument = {
    spotifyId: userDataId,
    email,
  };

  const result = await userCollection.updateOne(
    { spotifyId: userDataId },
    { $set: userDocument },
    { upsert: true }
  );

  console.log("User saved/updated:", result);

  return result;
}

async function saveRefreshTokenToDatabase(db, refreshToken, expiresIn) {
  const tokenCollection = db.collection("tokens");

   // Calculate expiration time in milliseconds
   const expirationMilliseconds = Date.now() + expiresIn * 1000;

   // Create a Date object using the calculated expiration time
   const expiresAt = new Date(expirationMilliseconds);

  const tokenDocument = {
    refreshToken,
    expiresAt: expiresAt,
  };

  const result = await tokenCollection.updateOne(
    {}, // No specific criteria since it's a single token
    { $set: tokenDocument },
    { upsert: true }
  );

  console.log("Refresh token saved/updated:", result);

  return result;
}

async function getRefreshTokenExpireValue(db) {
  const tokenCollection = db.collection("tokens");

  const tokenDocument = await tokenCollection.findOne({});
  if (tokenDocument) {
    return tokenDocument.expiresAt;
  } else {
    return null; // Handle the case when no token is found
  }
}



module.exports = {
  connectToDatabase,
  saveToDatabase,
  saveRefreshTokenToDatabase,
  getRefreshTokenExpireValue
};