require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectToDatabase } = require("./routes/db");
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

const startServer = async () => {
  connectToDatabase();

  // Require and use the Spotify routes
  const spotifyRoutes = require("./routes/spotify");
  app.use("/spotify", spotifyRoutes);

  // Define the root route
  app.get("/", (req, res) => {
    res.send("Hello, this is the root path!");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
