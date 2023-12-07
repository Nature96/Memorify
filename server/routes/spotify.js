// const { getDatabase } = require("./db");
const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "http://localhost:5000/auth/callback",
});

async function createBackupPlaylists(userId, date) {
  try {
    // Get Discover Weekly and Release Radar playlists
    const userPlaylists = await spotifyApi.getUserPlaylists(userId);
    const playlists = userPlaylists.body.items;

    const discoverWeekly = playlists.find(
      (playlist) => playlist.name === "Discover Weekly"
    );

    const releaseRadar = playlists.find(
      (playlist) => playlist.name === "Release Radar"
    );

    const discoverWeeklyId = discoverWeekly.id;
    const releaseRadarId = releaseRadar.id;

    console.log("discoverWeeklyId: ", discoverWeeklyId);
    console.log("releaseRadarId: ", releaseRadarId);

    if (discoverWeekly) {
      // Create new playlists
      const options = {
        description: "Memorified Discover Weekly playlist created by Memorify.",
        collaborative: false,
        public: false,
      };

      // Create the new playlist
      const newPlaylist = await spotifyApi.createPlaylist(
        `MemorifiedDiscoverWeekly - ${date}`,
        options
      );

      // Get list of tracks to backup
      const sourcePlaylistTracks = await spotifyApi.getPlaylistTracks(
        discoverWeeklyId
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

    if (releaseRadar) {
      // Create new playlists
      const options = {
        description: "Memorified Release Radar playlist created by Memorify.",
        collaborative: false,
        public: false,
      };

      // Create the new playlist
      const newPlaylist = await spotifyApi.createPlaylist(
        `MemorifiedReleaseRadar - ${date}`,
        options
      );

      // Get list of tracks to backup
      const sourcePlaylistTracks = await spotifyApi.getPlaylistTracks(
        releaseRadarId
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
  } catch (error) {
    console.error("Error in createBackupPlaylists:", error);
    throw error;
  }
}

module.exports = {
  router,
  spotifyApi,
  createBackupPlaylists,
};
