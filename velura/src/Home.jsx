import React from "react";
import Navbar from "./components/Navbar";
import Collections from "./components/collections";
import Footer from "./components/footer";
import ProductSlider from "./components/productSlider";
import ReviewsSlider from "./components/ReviewSlider";
import ChatSystem from './components/ChatBot'; 

import "./css/home.css";


const Home = () => {

  
  const redirection = () => {
    window.location.href = "/product"
  };
  return (
    <div className="home-container">
      <Navbar />
      <div className="top-chat-wrapper">
        <ChatSystem position="top" />
      </div>
      <section className="hero">
        <div className="hero-content">
          <h1>Embrace Timeless Elegance</h1>
          <p>
            Discover handcrafted sarees woven with tradition and modern
            sophistication
          </p>
          <button className="cta-button" onClick={redirection}>Explore Collections</button>
        </div>
      </section>
      <Collections />
      <ProductSlider />
      <ReviewsSlider />
      <Footer />
    </div>
  );
};

export default Home;
