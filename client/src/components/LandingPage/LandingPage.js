import React from 'react';
import { Link } from "react-router-dom";
import './LandingPage.css';
import logo from '../../icons/memorify-high-resolution-logo-color-on-transparent-background.png'; // Import the logo image

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="content">
        <h1 className="heading">Never Miss a Beat.</h1>
        <p className="description">
          Your <span className='white-text'>Discover Weekly</span> and <span className='white-text'>Release Radar</span> playlists, effortlessly saved and always accessible.
        </p>
        <p className="description">
          Runs automatically - let us handle the boring part.
        </p>
        <Link to="/sign-up">
          <button className="cta-button">Get Started with Memorify</button>
        </Link>
      </div>
      <img src={logo} alt="Memorify Logo" className="app-logo" /> {/* Use the logo image */}
    </div>
  );
};

export default LandingPage;
