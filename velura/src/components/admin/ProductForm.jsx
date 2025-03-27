import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const imageInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    material: '',
    color: '',
    price: '',
    stock_quantity: '',
    discount_percentage: 0,
    image_url: '',
    available: true
  });

  // Get auth token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch filter options for dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get('http://localhost:8082/api/sarees/filters', {
          headers: getAuthHeader()
        });
        
        if (response.data) {
          setCategories(response.data.categories || []);
          setMaterials(response.data.materials || []);
          setColors(response.data.colors || []);
        }
      } catch (error) {
        console.error('[2025-03-24 11:36:55] laserXnext: Error fetching filter options:', error);
        setErrorMessage('Failed to load filter options');
      }
    };

    fetchFilterOptions();

    // If editing an existing product, fetch its data
    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Fetch product data if editing
  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      
      // Add API endpoint to fetch a single product
      const response = await axios.get(`http://localhost:8082/api/sarees/${id}`, {
        headers: getAuthHeader()
      });
      
      if (response.data) {
        setFormData({
          name: response.data.name || '',
          description: response.data.description || '',
          category: response.data.category || '',
          material: response.data.material || '',
          color: response.data.color || '',
          price: response.data.price || '',
          stock_quantity: response.data.stock_quantity || '',
          discount_percentage: response.data.discount_percentage || 0,
          image_url: response.data.image_url || '',
          available: response.data.available === 1 ? true : false
        });
      }
    } catch (error) {
      console.error('[2025-03-24 11:36:55] laserXnext: Error fetching product:', error);
      setErrorMessage('Failed to load product data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'price' || name === 'stock_quantity' || name === 'discount_percentage') {
      // Only allow numbers
      const numericValue = value.replace(/[^0-9.]/g, '');
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image_url: imageUrl });
    }
  };

  // Upload image to server (placeholder function)
  const handleImageUpload = async (file) => {
    // Create a FormData object to send the file
    const imageData = new FormData();
    imageData.append('image', file);
    
    try {
      // Call your image upload API
      const response = await axios.post('http://localhost:8082/api/upload/image', imageData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update form with the returned image URL
      if (response.data && response.data.imageUrl) {
        setFormData({ ...formData, image_url: response.data.imageUrl });
      }
    } catch (error) {
      console.error('[2025-03-24 11:36:55] laserXnext: Error uploading image:', error);
      setErrorMessage('Failed to upload image');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price || !formData.category) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSaving(true);
      setErrorMessage('');
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        discount_percentage: parseFloat(formData.discount_percentage),
        available: formData.available ? 1 : 0,
        created_date_time: new Date().toISOString(),
        updated_date_time: new Date().toISOString()
      };
      
      if (id) {
        // Update existing product
        await axios.put(`http://localhost:8082/api/admin/products/${id}`, productData, {
          headers: getAuthHeader()
        });
      } else {
        // Create new product
        await axios.post('http://localhost:8082/api/admin/products', productData, {
          headers: getAuthHeader()
        });
      }
      
      // Redirect to products page
      navigate('/admin/products');
    } catch (error) {
      console.error('[2025-03-24 11:36:55] laserXnext: Error saving product:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fi fi-rr-spinner admin-spinner"></i>
        <p>Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="admin-product-form">
      <div className="admin-page-header">
        <h1>{id ? "Edit Product" : "Add New Product"}</h1>
        <div className="admin-header-actions">
          <button
            className="admin-button secondary"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>
          <button
            className="admin-button primary"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fi fi-rr-spinner admin-spinner"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fi fi-rr-disk"></i>
                Save Product
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="admin-error-message">
          <i className="fi fi-rr-exclamation"></i>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage("")}>
            <i className="fi fi-rr-cross-small"></i>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-layout">
          <div className="form-main-content">
            <div className="form-section">
              <h2>Basic Information</h2>

              <div className="form-group">
                <label htmlFor="name">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={5}
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Pricing & Inventory</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">
                    Price (LKR) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discount_percentage">Discount (%)</label>
                  <input
                    type="text"
                    id="discount_percentage"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="stock_quantity">
                  Stock Quantity <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="stock_quantity"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Product Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    <option value="new">+ Add New Category</option>
                  </select>

                  {formData.category === "new" && (
                    <input
                      type="text"
                      className="add-new-input"
                      placeholder="Enter new category name"
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="material">Material</label>
                  <select
                    id="material"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Material</option>
                    {materials.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                    <option value="new">+ Add New Material</option>
                  </select>

                  {formData.material === "new" && (
                    <input
                      type="text"
                      className="add-new-input"
                      placeholder="Enter new material name"
                      onChange={(e) =>
                        setFormData({ ...formData, material: e.target.value })
                      }
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="color">Color</label>
                <select
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                >
                  <option value="">Select Color</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                  <option value="new">+ Add New Color</option>
                </select>

                {formData.color === "new" && (
                  <input
                    type="text"
                    className="add-new-input"
                    placeholder="Enter new color name"
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
          </div>

          <div className="form-sidebar">
            <div className="form-section">
              <h2>Product Status</h2>
              <div className="form-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">
                  {formData.available === true ? "Active" : "Draft"}
                </span>
              </div>
              <p className="help-text">
                {formData.available
                  ? "Product is visible and can be purchased"
                  : "Product is hidden from customers"}
              </p>
            </div>

            <div className="form-section">
              <h2>Product Image</h2>
              <div className="image-upload-container">
                {formData.image_url ? (
                  <div className="image-preview">
                    <img
                      src={formData.image_url}
                      alt="Product preview"
                      onError={(e) => {
                        e.target.src = "/1.webp";
                      }}
                    />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() =>
                        setFormData({ ...formData, image_url: "" })
                      }
                    >
                      <i className="fi fi-rr-cross"></i>
                    </button>
                  </div>
                ) : (
                  <div
                    className="image-upload-placeholder"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <i className="fi fi-rr-picture"></i>
                    <p>Click to upload image</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />

                {!formData.image_url && (
                  <button
                    type="button"
                    className="admin-button secondary upload-button"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <i className="fi fi-rr-upload"></i>
                    Upload Image
                  </button>
                )}

                <p className="help-text">
                  Recommended size: 800x1200px (4:6 ratio)
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="image_url">Image URL</label>
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;