require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { connectToDatabase } = require("./routes/db");
const { iterateOverUsers } = require("./routes/backup");
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
  connectToDatabase();

  // Require and use the Spotify routes
  app.get("/auth", handleAuth);

  // app.get("/auth/callback", handleCallback);
  const spotifyRoutes = require("./routes/auth");
  app.use("/auth", spotifyRoutes);
  // app.use("/auth", authRouter);

  // Define the root route
  app.get("/", (req, res) => {
    res.send("Hello, this is the root path!");
  });

  // Schedule the task to run every Saturday at 2 AM (0 2 * * 6)
  // cron.schedule("0 2 * * 6", async () => {
  try {
    console.log("Running the task...");
    await iterateOverUsers();
    console.log("Task completed.");
  } catch (error) {
    console.error("Error running the task:", error);
  }
  // });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
