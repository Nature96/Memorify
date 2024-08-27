const {
  connectToDatabase,
  saveToDatabase,
  saveRefreshTokenToDatabase,
  errorLog,
  authLog
} = require("./db");
const { 
  createBackupDaylists,
   createBackupGeneric,
   createBackupDaylistsSamePlaylist
 } = require("./spotify");
const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "https://memorify-q4q0.onrender.com/auth/callback",
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
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;
    await spotifyApi.setAccessToken(access_token);
    await spotifyApi.setRefreshToken(refresh_token);

    const userDataResponse = await spotifyApi.getMe();

    const userData = userDataResponse.body;
    const email = userData.email;
    const userId = userData.id;

    const db = await connectToDatabase();
    const userSaved = await saveToDatabase(db, userId, email);
    const tokenSaved = await saveRefreshTokenToDatabase(
      db,
      refresh_token,
      expires_in
    );

    if (
      (userSaved.modifiedCount === 1 ||
        userSaved.upsertedCount === 1 ||
        userSaved.matchedCount === 1) &&
      (tokenSaved.modifiedCount === 1 ||
        tokenSaved.upsertedCount === 1 ||
        tokenSaved.matchedCount === 1)
    )
    {
      res.redirect("https://memorifyclient.vercel.app/successful-sign-up");
      authLog(userId);
      await createBackupGeneric('Discover Weekly', userId);
      await createBackupGeneric('Release Radar', userId);
      await createBackupDaylistsSamePlaylist(userId);
    } else {
      res.redirect("https://memorifyclient.vercel.app/unsuccessful-sign-up");
      errorLog(userId, '3', 'Problem saving user and tokens in DB.');
    }
  } catch (error) {
    errorLog('', '3', 'Authentication flow not successful.', error);
    res.redirect("https://memorifyclient.vercel.app/unsuccessful-sign-up");
  }
});

module.exports = router;
