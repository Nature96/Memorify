const { MongoClient } = require('mongodb');
const { SpotifyApi, createBackupPlaylist } = require('./spotify');

const mongoURI = 'YOUR_MONGODB_URI';
const dbName = 'memorifyDb';

async function backupPlaylistsForAllUsers() {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('memorifyDb');
    const userCollection = db.collection('users');
    const users = await userCollection.find().toArray();

    for (const user of users) {
      // Assume user.refreshToken exists in the user document
      const spotifyApi = new SpotifyApi(user.refreshToken);

      // Implement function to get source playlist IDs for the user (e.g., Discover Weekly, Release Radar)
      const sourcePlaylistIds = getSourcePlaylistIdsForUser(user );

      for (const sourcePlaylistId of sourcePlaylistIds) {
        // Generate backup playlist name
        const backupPlaylistName = `MemorifiedPlaylist - ${new Date().toISOString()}`;

        // Create a backup playlist for the source playlist
        await createBackupPlaylist(spotifyApi, sourcePlaylistId, backupPlaylistName);
      }
    }
  } catch (error) {
    console.error('Error during backup:', error);
  } finally {
    await client.close();
  }
}





module.exports = { backupPlaylistsForAllUsers };