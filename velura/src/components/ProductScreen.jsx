import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Saree from "/sarees/saree- (24).jpeg";
import "../css/products.css";
import { useCart } from "../hooks/cartContext";
import Rating from "./Rating";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewList";
import { getProductReviews, submitReview } from "../hooks/reviews";
import SideCart from "./SideCart";

const ProductScreen = ({ product, onClose }) => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [showSideCart, setShowSideCart] = useState(false); // Add state for side cart
  const { addToCart } = useCart();
  
  const getImageUrl = (product) => {
    if (product.image_url && !product.image_url.includes('null')) {
      return product.image_url;
    } else if (product.imageUrl) {
      return product.imageUrl;
    }
    return Saree;
  };

  const images = [
    getImageUrl(product),
    getImageUrl(product),
    getImageUrl(product)
  ];
  
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
  };

  useEffect(() => {
    // When the review modal is opened, fetch reviews
    if (isReviewOpen) {
      fetchReviews();
    }
  }, [isReviewOpen, product.id]);

  // Add effect to lock body scroll when side cart is open
  useEffect(() => {
    if (showSideCart || isReviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showSideCart, isReviewOpen]);

  const fetchReviews = async () => {
    if (!product.id) return;
    
    setIsLoadingReviews(true);
    setReviewsError("");
    
    try {
      const data = await getProductReviews(product.id);
      setReviews(data);
    } catch (error) {
      console.error("[2025-03-23 06:51:49] laserXnext: Failed to fetch reviews:", error);
      setReviewsError("Unable to load reviews. Please try again later.");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const newReview = await submitReview(reviewData);
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      return newReview;
    } catch (error) {
      console.error("[2025-03-23 06:51:49] laserXnext: Failed to submit review:", error);
      throw error;
    }
  };

  const handleReviewClick = () => {
    setIsReviewOpen(true);
  };

  const closeReviewPopup = () => {
    setIsReviewOpen(false);
    setShowReviewForm(false);
  };
  
  const formatPrice = (price) => {
    if (!price) return 'LKR 0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return product.rating || 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const renderStarRating = (rating) => {
    return <Rating value={rating} readOnly />;
  };
  
  // Handle Add To Cart
  const handleAddToCart = () => {
    // Animation feedback
    setIsAdding(true);
    
    // Add the product to cart
    addToCart(product, quantity);
    
    // Reset add animation after delay
    setTimeout(() => {
      setIsAdding(false);
      
      // Show side cart after adding product
      setShowSideCart(true);
    }, 1000);
  };
  
  // Handle quantity changes
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };
  
  // Close side cart
  const closeSideCart = () => {
    setShowSideCart(false);
  };

  return (
    <>
      <div className="product-detail-overlay">
        <div className="product-detail-container">
          <i
            className="fi fi-rr-cross-circle"
            onClick={onClose}
            id="product-detail-close"
          />
          <div className="product-detail-image">
            <Slider {...settings} className="product-detail-slider">
              {images.map((img, index) => (
                <div key={index} className="product-detail-slide">
                  <img src={img} alt={product.name} />
                </div>
              ))}
            </Slider>
          </div>

          <div className="product-detail-info">
            <div className="product-detail-header">
              <h1>{product.name}</h1>
              <div className="product-detail-category">
                {product.category || "Traditional Saree"}
              </div>
              {renderStarRating(calculateAverageRating())}
            </div>

            <div className="product-detail-price-section">
              <p className="product-detail-price">
                {formatPrice(product.finalPrice || product.price)}
              </p>

              {product.discount_percentage > 0 && (
                <div className="product-detail-discount">
                  <span className="product-detail-original-price">
                    {formatPrice(product.price)}
                  </span>
                  <span className="product-detail-discount-badge">
                    {product.discount_percentage}% OFF
                  </span>
                </div>
              )}
            </div>
            
            <div className="product-detail-quantity">
              <span>Quantity:</span>
              <div className="quantity-selector">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <i className="fi fi-rr-minus-small"></i>
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  <i className="fi fi-rr-plus-small"></i>
                </button>
              </div>
            </div>

            <button 
              className={`product-detail-add-to-cart ${isAdding ? 'adding' : ''}`}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <>Adding <i className="fi fi-rr-spinner loading-spinner"></i></>
              ) : (
                <>Add To Cart <i className="fi fi-rr-shopping-cart-add"></i></>
              )}
            </button>

            <p className="product-detail-description">
              {product.description ||
                "This exquisite handcrafted saree is a sheer delight. The zari border and blouse make it the right choice for you to sport it on your special occasions. The richness of the colors of this saree will make you look extravagant. This saree is handcrafted in the villages of South India."}
            </p>

            <div className="product-detail-specs-container">
              <h3>Product Specifications</h3>
              <ul className="product-detail-specs">
                <li>
                  <span>Material</span>
                  <p>{product.material || "Soft Silk Kanjivaram"}</p>
                </li>
                <li>
                  <span>Color</span>
                  <p>{product.color || "Traditional"}</p>
                </li>
                <li>
                  <span>Washcare</span>
                  <p>Dry Clean</p>
                </li>
                <li>
                  <span>Length</span>
                  <p>6.25 - 6.40 Metres</p>
                </li>
                <li>
                  <span>Blouse</span>
                  <p>Included</p>
                </li>
              </ul>
            </div>

            <div className="product-detail-actions">
              <button
                className="product-detail-review-button"
                onClick={handleReviewClick}
              >
                Reviews <i className="fi fi-rr-comment"></i>
              </button>
            </div>
          </div>
        </div>

        {isReviewOpen && (
          <div
            className="product-detail-review-overlay"
            onClick={closeReviewPopup}
          >
            <div
              className="product-detail-review-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="product-detail-review-header">
                <h3>Reviews for {product.name}</h3>
                <i className="fi fi-rr-cross" onClick={closeReviewPopup}></i>
              </div>

              <div className="product-detail-review-content">
                <div className="review-summary">
                  <div className="review-summary-rating">
                    <div className="average-rating">{calculateAverageRating().toFixed(1)}</div>
                    <Rating value={calculateAverageRating()} readOnly size="large" />
                    <div className="rating-count">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
                  </div>
                  
                  {!showReviewForm && (
                    <button 
                      className="write-review-button"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {showReviewForm && (
                  <ReviewForm 
                    productId={product.id}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}

                <ReviewsList 
                  reviews={reviews}
                  isLoading={isLoadingReviews}
                  error={reviewsError}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <SideCart isOpen={showSideCart} onClose={closeSideCart} />
    </>
  );
};

export default ProductScreen;