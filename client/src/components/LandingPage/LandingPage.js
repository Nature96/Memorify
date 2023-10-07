import React from 'react';
import { Link } from "react-router-dom";
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="content">
        <h1 className="heading">Never Miss a Beat.</h1>
        <p className="description">
          Your Discover Weekly and Release Radar playlists, effortlessly saved and always accessible.
        </p>
        <p className="description">
          Runs automatically so that you don't have to.
        </p>
        <Link to="/sign-up">
          <button className="cta-button">Get Started with Memorify</button>
        </Link>
      </div>
      <div className="app-name">
        Memorify
      </div>
    </div>
  );
};

export default LandingPage;
