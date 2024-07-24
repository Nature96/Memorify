const {
  connectToDatabase,
  saveToDatabase,
  saveRefreshTokenToDatabase,
} = require("./db");
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
    console.log("data.body is: ", data.body);
    const { access_token, refresh_token, expires_in } = data.body;
    await spotifyApi.setAccessToken(access_token);
    await spotifyApi.setRefreshToken(refresh_token);

    const userDataResponse = await spotifyApi.getMe();

    const userData = userDataResponse.body;
    console.log("userData is: ", userData);
    const email = userData.email;
    const userId = userData.id;

    console.log("User Data:", userData);

    const db = await connectToDatabase();
    console.log("db is: ", db);
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
    ) {
      res.redirect("http://localhost:3000/successful-sign-up");
    } else {
      console.log;
      res.redirect("http://localhost:3000/unsuccessful-sign-up");
    }
  } catch (error) {
    console.error("error: ", error);
    res.redirect("http://localhost:3000/unsuccessful-sign-up");
  }
});

// TODO:  moved to db.js for now. If this doesn't work, uncomment the following block and remove it from db.js, along with the pertinent export in db.js.
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

//   console.log("User saved/updated:", result);

//   return result;
// }

// TODO:  moved to db.js for now. If this doesn't work, uncomment the following block and remove it from db.js, along with the pertinent export in db.js.
// async function saveRefreshTokenToDatabase(db, refreshToken, expiresIn) {
//   const tokenCollection = db.collection("tokens");

//   const tokenDocument = {
//     refreshToken,
//     expiresInSeconds: expiresIn, // Store expires_in value directly
//   };

//   const result = await tokenCollection.updateOne(
//     {}, // No specific criteria since it's a single token
//     { $set: tokenDocument },
//     { upsert: true }
//   );

//   console.log("Refresh token saved/updated:", result);

//   return result;
// }

module.exports = router;
