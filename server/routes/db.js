const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { User, Token, AuthLog, BackupLog, ErrorLog, DebugLog, EventLog} = require('./models');
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoUser = process.env.MONGODB_USERNAME;

const uri = `mongodb+srv://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPassword)}@cluster0.aqjapeo.mongodb.net/?retryWrites=true&w=majority`;
const uriWithDb = uri.replace(/\/?(\?|$)/, '/memorifyDb$1');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let databasePromise;

// Old function
// async function connectToDatabase() {
//   if (!databasePromise) {
//     databasePromise = client.connect()
//       .then(() => {
//         console.log('Connected to MongoDB');
//         return client.db('memorifyDb');
//       })
//       .catch(error => {
//         console.error('Error connecting to MongoDB:', error);
//         throw error;
//       });
//   }

//   return databasePromise;
// }

// New function
async function connectToDatabase() {
  if (!databasePromise) {
    databasePromise = mongoose.connect(uriWithDb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
      return mongoose.connection;
    })
    .catch(error => {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    });
  }

  return databasePromise;
}

// Old function
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

  // console.log("User saved/updated:", result);

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

  // console.log("Refresh token saved/updated:", result);

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

function formatDate(date) {
  const pad = (num) => (num < 10 ? '0' : '') + num;

  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const yyyy = date.getFullYear();
  const HH = pad(date.getHours());
  const MM = pad(date.getMinutes());
  const SS = pad(date.getSeconds());

  return `${mm}/${dd}/${yyyy} ${HH}:${MM}:${SS}`;
}



async function errorLog(userId = '', severity, errorMsg, error = '', time = formatDate(new Date())) {
  try {
    const result = await ErrorLog.create({ 
      userId,
      severity,
      errorMsg,
      error,
      time
    });
  } catch (err) {
    console.error("Error creating error log:", err);
  }
}

async function authLog(userId, time = formatDate(new Date())) {
  try {
    const result = await AuthLog.create({ 
      userId,
      time
    });
  } catch (err) {
    errorLog(userId, '2', "Error creating auth log", err);
  }
}



module.exports = {
  connectToDatabase,
  saveToDatabase,
  saveRefreshTokenToDatabase,
  getRefreshTokenExpireValue,
  errorLog,
  authLog,
};