// const { getDatabase } = require("./db");
const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const { errorLog, backupLog } = require("./db");

let redirectLink = "https://memorify-q4q0.onrender.com/auth/callback";
if(process.env.DEBUG_MODE === "true")
{
  redirectLink = 'http://localhost:5000/auth/callback';
}

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: redirectLink,
});

async function createBackupGeneric(spotifyPlaylist, userId) {
  try {
    if (spotifyPlaylist === 'Discover Weekly' || spotifyPlaylist === 'Release Radar') {
      
      // Get spotifyPlaylist (Discover Weekly or Release Radar)
      const userPlaylists = await spotifyApi.getUserPlaylists(userId);
      const playlists = userPlaylists.body.items;

      const originalPlaylist = playlists.find(
        (playlist) => 
          playlist.name === spotifyPlaylist &&
          playlist.owner.display_name === "Spotify" &&
          playlist.owner.id === 'spotify'
      );

      if (originalPlaylist) {
        let date;
        if(spotifyPlaylist === 'Discover Weekly') {
          date = await calculateLastMonday();
        }
        else {
          date = await calculateLastFriday();
        }
        
        const originalPlaylistId = originalPlaylist.id;
        const strippedSpotifyPlaylist = spotifyPlaylist.replace(/\s+/g, '');

        const existingMemorifiedPlaylist = playlists.find(
          (playlist) => playlist.name === `Memorified${strippedSpotifyPlaylist} - ${date}`
        );

        if (!existingMemorifiedPlaylist) {
          const options = {
            description: `Memorified ${spotifyPlaylist} playlist created by Memorify.`,
            collaborative: false,
            public: false,
          };

          // Create the new playlist
          const newPlaylist = await spotifyApi.createPlaylist(
            `Memorified${strippedSpotifyPlaylist} - ${date}`,
            options
          );

          // Get list of tracks to backup
          const sourcePlaylistTracks = await spotifyApi.getPlaylistTracks(originalPlaylistId);

          // Extract track URIs
          const trackUris = sourcePlaylistTracks.body.items.map((item) => item.track.uri);

          // Add the tracks to the new playlist
          await spotifyApi.addTracksToPlaylist(newPlaylist.body.id, trackUris);
          backupLog(userId, spotifyPlaylist, 'Backup ran within createBackupGeneric code block');
        }
      } else {
        const errorMsg = `No ${spotifyPlaylist} playlist found for ${userId}`;
        errorLog(userId, '3', errorMsg, '');
      }
    } else {
      const errorMsg = `Incorrect ${spotifyPlaylist} name in createBackupGeneric`;
      errorLog(userId, '3', errorMsg, '');
    }

  } catch (error) {
    const errorMsg = "Error creating backup for :" + spotifyPlaylist;
    errorLog(userId, '4', errorMsg, error);
    throw error;
  }
}

async function createBackupGenericSamePlaylist(spotifyPlaylist, userId) {
  try {

    if (spotifyPlaylist === 'Discover Weekly' || spotifyPlaylist === 'Release Radar') {
      
      // Get spotifyPlaylist (Discover Weekly or Release Radar)
      const userPlaylists = await spotifyApi.getUserPlaylists(userId);
      const playlists = userPlaylists.body.items;

      const originalPlaylist = playlists.find(
        (playlist) => playlist.name === spotifyPlaylist
      );

      if (originalPlaylist) {
        const originalPlaylistId = originalPlaylist.id;
        const strippedSpotifyPlaylist = spotifyPlaylist.replace(/\s+/g, '');

        let existingMemorifiedPlaylist = playlists.find(
          (playlist) => playlist.name === `Memorified${strippedSpotifyPlaylist}`
        );

        if (!existingMemorifiedPlaylist) {
          const options = {
            description: `Memorified ${spotifyPlaylist} playlist created by Memorify.`,
            collaborative: false,
            public: false,
          };

          // Create the new playlist
          existingMemorifiedPlaylist = await spotifyApi.createPlaylist(
            `Memorified${strippedSpotifyPlaylist}`,
            options
          );
        }

        // Get list of tracks to backup
        const sourcePlaylistTracks = await spotifyApi.getPlaylistTracks(originalPlaylistId);

        // Extract track URIs
        const trackUris = sourcePlaylistTracks.body.items.map((item) => item.track.uri);

        // Get existing tracks from the memorified playlist
        const existingTracks = await spotifyApi.getPlaylistTracks(existingMemorifiedPlaylist.id);
        const existingTrackUris = new Set(existingTracks.body.items.map((item) => item.track.uri));

        // Filter out tracks that are already in the memorified playlist
        const newTrackUris = trackUris.filter(uri => !existingTrackUris.has(uri));

        if (newTrackUris.length > 0) {
          // Add the new tracks to the memorified playlist
          await spotifyApi.addTracksToPlaylist(existingMemorifiedPlaylist.id, newTrackUris);
        }
      } else {
        const errorMsg = `No ${spotifyPlaylist} playlist found for ${userId}`;
        errorLog(userId, '3', errorMsg, '');
      }
    } else {
      const errorMsg = `Incorrect ${spotifyPlaylist} name in createBackupGenericSamePlaylist`;
      errorLog(userId, '3', errorMsg, '');
    }
  } catch (error) {
    const errorMsg = "Error creating backup for :" + spotifyPlaylist;
    errorLog(userId, '4', errorMsg, error);
    throw error;
  }
}


async function createBackupDaylists(userId)
{
  try {
    // Get Daylist playlist
    const userPlaylists = await spotifyApi.getUserPlaylists(userId);
    const playlists = userPlaylists.body.items;

    const daylist = playlists.find(
      (playlist) =>
        playlist.name.startsWith("daylist") &&
        playlist.owner.display_name === "Spotify" &&
        playlist.description.startsWith("You listened to ") &&
        playlist.images?.some(image => image.url.includes("daylist"))
    );

    if(daylist)
    {
      const daylistId = daylist.id;
      
      const spotifyDaylistName = daylist.name;
      const newDaylistDescription = `Memorified Daylist: ${spotifyDaylistName}`;
      
      const currentDate = new Date().toISOString().split("T")[0];
      const newDaylistName = `MemorifiedDaylist - ${currentDate}`;
      
      const existingMemorifiedDaylist = playlists.find(
        (playlist) => 
          playlist.name === `${newDaylistName}` &&
          playlist.description === `${newDaylistDescription}`
      );
      
      if (!existingMemorifiedDaylist) {  
        const options = {
          description: `${newDaylistDescription}`,
          collaborative: false,
          public: false,
        };
  
        // Create the new playlist
        const newPlaylist = await spotifyApi.createPlaylist(
          `${newDaylistName}`,
          options
        );
  
        // Get list of tracks to backup
        const sourcePlaylistTracks = await spotifyApi.getPlaylistTracks(
          daylistId
        );
  
        // Extract track URIs
        const trackUris = sourcePlaylistTracks.body.items.map(
          (item) => item.track.uri
        );
  
        // Add the tracks to the new playlist
        await spotifyApi.addTracksToPlaylist(newPlaylist.body.id, trackUris);
      }
    }
    else {
      const errorMsg = "No daylist found for user " + `${userId}`;
      errorLog(userId, '2', errorMsg);
    }
  } catch (error) {
    const errorMsg = "Error in createBackupDaylists";
    errorLog(userId, '4', errorMsg, error);
    throw error;
  }
}

async function createBackupDaylistsSamePlaylist(userId) {
  try {
    // Get Daylist playlist
    const userPlaylists = await spotifyApi.getUserPlaylists(userId);
    const playlists = userPlaylists.body.items;

    const daylist = playlists.find(
      (playlist) =>
        playlist.name.startsWith("daylist") &&
        playlist.owner.display_name === "Spotify" &&
        playlist.description.startsWith("You listened to ") &&
        playlist.images?.some(image => image.url.includes("daylist"))
    );

    if (daylist) {
      const daylistId = daylist.id;
            
      const newDaylistName = 'MemorifiedDaylist';
      
      let existingMemorifiedDaylist = playlists.find(
        (playlist) => 
          playlist.name === `${newDaylistName}`
      );

      if (!existingMemorifiedDaylist) {  
        const options = {
          description: `${newDaylistDescription}`,
          collaborative: false,
          public: false,
        };

        // Create the new playlist
        existingMemorifiedDaylist = await spotifyApi.createPlaylist(
          `${newDaylistName}`,
          options
        );
      }

      // Get list of tracks to backup
      const sourcePlaylistTracks = await spotifyApi.getPlaylistTracks(daylistId);

      // Extract track URIs
      const trackUris = sourcePlaylistTracks.body.items.map((item) => item.track.uri);

      // Get existing tracks from the memorified daylist
      const existingTracks = await spotifyApi.getPlaylistTracks(existingMemorifiedDaylist.id);
      const existingTrackUris = new Set(existingTracks.body.items.map((item) => item.track.uri));

      // Filter out tracks that are already in the memorified daylist
      const newTrackUris = trackUris.filter(uri => !existingTrackUris.has(uri));

      if (newTrackUris.length > 0) {
        // Add the new tracks to the memorified daylist
        await spotifyApi.addTracksToPlaylist(existingMemorifiedDaylist.id, newTrackUris);
      }
    } else {
      const errorMsg = "No daylist found for user " + `${userId}`;
      errorLog(userId, '2', errorMsg);
    }
  } catch (error) {
    const errorMsg = "Error in createBackupDaylistsSamePlaylist";
    errorLog(userId, '4', errorMsg, error);
  }
}


async function calculateLastMonday()
{
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7; // Number of days to subtract to get to Monday
  const previousMonday = new Date(today);
  previousMonday.setDate(today.getDate() - diffToMonday);

  // Format the date as YYYY-MM-DD
  const previousMondayString = previousMonday.toISOString().split("T")[0];

  return previousMondayString;
}

async function calculateLastFriday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToFriday = (dayOfWeek + 2) % 7 + 1; // Number of days to subtract to get to the last Friday
  const previousFriday = new Date(today);
  previousFriday.setDate(today.getDate() - diffToFriday);

  // Format the date as YYYY-MM-DD
  const previousFridayString = previousFriday.toISOString().split("T")[0];

  return previousFridayString;
}


module.exports = {
  router,
  spotifyApi,
  createBackupDaylists,
  createBackupDaylistsSamePlaylist,
  createBackupGeneric,
  createBackupGenericSamePlaylist,
};
