import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './components/LandingPage/LandingPage';
import SignUp from './components/SignUp/SignUp';
import SuccessfulSignUp from './components/SuccessfulSignUp/SuccessfulSignUp';
import UnsuccessfulSignUp from './components/UnsuccessfulSignUp/UnsuccessfulSignUp';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/successful-sign-up" element={<SuccessfulSignUp />} />
        <Route path="/unsuccessful-sign-up" element={<UnsuccessfulSignUp />} />
      </Routes>
    </Router>
  );
};

export default App;
