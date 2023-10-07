// // server/routes/auth.js

// const express = require("express");
// const SpotifyWebApi = require("spotify-web-api-node");
// const router = express.Router();

// const spotifyApi = new SpotifyWebApi({
//   clientId: "0e75f419576246869c24069d7591c981",
//   clientSecret: "fb2607281fd142769b894e5b7b124f71",
//   redirectUri: "http://localhost:5000/callback", // Update with your redirect URI
// });

// router.get("/spotifyAuth", (req, res) => {
//   const authorizeURL = spotifyApi.createAuthorizeURL(
//     ["user-read-private", "playlist-read-private"],
//     "state"
//   );
//   console.log("authorizeURL is:");
//   console.log(authorizeURL);
//   res.redirect(authorizeURL);
// });

// router.get("/callback", async (req, res) => {
//   const { code } = req.query;
//   console.log(code);
//   return;
//   try {
//     const data = await spotifyApi.authorizationCodeGrant(code);
//     const { access_token, refresh_token } = data.body;
//     spotifyApi.setAccessToken(access_token);
//     spotifyApi.setRefreshToken(refresh_token);
//     res.redirect("http://localhost:3000/successful-sign-up"); // Update with your success route
//   } catch (error) {
//     res.redirect("http://localhost:3000/unsuccessful-sign-up"); // Update with your failure route
//   }
// });

// module.exports = router;