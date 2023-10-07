import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Import Axios to make HTTP requests

const SignUp = () => {
  // const navigate = useNavigate();

  // const handleSpotifyAuth = async () => {
  //   try {
  //     // Trigger Spotify authentication by making a request to your server's endpoint
  //     await axios.get('http://localhost:5000/spotify/auth');
  //     navigate('/test'); // Redirect to home after initiating Spotify authentication
  //   } catch (error) {
  //     console.error('Error initiating Spotify authentication:', error);
  //   }
  // };

  return (
    <div>
      <h2>Sign Up with Spotify</h2>
      <p>
        Click the link below to sign in with Spotify:
        <a
          href="http://localhost:5000/spotify/auth"
          target="_blank" // Opens the link in a new tab/window
          rel="noopener noreferrer" // Recommended for security
        >
          Sign Up with Spotify
        </a>
      </p>
    </div>
  );
};

export default SignUp;
