import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/collection.css';

import defaultCategoryImage from '/4.jpg';

const Collections = () => {
  // Current timestamp and user login
  const currentDateTime = '2025-03-20 08:59:22';
  const currentUser = 'laserXnext';
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();
  const imageErrorsRef = useRef({});

  // Category images mapping with fallbacks
  const categoryImageMap = {
    'Silk': '4.jpg',
    'Cotton': '4.jpg',
    'Festival': '4.jpg',
    'Wedding': '4.jpg',
    'Casual': '4.jpg',
    'Party Wear': '4.jpg',
    'Bridal': '4.jpg',
  };

  // Category descriptions mapping
  const categoryDescriptions = {
    'Silk': 'Luxurious silk sarees for special occasions',
    'Cotton': 'Comfortable cotton sarees for daily wear',
    'Festival': 'Vibrant and colorful sarees for celebrations',
    'Wedding': 'Elegant and traditional sarees for weddings',
    'Casual': 'Lightweight and comfortable casual sarees',
    'Party Wear': 'Glamorous sarees for parties and events',
    'Bridal': 'Exquisite bridal sarees for your special day',
    'Traditional': 'Classic traditional designs with rich heritage',
    'Modern': 'Contemporary styles for the fashion-forward',
    'Handloom': 'Authentic handloom sarees crafted by artisans',
    'Designer': 'Exclusive designer sarees for a unique look',
    'Printed': 'Beautiful printed designs for a modern style',
    'Embroidered': 'Intricately embroidered sarees for elegance',
  };

  // Get the appropriate image for each category with image path logging
  const getCategoryImage = (categoryName) => {
    let imageUrl = defaultCategoryImage;

    // Check if the categoryName contains any of the keys in the mapping
    for (const [key, url] of Object.entries(categoryImageMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        imageUrl = url;
        break;
      }
    }
    return imageUrl;
  };

  // Get description for a category
  const getCategoryDescription = (categoryName) => {
    // Check if there's a direct match in the descriptions
    for (const [key, description] of Object.entries(categoryDescriptions)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return description;
      }
    }
    
    // Fallback description
    return `Beautiful ${categoryName} sarees collection`;
  };

  // Handle image load error
  const handleImageError = (categoryId, categoryName, imageUrl) => {
    console.error(`[${currentDateTime}] ${currentUser}: Image failed to load for category '${categoryName}', URL: ${imageUrl}`);
    
    // Store the error in state for UI feedback
    setImageErrors(prev => ({
      ...prev,
      [categoryId]: true
    }));
    
    // Also store in ref for debugging
    imageErrorsRef.current[categoryId] = {
      categoryName,
      attemptedUrl: imageUrl,
      timestamp: new Date().toISOString()
    };
    
    // Log all image errors for debugging
    console.error(`[${currentDateTime}] ${currentUser}: Current image errors:`, imageErrorsRef.current);
  };

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        console.log(`[${currentDateTime}] ${currentUser}: Fetching saree categories from API`);
        
        // Use the API endpoint for filters
        const response = await axios.get('/api/sarees/filters');
        
        if (response.data && response.data.categories) {
          // Transform the raw category data into a more structured format
          const categoryData = response.data.categories
            .filter(category => category && category.trim() !== '') // Filter out empty categories
            .map((category, index) => {
              const imageUrl = getCategoryImage(category);
              return {
                id: index + 1,
                name: category,
                description: getCategoryDescription(category),
                imageUrl: imageUrl,
                slug: category.toLowerCase().replace(/\s+/g, '-'),
              };
            });
          
          setCategories(categoryData);
        } else {
          throw new Error('Invalid response format');
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load categories. Please try again later.');
        setIsLoading(false);
      }
    };
    
    // Verify that the images from categoryImageMap are accessible
    const checkImageUrls = async () => { 
      const imgUrls = Object.values(categoryImageMap);
      imgUrls.push(defaultCategoryImage); // Also check the default image
      
      for (const url of imgUrls) {
        try {
          // Create a new image and attempt to load it
          const img = new Image();
          img.src = url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            // Add a timeout
            setTimeout(() => reject(new Error(`Timeout loading image: ${url}`)), 5000);
          });
        } catch (error) {
          console.error(`[${currentDateTime}] ${currentUser}: ${error.message}`);
        }
      }
    };
    
    fetchCategories();
    checkImageUrls();
  }, [currentDateTime, currentUser]);

  // Handle navigation to category page
  const handleCategoryClick = (category) => {
    console.log(`[${currentDateTime}] ${currentUser}: Navigating to category ${category.slug}`);
    // Navigate to dedicated category page
    navigate(`/category/${category.slug}`);
  };

  if (isLoading) {
    return (
      <section className="saree-categories">
        <h2>Shop by Category</h2>
        <div className="saree-categories-loading">
          <div className="saree-categories-loading-spinner"></div>
          <p>Loading collections...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="saree-categories">
        <div className="saree-categories-header">
          <h2>Shop by Category</h2>
        </div>
        <div className="saree-categories-error">
          <i className="fi fi-rr-exclamation"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="saree-categories">
        <div className="saree-categories-header">
          <h2>Shop by Category</h2>
        </div>
        <div className="saree-categories-empty">
          <i className="fi fi-rr-folder-open"></i>
          <p>No categories found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="saree-categories">
      <div className='saree-categories-header'>
        <h2>Shop by Category</h2>
      </div>
      <div className="saree-categories-grid">
        {categories.map(category => (
          <div 
            className={`saree-category-card ${hoveredCategory === category.id ? 'saree-category-hovered' : ''} ${imageErrors[category.id] ? 'saree-image-error' : ''}`}
            key={category.id}
            style={{ 
              backgroundImage: `url(${imageErrors[category.id] ? defaultCategoryImage : category.imageUrl}',
              )` 
            }}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
            onClick={() => handleCategoryClick(category)}
          >
            {/* Hidden image preloader to detect load errors */}
            <img 
              src={category.imageUrl}
              alt=""
              className="saree-image-preloader"
              onError={() => handleImageError(category.id, category.name, category.imageUrl)}
            />
            
            <div className="saree-category-overlay"></div>
            <div className="saree-category-content">
              <h3>{category.name}</h3>
              <p className="saree-category-description">{category.description}</p>
              <button 
                className="saree-category-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick(category);
                }}
                aria-label={`Shop ${category.name} sarees`}
              >
                Shop Now <i className="fi fi-rr-arrow-right"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Collections;