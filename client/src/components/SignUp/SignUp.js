// SignUp.js
// import React from 'react';
// import './SignUp.css';
// import spotifyIcon from './spotify-icon2.png';
// import logo from '../../icons/memorify-high-resolution-logo-white-on-transparent-background.png'; // Import the logo image


// let redirectLink = "https://memorify-q4q0.onrender.com/auth";
// if(process.env.NODE_ENV === "development")
// {
//   redirectLink = "http://localhost:5000/auth";
// }
// console.log(redirectLink);

// const SignUp = () => {
//   return (
//     <div className="sign-up-page">
//       <div className="content">
//         <img src={spotifyIcon} alt="Spotify Icon" className="spotify-icon" />
//         <h2 className="heading">Sign Up with Spotify</h2>
//         <p className="description">
//           Click the link below to sign in with Spotify, and we'll take care of the rest:
//           <br />
//           <br />
//           <a
//             href={redirectLink}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="sign-up-link"
//           >
//             Sign Up with Spotify
//           </a>
//         </p>
//       </div>
//       <img src={logo} alt="Memorify Logo" className="app-logo" /> {/* Use the logo image */}
//     </div>
//   );
// };

// export default SignUp;

import React from 'react';
import './SignUp.css';
import spotifyIcon from './spotify-icon2.png';
import logo from '../../icons/memorify-high-resolution-logo-white-on-transparent-background.png'; // Import the logo image

let redirectLink = "https://memorify-q4q0.onrender.com/auth";
if (process.env.NODE_ENV === "development") {
  redirectLink = "http://localhost:5000/auth";
}
console.log(redirectLink);

const SignUp = () => {
  const handleSignUp = () => {
    window.open(redirectLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="sign-up-page">
      <div className="content">
        <img src={spotifyIcon} alt="Spotify Icon" className="spotify-icon" />
        <h2 className="heading">Sign Up with Spotify</h2>
        <p className="description">
          Click the button below to sign in with Spotify, and we'll take care of the rest:
          <br />
          <br />
          <br />

          <button className="sign-up-button" onClick={handleSignUp}>
            Sign Up with Spotify
          </button>
        </p>
      </div>
      <img src={logo} alt="Memorify Logo" className="app-logo" /> {/* Use the logo image */}
    </div>
  );
};

export default SignUp;

