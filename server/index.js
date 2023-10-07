const express = require("express");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const spotifyApi = new SpotifyWebApi({
  clientId: "0e75f419576246869c24069d7591c981",
  clientSecret: "fb2607281fd142769b894e5b7b124f71",
  redirectUri: "http://localhost:5000/callback",
});

// Define the root route
app.get("/", (req, res) => {
  res.send("Hello, this is the root path!");
});

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get("/spotifyAuth", (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(
    ["user-read-private", "playlist-read-private"],
    generateRandomString(16),
    true
  );
  res.redirect(authorizeURL);
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    res.redirect("http://localhost:3000/successful-sign-up"); // Update with your success route
  } catch (error) {
    res.redirect("http://localhost:3000/unsuccessful-sign-up"); // Update with your failure route
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
