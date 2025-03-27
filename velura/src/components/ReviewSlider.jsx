import { useState, useEffect, useRef } from 'react';
import '../css/reviewslider.css';

const ReviewSlider = ({ reviews = sampleReviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  useEffect(() => {
    // Auto-play functionality
    autoPlayRef.current = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [currentIndex]);

  // Generate star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="review-slider-container">
      <h2 className="review-slider-title">What Our Customers Say</h2>
      
      <div 
        className="review-slider" 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="review-slide-wrapper">
          {reviews.map((review, index) => (
            <div 
              key={index}
              className={`review-slide ${index === currentIndex ? 'active' : ''}`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`
              }}
            >
              <div className="review-content">
                <div className="review-image-container">
                  <img 
                    src={review.image} 
                    alt={`${review.name}'s profile`} 
                    className="review-image" 
                  />
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                <p className="review-text">"{review.text}"</p>
                <div className="review-author">
                  <h3>{review.name}</h3>
                  <p className="review-location">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="review-nav prev-button" onClick={prevSlide}>
          <span className="nav-arrow">&#10094;</span>
        </button>
        <button className="review-nav next-button" onClick={nextSlide}>
          <span className="nav-arrow">&#10095;</span>
        </button>
      </div>

      <div className="review-dots">
        {reviews.map((_, index) => (
          <button
            key={index}
            className={`review-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

const sampleReviews = [
  {
    name: "Priya Sharma",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    text: "The Kanchipuram silk saree I ordered was absolutely gorgeous! The vibrant colors and intricate designs exceeded my expectations. Perfect for my daughter's wedding ceremony.",
    rating: 5,
    location: "Mumbai"
  },
  {
    name: "Ananya Patel",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "I've ordered several sarees from this store and each one has been stunning. The quality is exceptional and the delivery was much faster than expected!",
    rating: 5,
    location: "Delhi"
  },
  {
    name: "Meera Reddy",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    text: "The Banarasi saree I purchased was true to the pictures shown. The fabric feels luxurious and the gold work is exquisite. Will definitely shop again!",
    rating: 4,
    location: "Bangalore"
  },
  {
    name: "Kavita Desai",
    image: "https://randomuser.me/api/portraits/women/58.jpg",
    text: "Customer service was exceptional! They helped me choose the perfect saree for my sister's engagement. The embroidery work is phenomenal and the colors are vibrant.",
    rating: 5,
    location: "Hyderabad"
  },
  {
    name: "Lakshmi Iyer",
    image: "https://randomuser.me/api/portraits/women/79.jpg",
    text: "I received so many compliments on the designer saree I bought. The blouse piece that came with it was also beautiful. Great value for money!",
    rating: 4,
    location: "Chennai"
  }
];

export default ReviewSlider;