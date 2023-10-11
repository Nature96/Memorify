const { createBackupPlaylists } = require("./spotify");
const { getDatabase, connectToDatabase } = require("./db");
const { spotifyApi } = require("./spotify");

async function refreshAccessTokenIfNecessary(refreshToken) {
  try {
    if (!spotifyApi.getAccessToken() || spotifyApi.isAccessTokenExpired()) {
      const data = await spotifyApi.refreshAccessToken(refreshToken);
      const newAccessToken = data.body["access_token"];
      spotifyApi.setAccessToken(newAccessToken);
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
}

async function iterateOverUsers() {
  connectToDatabase();
  const db = getDatabase();
  const userCollection = db.collection("users");
  const today = new Date().toISOString().split("T")[0];

  const cursor = userCollection.find();

  for await (const user of cursor) {
    const spotifyId = user.spotifyId;
    const refreshToken = user.refreshToken;
    const email = user.email;

    try {
      await refreshAccessTokenIfNecessary(refreshToken);
      await createBackupPlaylists(spotifyId, today);
    } catch (error) {
      console.log("Error processing user ID " + spotifyId + ": ", error);
    }
  }
}

module.exports = {
  iterateOverUsers,
};
