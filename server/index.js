require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { connectToDatabase, errorLog, eventLog } = require("./routes/db");
const { iterateOverUsersReleaseAndDiscover, iterateOverUsersDaylists } = require("./routes/backup");
const handleAuth = require("./routes/auth");
// const handleCallback = require("./routes/callback");

// const authRouter = require("./routes/auth"); // Import the handleAuth function
// const { spotifyApi } = require("./routes/spotify"); // Import spotifyApi and related functions
const app = express();
const PORT = process.env.PORT || 5000;

let corsLink = "https://memorifyclient.vercel.app";
if(process.env.DEBUG_MODE === "true") corsLink = 'http://localhost:3000';

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", corsLink);
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

const startServer = async () => {
  await connectToDatabase();
  eventLog('', '1', 'Connected to MongoDB');

  // Require and use the Spotify routes
  app.get("/auth", handleAuth);

  const spotifyRoutes = require("./routes/auth");
  app.use("/auth", spotifyRoutes);

  // Define the root route
  // app.get("/", (req, res) => {
  //   res.send("Hello, this is the root path!");
  // });

  // Schedule the task to run every Saturday at 2 AM (0 2 * * 6)
  // cron.schedule("0 2 * * 6", async () => {
  try {
    // console.log("Backing up users' Discover Weekly and Release Radar playlists");
    eventLog('', '4', "Backing up users' Discover Weekly and Release Radar playlists in weekly cron");
    await iterateOverUsersReleaseAndDiscover();
    eventLog('', '1', 'iterateOverUsersReleaseAndDiscover ran in weekly cron');
  } catch (error) {
    errorLog('', '4', "Error backing up Release Radar and Discover Weekly playlists in weekly cron", error);
  }
  // });

 // Schedule the task to run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      eventLog('', '4', "Backing up users' Discover Weekly and Release Radar playlists in hourly cron");
      await iterateOverUsersReleaseAndDiscover();
      eventLog('', '1', "Backing up users' daylists in hourly cron");
      await iterateOverUsersDaylists();
      eventLog('', '1', "Backups completed in hourly cron");
    } catch (error) { 
      // console.error("Error backing up daylists:", error);
      errorLog('', '4', "Error backing up in hourly cron", error);
    }
  });

  app.listen(PORT, () => {
    eventLog('', '1', `Server is running on port ${PORT}`);
  });
};

startServer();
