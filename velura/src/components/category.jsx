import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductScreen from '../components/ProductScreen';
import '../css/CategoryPage.css';

// Fallback image
import FallbackSaree from "/1.webp";

const CategoryPage = () => {
  
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  
  const [categoryName, setCategoryName] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getCategoryFromSlug = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const formattedCategoryName = getCategoryFromSlug(categorySlug);
        setCategoryName(formattedCategoryName);
        
        // Fetch products filtered by category
        const response = await axios.get(`/api/sarees?category=${formattedCategoryName}`);
        
        if (response.data && Array.isArray(response.data)) {
          // Process products data
          const processedProducts = response.data.map(product => {
            const discountPercentage = parseFloat(product.discount_percentage) || 0;
            let finalPrice = product.finalPrice;
            
            if (!finalPrice && product.price && discountPercentage > 0) {
              finalPrice = product.price - (product.price * (discountPercentage / 100));
            }
            
            return {
              ...product,
              discount_percentage: discountPercentage,
              finalPrice: finalPrice || product.price,
              hasDiscount: discountPercentage > 0,
              rating: parseFloat(product.rating) || 4.5
            };
          });
          
          setProducts(processedProducts);
        } else {
          throw new Error('Invalid response format');
        }
        
        setLoading(false);
      } catch (err) {
        setError(`Unable to load ${getCategoryFromSlug(categorySlug)} sarees.`);
        setLoading(false);
      }
    };
    
    if (categorySlug) {
      fetchProducts();
    }
  }, [categorySlug]);

  // Format price with currency
  const formatPrice = (price) => {
    if (!price) return 'LKR 0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get image URL (handle nulls and fallbacks)
  const getImageUrl = (product) => {
    if (product.image_url && !product.image_url.includes('null')) {
      return product.image_url;
    } else if (product.imageUrl) {
      return product.imageUrl;
    }
    return FallbackSaree;
  };

  // Return to all products
  const handleBackToProducts = () => {
    navigate('/product');
  };

  return (
    <div className="saree-simple-category-page">
      <div className="saree-simple-category-container">
        <div className="saree-simple-category-header">
          <button 
            className="saree-simple-back-button"
            onClick={handleBackToProducts}
            aria-label="Back to all products"
          >
            <i className="fi fi-rr-arrow-left"></i> Back to All Sarees
          </button>
          
          <h1>{categoryName} Sarees</h1>
          
          <p className="saree-simple-category-count">
            {loading ? 'Loading...' : `${products.length} products found`}
          </p>
        </div>
        
        {loading ? (
          <div className="saree-simple-loading">
            <div className="saree-simple-loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="saree-simple-error">
            <p>{error}</p>
            <button onClick={handleBackToProducts}>
              Back to All Sarees
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="saree-simple-empty">
            <p>No {categoryName.toLowerCase()} sarees found.</p>
            <button onClick={handleBackToProducts}>
              Browse All Sarees
            </button>
          </div>
        ) : (
          <div className="saree-simple-products-grid">
            {products.map((product) => (
              <div className="saree-simple-product-card" key={product.id}>
                <div className="saree-simple-product-image">
                  <img 
                    src={getImageUrl(product)} 
                    alt={product.name} 
                    onError={(e) => { e.target.src = FallbackSaree; }}
                  />
                  
                  {product.discount_percentage > 0 && (
                    <div className="saree-simple-discount-badge">
                      {product.discount_percentage}% OFF
                    </div>
                  )}
                </div>
                
                <div className="saree-simple-product-info">
                  <h3>{product.name}</h3>
                  
                  <div className="saree-simple-product-price">
                    <span className="saree-simple-final-price">
                      {formatPrice(product.finalPrice)}
                    </span>
                    
                    {product.discount_percentage > 0 && (
                      <span className="saree-simple-original-price">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    className="saree-simple-view-details"
                    onClick={() => setSelectedProduct(product)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>     
      {selectedProduct && (
        <ProductScreen 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default CategoryPage;