import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/productSlider.css";

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch promotions from the backend
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8082/api/promotions/featured");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("[2025-03-26 08:56:28] laserXnext: Fetched promotions:", data);
        
        if (data.promotions && data.promotions.length > 0) {
          setPromotions(data.promotions);
        } else {
          // Fallback to default slides if no promotions are available
          setPromotions([
            {
              id: 1,
              name: "Silk Saree",
              description: "Elegant handcrafted silk saree",
              price: "LKR 3999.00",
              image: "/assets/1.jpeg",
            },
            {
              id: 2,
              name: "Cotton Saree",
              description: "Beautiful lightweight cotton saree",
              price: "LKR 2499.00",
              image: "/assets/2.jpeg",
            },
            {
              id: 3,
              name: "Designer Saree",
              description: "Designer saree for special occasions",
              price: "LKR 5999.00",
              image: "/assets/1.jpeg",
            },
          ]);
        }
      } catch (err) {
        console.error("[2025-03-26 08:56:28] laserXnext: Error fetching promotions:", err);
        setError("Failed to load promotions. Using default content.");
        
        // Set default slides on error
        setPromotions([
          {
            id: 1,
            name: "Silk Saree",
            description: "Elegant handcrafted silk saree",
            price: "LKR 3999.00",
            image: "/assets/1.jpeg",
          },
          {
            id: 2,
            name: "Cotton Saree",
            description: "Beautiful lightweight cotton saree",
            price: "LKR 2499.00",
            image: "/assets/2.jpeg",
          },
          {
            id: 3,
            name: "Designer Saree",
            description: "Designer saree for special occasions",
            price: "LKR 5999.00",
            image: "/assets/1.jpeg",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (promotions.length === 0) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex, promotions]);

  const nextSlide = () => {
    if (promotions.length === 0) return;
    
    setCurrentIndex((prevIndex) =>
      prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (promotions.length === 0) return;
    
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? promotions.length - 1 : prevIndex - 1
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="product-slider">
        <h2>Featured Promotions</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-slider">
      <h2>Featured Promotions</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="slideshow-container">
        {promotions.map((promotion, index) => (
          <div
            key={promotion.id}
            className={`slide ${index === currentIndex ? "active" : ""}`}
          >
            <Link to={promotion.saree_id ? `/product/${promotion.saree_id}` : "#"}>
              <img src={promotion.image} alt={promotion.name} className="slide-image" />
              <div className="slider-text">
                <h3>{promotion.name}</h3>
                <p>{promotion.description}</p>
                <div className="price-container">
                  {promotion.hasDiscount && (
                    <p className="original-price">{promotion.originalPrice}</p>
                  )}
                  <p className="price">{promotion.price}</p>
                </div>
                {promotion.hasDiscount && (
                  <div className="discount-badge">{promotion.discount_percentage}% OFF</div>
                )}
              </div>
            </Link>
          </div>
        ))}
        
        <div className="slide-buttons">
          <i className="fi fi-rr-angle-left" id="prev" onClick={prevSlide}></i>
          <i className="fi fi-rr-angle-right" id="next" onClick={nextSlide}></i>
        </div>
        
        <div className="dots">
          {promotions.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? "active-dot" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slideshow;