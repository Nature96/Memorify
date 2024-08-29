const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { User, Token, AuthLog, BackupLog, ErrorLog, DebugLog, EventLog} = require('./models');
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoUser = process.env.MONGODB_USERNAME;

const uri = `mongodb+srv://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPassword)}@cluster0.aqjapeo.mongodb.net/?retryWrites=true&w=majority`;
const uriWithDb = uri.replace(/\/?(\?|$)/, '/memorifyDb$1');
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let databasePromise;

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

  // eventLog('', '1', 'Connected to database');
  return databasePromise;
}

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
async function saveToDatabase(userDataId, email) {
  const userDocument = {
    spotifyId: userDataId,
    email,
  };

  try {
    const result = await User.updateOne(
      { spotifyId: userDataId },
      { $set: userDocument },
      { upsert: true }
    );

    return result;
  } catch (error) {
    errorLog(userDataId, "5", "Error saving/updating user:", error);
  }
}

// Old function
// async function saveToDatabase(db, userDataId, email) {
//   const userCollection = db.collection("users");

//   const userDocument = {
//     spotifyId: userDataId,
//     email,
//   };

  
//   const result = await userCollection.updateOne(
//     { spotifyId: userDataId },
//     { $set: userDocument },
//     { upsert: true }
//   );
//   return result;
// }




async function saveRefreshTokenToDatabase(userId, refreshToken, expiresIn) {
  // const tokenCollection = db.collection("tokens");

   // Calculate expiration time in milliseconds
   const expirationMilliseconds = Date.now() + expiresIn * 1000;

   // Create a Date object using the calculated expiration time
   const expiresAt = new Date(expirationMilliseconds);

  const tokenDocument = {
    userId,
    refreshToken,
    expiresAt: expiresAt,
  };

  try{
    const result = await Token.updateOne(
      {}, // No specific criteria since it's a single token
      { $set: tokenDocument },
      { upsert: true }
    );

    return result;
  }
  catch (error) {
    errorLog(userId, '4', 'Could not save refresh token to database.', error);
  }
}

async function getRefreshTokenExpireValue(db) {
  // const tokenCollection = db.collection("tokens");

  const tokenDocument = await Token.findOne({});
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

async function backupLog(userId, playlist, message = '', time = formatDate(new Date())) {
  try {
    const result = await BackupLog.create({ 
      userId,
      playlist,
      message,
      time
    });
  } catch (err) {
    errorLog(userId, '2', "Error creating backup log", err);
  }
}

async function eventLog(userId = '', severity, event, time = formatDate(new Date())) {
  try {
    const result = await EventLog.create({
      userId,
      severity,
      event,
      time
    });
  } catch (err) {
    errorLog(userId, '2', "Error creating event log:", err);
  }
}



module.exports = {
  connectToDatabase,
  saveToDatabase,
  saveRefreshTokenToDatabase,
  getRefreshTokenExpireValue,
  errorLog,
  authLog,
  backupLog,
  eventLog
};