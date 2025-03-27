import React, { useEffect, useState, useCallback } from "react";
import ProductScreen from "./ProductScreen.jsx";
import "../css/product.css";

// Fallback image if there's an issue with the database image
import FallbackSaree from "/1.webp";

const Product = ({ filters, searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  

  const fetchProducts = useCallback(async (resetPage = true) => {
    // If we're resetting, set page to 1 and show loading indicator
    if (resetPage) {
      setPage(1);
      setLoading(true);
      setHasMore(true);
    }
    
    const currentPage = resetPage ? 1 : page;
    
    try {
      // Build query parameters from filters and search query
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      queryParams.append('page', currentPage);
      queryParams.append('limit', 12); // Items per page
      
      // Add search query if provided
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      // Add filters if provided
      if (filters) {
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.material) queryParams.append('material', filters.material);
        if (filters.color) queryParams.append('color', filters.color);
        if (filters.priceRange) queryParams.append('priceRange', filters.priceRange);
      }

      
      const response = await fetch(`http://localhost:8082/api/sarees?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length === 0 && currentPage === 1) {
        setErrorMessage("No sarees found matching your criteria");
        setProducts([]);
        setHasMore(false);
      } else if (data.length === 0) {
        setHasMore(false);
      } else {
        setErrorMessage("");
        
        // Process products to ensure discount properties
        const processedProducts = data.map(product => {
          // Ensure discount_percentage is a number
          const discountPercentage = parseFloat(product.discount_percentage) || 0;
          
          // Calculate finalPrice if it doesn't exist
          let finalPrice = product.finalPrice;
          if (!finalPrice && product.price && discountPercentage > 0) {
            finalPrice = product.price - (product.price * (discountPercentage / 100));
          }
          
          // Ensure rating is a number between 0-5
          const rating = parseFloat(product.rating) || 0;
          
          return {
            ...product,
            discount_percentage: discountPercentage,
            finalPrice: finalPrice || product.price, // fallback to regular price
            hasDiscount: discountPercentage > 0,
            rating: Math.min(5, Math.max(0, rating)) // Ensure rating is between 0-5
          };
        });
        
        // If resetting page, replace products; otherwise append
        setProducts(prevProducts => 
          resetPage ? processedProducts : [...prevProducts, ...processedProducts]
        );
      }
    } catch (error) {
      setErrorMessage(`Failed to load sarees: ${error.message}`);
      
      if (resetPage) {
        // Use hardcoded data with proper discount calculations
        const hardcodedProducts = [
          {
            id: 1,
            name: "Banarasi Silk Saree",
            imageUrl: FallbackSaree,
            price: 3999.99,
            discount_percentage: 25,
            material: "Silk",
            color: "Red",
            category: "Wedding",
            description: "Elegant Banarasi silk saree with intricate zari work",
            rating: 4.8
          },
          {
            id: 2,
            name: "Kanjivaram Silk Saree",
            imageUrl: FallbackSaree,
            price: 5999.99,
            discount_percentage: 15,
            material: "Silk",
            color: "Blue",
            category: "Wedding",
            description: "Traditional Kanjivaram silk saree with golden border",
            rating: 4.9
          },
          {
            id: 3,
            name: "Chiffon Printed Saree",
            imageUrl: FallbackSaree,
            price: 1999.99,
            discount_percentage: 25,
            material: "Chiffon",
            color: "Green",
            category: "Casual",
            description: "Lightweight chiffon saree with modern print design",
            rating: 4.5
          }
        ];
        
        // Process hardcoded products to include finalPrice
        const processedHardcoded = hardcodedProducts.map(product => {
          const discountPercentage = parseFloat(product.discount_percentage) || 0;
          const finalPrice = product.price - (product.price * (discountPercentage / 100));
          const rating = parseFloat(product.rating) || 0;
          
          return {
            ...product,
            finalPrice,
            hasDiscount: discountPercentage > 0,
            rating: Math.min(5, Math.max(0, rating))
          };
        });
        
        setProducts(processedHardcoded);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, page]);
  
  // Initial load and when filters/search change
  useEffect(() => {
    fetchProducts(true);
  }, [filters, searchQuery]); 

  // Load more products
  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
    fetchProducts(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const getImageUrl = (product) => {
    if (product.image_url && !product.image_url.includes('null')) {
      return product.image_url;
    } else if (product.imageUrl) {
      return product.imageUrl;
    }
    return FallbackSaree;
  };

  const formatPrice = (price) => {
    if (!price) return 'LKR 0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="star-rating" title={`${rating} out of 5 stars`}>
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fi fi-rr-star"></i>
        ))}
        {hasHalfStar && <i className="fi fi-rr-star-sharp-half"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="fi fi-rr-star" id="empty-star"></i>
        ))}
        <span className="rating-number">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="product-section">
      <div className="product-header">
        <h2>Our Collection</h2>
      </div>

      {loading && page === 1 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sarees...</p>
        </div>
      ) : (
        <div className="product-container">
          {errorMessage && page === 1 ? (
            <div className="error-message">
              <p>{errorMessage}</p>
              <button className="retry-btn" onClick={() => fetchProducts(true)}>
                <i className="fi fi-rr-refresh"></i> Try Again
              </button>
            </div>
          ) : null}
          
          {products.length === 0 && !errorMessage && !loading ? (
            <div className="no-products-message">
              <i className="fi fi-rr-search"></i>
              <p>No sarees match your search criteria.</p>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            products.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-image-container">
                  <img 
                    src={getImageUrl(product)} 
                    alt={product.name} 
                    className="saree-image" 
                    onError={(e) => { e.target.src = FallbackSaree; }}
                  />
                  
                  {product.discount_percentage > 0 && (
                    <div className="discount-badge">
                      {product.discount_percentage}% OFF
                    </div>
                  )}
                  
                  <button 
                    className="quick-view-btn"
                    onClick={() => handleProductClick(product)}
                  >
                    <i className="fi fi-rr-eye"></i> Quick View
                  </button>
                </div>
                
                <div className="product-info">
                  <div className="product-category">{product.category || "Saree"}</div>
                  <h3 className="product-name" title={product.name}>{product.name}</h3>
                  
                  <div className="product-details">
                    <span className="product-material">{product.material}</span>
                    {product.color && (
                      <>
                        <span className="separator">|</span>
                        <span className="product-color">
                          <span 
                            className="color-dot" 
                            style={{backgroundColor: product.color.toLowerCase()}}
                          ></span>
                          {product.color}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {renderStarRating(product.rating)}
                  
                  <div className="product-price">
                    <span className="final-price">{formatPrice(product.finalPrice)}</span>
                    
                    {product.discount_percentage > 0 && 
                     product.price !== product.finalPrice && (
                      <span className="original-price">{formatPrice(product.price)}</span>
                    )}
                  </div>
                  
                  <div className="product-actions">
                    <button 
                      className="view-btn" 
                      onClick={() => handleProductClick(product)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {products.length > 0 && !loading && !errorMessage && hasMore && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={loading && page > 1}
          >
            {loading && page > 1 ? (
              <>Loading <i className="fi fi-rr-spinner"></i></>
            ) : (
              <>Load More <i className="fi fi-rr-arrow-down"></i></>
            )}
          </button>
        </div>
      )}

      {selectedProduct && (
        <ProductScreen 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Product;