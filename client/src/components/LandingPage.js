import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div>
      <h1>Welcome to Spotify Playlist Backup</h1>
      <p>Read about our product and its features.</p>
      <Link to="/sign-up">
        <button>Sign Up</button>
      </Link>
    </div>
  );
};

export default LandingPage;
