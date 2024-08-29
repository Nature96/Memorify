import React from "react";
import "./UnsuccessfulSignUp.css"; // Import the CSS file for styling

const UnsuccessfulSignUp = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <h1 className="error-heading">Sign Up Unsuccessful</h1>
        <p className="error-description">
          Oops! It seems there was an issue during the sign-up process and
          authentication with Spotify.
        </p>

        <div className="retry-info">
          <h2 className="retry-heading">Retry Sign Up</h2>
          <p>
            To retry signing up, please revisit the sign-up page and ensure all
            steps are completed correctly.
          </p>
        </div>

        <div className="contact-info">
          <h2 className="contact-heading">Need Assistance?</h2>
          <p>
            If you encounter persistent issues, please{" "}
            <a href="mailto:nisargntanna@gmail.com" className="contact-link-unsuccessful">
              contact us
            </a>{" "}
            for further assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnsuccessfulSignUp;
