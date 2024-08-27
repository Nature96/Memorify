require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { connectToDatabase, errorLog } = require("./routes/db");
const { iterateOverUsersReleaseAndDiscover, iterateOverUsersDaylists } = require("./routes/backup");
const handleAuth = require("./routes/auth");
// const handleCallback = require("./routes/callback");

// const authRouter = require("./routes/auth"); // Import the handleAuth function
// const { spotifyApi } = require("./routes/spotify"); // Import spotifyApi and related functions
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://memorifyclient.vercel.app");
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
    console.log("Backing up users' Discover Weekly and Release Radar playlists...");
    return;
    await iterateOverUsers();
    console.log("Discover Weekly and Release Radar backups completed.");
  } catch (error) {
    console.error("Error running the task:", error);
  }
  // });

 // Schedule the task to run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      await iterateOverUsersReleaseAndDiscover();
      await iterateOverUsersDaylists();
      console.log("Daylist backups completed.");
    } catch (error) { 
      console.error("Error backing up daylists:", error);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
