import React from 'react';
import '../CSS/banner.css';

const Banner = () => {
    return (
        <div className="banner">
            <div className="banner-text">
                <h1>Welcome to Your Career Companion!</h1>
                <p>Let's build your future together!</p>
            </div>
            <img src='./src/assets/knowledge.png' alt="Logo" className="banner-img" />
        </div>
    );
};

export default Banner;