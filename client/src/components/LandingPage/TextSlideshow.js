import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const TextSlideshow = ({ texts }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 1500); // Change text every 3 seconds
    return () => clearInterval(interval);
  }, [texts.length]);

  return <span className="white-text">{texts[index]}</span>;
};

export default TextSlideshow;
