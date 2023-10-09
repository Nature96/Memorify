// SignUp.js
import React from 'react';
import './SignUp.css';
import spotifyIcon from './spotify-icon2.png';
import logo from '../../icons/memorify-high-resolution-logo-white-on-transparent-background.png'; // Import the logo image


const SignUp = () => {
  return (
    <div className="sign-up-page">
      <div className="content">
        <img src={spotifyIcon} alt="Spotify Icon" className="spotify-icon" />
        <h2 className="heading">Sign Up with Spotify</h2>
        <p className="description">
          Click the link below to sign in with Spotify, and we'll take care of the rest:
          <br />
          <br />
          <a
            href="http://localhost:5000/spotify/auth"
            target="_blank"
            rel="noopener noreferrer"
            className="sign-up-link"
          >
            Sign Up with Spotify
          </a>
        </p>
      </div>
      <img src={logo} alt="Memorify Logo" className="app-logo" /> {/* Use the logo image */}
    </div>
  );
};

export default SignUp;
