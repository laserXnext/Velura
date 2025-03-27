import React from 'react';
import { Link } from 'react-router-dom';
import '../css/footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <img src='./src/assets/logo.png' alt="Logo" className="footer-logo"/> 
            <div className="footer-section">
                <div className="footer-service">
                    <h3>Our Services</h3>
                    <ul>
                        <li>Find Sarees</li>
                        <li>Find Material</li>
                        <li>Feedback</li>
                        <li>Customer Support</li>
                    </ul>
                </div>
                <div className="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to ="/">Home</Link></li>
                        <li><Link to ="/about">About Us</Link></li>
                        <li><Link to ="/product">Sarees</Link></li>
                    </ul>
                </div>
                <div className="footer-socila-media">
                    <h3>Follow Us</h3>
                    <ul className="social-media-links">
                        <li><i className="uil uil-facebook facebook"></i></li>
                        <li><a href="https://www.linkedin.com/in/chamali-tennakoon369/"><i className="uil uil-linkedin linkedin"></i></a></li>
                        <li><i className="uil uil-whatsapp whatsapp"></i></li>
                    </ul>
                </div>
            </div>
            <div className="footer-copright">
                <p>Copyright 2025. All rights reserved by codex.</p>
            </div>  
        </footer>
    );
};

export default Footer;
