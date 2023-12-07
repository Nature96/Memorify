const { createBackupPlaylists } = require("./spotify");
const { connectToDatabase, saveRefreshTokenToDatabase } = require("./db");
const { spotifyApi } = require("./spotify");

async function refreshAccessTokenIfNecessary(db, refreshToken, expiresAt) {
  try {
    console.log("in refreshAccess");
    const accessToken = await spotifyApi.getAccessToken();
    console.log("access token is: ", accessToken);
    console.log("expiresAt is: ", expiresAt);

    // Calculate expiration time with buffer (5 minutes)
    const bufferMilliseconds = 5 * 60 * 1000; // 5 minutes in milliseconds
    const expirationWithBuffer = new Date(expiresAt - bufferMilliseconds);

    const currentDateTime = new Date();

    // Check if the current time is past the expiration with buffer
    const isExpired = currentDateTime >= expirationWithBuffer;

    if (isExpired || !accessToken) {
      await spotifyApi.setRefreshToken(refreshToken);
      const refreshedAccessToken = await spotifyApi.refreshAccessToken();
      console.log("refreshedAccessToken: ", refreshedAccessToken);

      const newAccessToken = refreshedAccessToken.body["access_token"];
      const newExpiresAt = refreshedAccessToken.body["expires_in"];
      await spotifyApi.setAccessToken(newAccessToken);

      result = await saveRefreshTokenToDatabase(db, refreshToken, newExpiresAt);
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
}

async function iterateOverUsers() {
  console.log("in iterate");

  try {
    const db = await connectToDatabase();

    const userCollection = db.collection("users");
    const tokenCollection = db.collection("tokens");
    const today = new Date().toISOString().split("T")[0];

    const cursor = userCollection.find();
    const tokens = await tokenCollection.findOne({});
    const refreshToken = tokens.refreshToken;
    const expiresAt = tokens.expiresAt;

    // console.log("db is: ", db);

    for await (const user of cursor) {
      const spotifyId = user.spotifyId;
      const email = user.email;

      try {
        await refreshAccessTokenIfNecessary(db, refreshToken, expiresAt);
        // return;
        await createBackupPlaylists(spotifyId, today);
      } catch (error) {
        console.log("Error processing user ID " + spotifyId + ": ", error);
      }
    }
  } catch (error) {
    console.error("Error in iterateOverUsers:", error);
  }
}

module.exports = {
  iterateOverUsers,
};
