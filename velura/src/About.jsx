import Navbar from './components/Navbar';
import Collection from './components/collections';
import Footer from './components/Footer';
import ChatSystem from './components/ChatBot'; 

import "./css/about.css";

const About = () => {
  return (
    <div>
      <Navbar />
      <div className="top-chat-wrapper">
        <ChatSystem position="top" />
      </div>
      <div className="about-page">
      <section className="hero-about-section">
        <div className="hero-about-content">
          <h1>About Velura</h1>
          <p>Preserving Tradition, Embracing Elegance</p>
        </div>
      </section>

      <section className="story-section">
        <div className="story-grid">
          <div className="story-text">
            <h2>Our Story</h2>
            <p>Founded in 2020, Velura Saree began as a small passion project to revive traditional weaving techniques. Today, we stand as a bridge between age-old craftsmanship and modern elegance, bringing you the finest handwoven sarees from across Sri Lanka.</p>
          </div>
          <div className="story-image"></div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <h2>Our Mission</h2>
        <div className="mission-cards">
          <div className="mission-card">
            <h3>Preserve Heritage</h3>
            <p>Supporting traditional weavers and protecting ancient textile arts</p>
          </div>
          <div className="mission-card">
            <h3>Empower Artisans</h3>
            <p>Direct collaboration with 500+ craftspeople across Sri Lanka</p>
          </div>
          <div className="mission-card">
            <h3>Sustainable Fashion</h3>
            <p>Eco-friendly practices from loom to delivery</p>
          </div>
        </div>
      </section>
      <Collection />
      <section className="contact-banner">
        <h2>Have Questions?</h2>
        <button className="contact-button">Get in Touch</button>
      </section>
    </div>
      <Footer />
    </div>
  );
}

export default About;