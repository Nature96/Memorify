const { getDatabase } = require("./db");

const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "http://localhost:5000/spotify/callback",
});

/**
 * Function to generate a random string to set for state in auth workflow.
 *
 * @param {*} length
 * @returns
 */
var generateRandomString = function (length = 16) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Function to redirect user to auth link based on scopes.
 */
router.get("/auth", (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(
    [
      "user-read-private",
      "playlist-read-private",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-library-modify",
      "user-read-email",
    ],
    generateRandomString(16),
    true
  );
  res.redirect(authorizeURL);
});

/**
 * callback route for when you authenticate with Spotify
 */
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    // Fetch user data including email
    const userDataResponse = await spotifyApi.getMe();
    const userData = userDataResponse.body;
    const email = userData.email;

    const db = getDatabase();
    await saveToDatabase(db, email, refresh_token);

    res.redirect("http://localhost:3000/successful-sign-up");
  } catch (error) {
    res.redirect("http://localhost:3000/unsuccessful-sign-up");
  }
});

/**
 * Function to store the user's email and refreshToken to MongoDB "users" collection.
 *
 * @param {*} db db instance, usually called from getDatabase();
 * @param {*} email email to store
 * @param {*} refreshToken refresh token to store
 */
async function saveToDatabase(db, email, refreshToken) {
  // Assuming you have the 'db' instance available
  const userCollection = db.collection("users");

  // Check if the user already exists
  const existingUser = await userCollection.findOne({ email });

  if (existingUser) {
    // Update the refresh token for the existing user
    await userCollection.updateOne({ email }, { $set: { refreshToken } });
  } else {
    // Create a new user entry
    await userCollection.insertOne({ email, refreshToken });
  }
}

module.exports = router;
