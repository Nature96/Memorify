const { createBackupDaylists, createBackupGeneric } = require("./spotify");
const { connectToDatabase, saveRefreshTokenToDatabase } = require("./db");
const { spotifyApi } = require("./spotify");

async function refreshAccessTokenIfNecessary(db, refreshToken, expiresAt) {
  try {
    const accessToken = await spotifyApi.getAccessToken();

    // Calculate expiration time with buffer (5 minutes)
    const bufferMilliseconds = 5 * 60 * 1000; // 5 minutes in milliseconds
    const expirationWithBuffer = new Date(expiresAt - bufferMilliseconds);

    const currentDateTime = new Date();

    // Check if the current time is past the expiration with buffer
    const isExpired = currentDateTime >= expirationWithBuffer;

    if (isExpired || !accessToken) {
      await spotifyApi.setRefreshToken(refreshToken);
      const refreshedAccessToken = await spotifyApi.refreshAccessToken();

      const newAccessToken = refreshedAccessToken.body["access_token"];
      const newExpiresAt = refreshedAccessToken.body["expires_in"];
      await spotifyApi.setAccessToken(newAccessToken);

      result = await saveRefreshTokenToDatabase(db, refreshToken, newExpiresAt);
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
}

async function iterateOverUsersReleaseAndDiscover() {
  try {
    const db = await connectToDatabase();

    const userCollection = db.collection("users");
    const tokenCollection = db.collection("tokens");
    
    const cursor = userCollection.find();
    const tokens = await tokenCollection.findOne({});
    const refreshToken = tokens.refreshToken;
    const expiresAt = tokens.expiresAt;

    for await (const user of cursor) {
      const spotifyId = user.spotifyId;
      const email = user.email;

      try {
        await refreshAccessTokenIfNecessary(db, refreshToken, expiresAt);
        await createBackupGeneric('Discover Weekly', spotifyId);
        await createBackupGeneric('Release Radar', spotifyId);
        
      } catch (error) {
        console.log("Generic backup error processing user ID " + spotifyId + ": ", error);
      }
    }
  } catch (error) {
    console.error("Error in iterateOverUsersReleaseAndDiscover:", error);
  }
}

async function iterateOverUsersDaylists() {
  try {
    const db = await connectToDatabase();

    const userCollection = db.collection("users");
    const tokenCollection = db.collection("tokens");

    const cursor = userCollection.find();
    const tokens = await tokenCollection.findOne({});
    const refreshToken = tokens.refreshToken;
    const expiresAt = tokens.expiresAt;

    for await (const user of cursor) {
      const spotifyId = user.spotifyId;
      const email = user.email;

      try {
        await refreshAccessTokenIfNecessary(db, refreshToken, expiresAt);
        await createBackupDaylists(spotifyId);
      } catch (error) {
        console.log("Daylist backup error processing user ID " + spotifyId + ": ", error);
      }
    }
  } catch (error) {
    console.error("Error in iterateOverUsersDaylists:", error);
  }
}

module.exports = {
  iterateOverUsersReleaseAndDiscover,
  iterateOverUsersDaylists,
};
