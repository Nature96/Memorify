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

    console.log("User Data:", userData);

    // Get today's date in the required format (e.g., "2023-10-10")
    const today = new Date().toISOString().split("T")[0];

    // Get Discover Weekly and Release Radar playlists
    console.log("userId: ", userData.id);
    const playlistsResponse = await spotifyApi.getUserPlaylists(userData.id);

    const playlists = playlistsResponse.body.items;
    // for (const playlist of playlists) {
    //     // console.log(playlist.name);
    //   }

    const discoverWeekly = playlists.find(
      (playlist) => playlist.name === "Discover Weekly"
    );
    const releaseRadar = playlists.find(
      (playlist) => playlist.name === "Release Radar"
    );

    console.log("discoverWeeklyId: ", discoverWeekly.id);
    console.log("releaseRadarId: ", releaseRadar.id);

    // Create new playlists
    await createBackupPlaylist(
      discoverWeekly.id,
      `MemorifiedDiscoverWeekly - ${today}`
    );
    await createBackupPlaylist(
      releaseRadar.id,
      `MemorifiedReleaseRadar - ${today}`
    );

    const db = getDatabase();
    await saveToDatabase(db, email, refresh_token);

    res.redirect("http://localhost:3000/successful-sign-up");
  } catch (error) {
    console.log(error);
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

async function createBackupPlaylist(sourcePlaylistId, backupPlaylistName) {
  const user = await spotifyApi.getMe();
  console.log("user in create: ", user);
  const userId = user.body.id;
  console.log("userId in create: ", userId);

  const options = {
    description: "Memorified playlist created by Memorify, ",
    collaborative: false,
    public: false,
  };

  // Create the new playlist
  const newPlaylist = await spotifyApi.createPlaylist(
    backupPlaylistName,
    options
  );

  console.log("newPlaylist: ", newPlaylist);

  // Get the tracks from the source playlist
  const sourcePlaylistTracks = await spotifyApi.getPlaylistTracks(
    sourcePlaylistId
  );

  console.log("source playlist: ", sourcePlaylistTracks);

  // Extract track URIs
  const trackUris = sourcePlaylistTracks.body.items.map(
    (item) => item.track.uri
  );

  console.log("track uris: ", trackUris);

  // Add the tracks to the new playlist
  await spotifyApi.addTracksToPlaylist(newPlaylist.body.id, trackUris);
}

module.exports = router;
