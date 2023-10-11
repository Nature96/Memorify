const { getDatabase } = require("./db");
const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "http://localhost:5000/auth/callback",
});

var generateRandomString = function (length = 16) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get("/", (req, res) => {
  console.log("in here");
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

router.get("/callback", async (req, res) => {
    console.log("now in here!");
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    const userDataResponse = await spotifyApi.getMe();
    const userData = userDataResponse.body;
    const email = userData.email;
    const userId = userData.id;

    console.log("User Data:", userData);

    const db = getDatabase();
    const result = await saveToDatabase(db, userId, email, refresh_token);

    if (result.modifiedCount === 1 || result.upsertedCount === 1) {
      res.redirect("http://localhost:3000/successful-sign-up");
    } else {
      res.redirect("http://localhost:3000/unsuccessful-sign-up");
    }
  } catch (error) {
    console.error(error);
    res.redirect("http://localhost:3000/unsuccessful-sign-up");
  }
});

async function saveToDatabase(db, userDataId, email, refreshToken) {
  const userCollection = db.collection("users");

  const userDocument = {
    spotifyId: userDataId,
    email,
    refreshToken,
  };

  const result = await userCollection.updateOne(
    { spotifyId: userDataId },
    { $set: userDocument },
    { upsert: true }
  );

  console.log("User saved/updated:", result);

  return result;
}

module.exports = router;
