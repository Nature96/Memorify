// SuccessfulSignUp.js
import React from 'react';
import './SuccessfulSignUp.css';

const SuccessfulSignUp = () => {
  return (
    <div className="success-page">
      <div className="content">
        <h1 className="heading">Welcome to Memorify!</h1>
        <p className="description">
          Congratulations! You have successfully signed up and authenticated with Spotify.
        </p>

        <div className="backup-info">
          <h2 className="sub-heading">Automatic Playlist Backup</h2>
          <p>
            Your Spotify playlists will be automatically backed up once a week and stored in your
            Collection. The playlists will be named by date.
          </p>
        </div>

        <div className="opt-out-info">
          <h2 className="sub-heading">Opt Out of Backups</h2>
          <p>
            To opt out of the backups, simply log in to Spotify and click "Revoke Access" next to
            Memorify in your Spotify account settings.
          </p>
        </div>

        <div className="contact-info">
          <h2 className="sub-heading">Need Help?</h2>
          <p>
            If you have any issues or questions, please{' '}
            <a href="mailto:nisargntanna@gmail.com" className="contact-link">
              contact us
            </a>
            .
          </p>
        </div>
      </div>
      <div className="app-name-successful">
        Memorify
      </div>
    </div>
  );
};

export default SuccessfulSignUp;
