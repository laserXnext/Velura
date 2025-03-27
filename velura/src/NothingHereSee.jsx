import React, { useEffect, useState } from 'react';
import './css/NotFoundPage.css';

const NotFoundPage = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Effect for the floating animation of the "404" text
  useEffect(() => {
    const interval = setInterval(() => {
      const newX = 5 * Math.sin(Date.now() / 1000);
      const newY = 5 * Math.cos(Date.now() / 1500);
      setPosition({ x: newX, y: newY });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="not-found-container">
      <div 
        className="not-found-title" 
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)` 
        }}
      >
        404
      </div>
      <div className="not-found-subtitle">Page Not Found</div>
      <p className="not-found-message">
        Oops! The page you're looking for seems to have disappeared into the digital void.
      </p>
      <div className="shape-container">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>
      <button className="home-button" onClick={() => window.location.href = '/'}>
        Return Home
      </button>
    </div>
  );
};

export default NotFoundPage;