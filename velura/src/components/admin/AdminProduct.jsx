// src/pages/admin/Products.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Make sure to import axios

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get auth token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Fetch categories if needed
      if (categories.length === 0) {
        const categoriesResponse = await axios.get('http://localhost:8082/api/admin/products/categories', {
          headers: getAuthHeader()
        });
        setCategories(categoriesResponse.data);
      }
      
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (stockFilter) params.append('stock', stockFilter);
      if (sortBy) params.append('sort', sortBy);
      if (sortOrder) params.append('order', sortOrder);
      params.append('page', page);
      params.append('limit', 10);
      
      // Fetch products
      const response = await axios.get(`http://localhost:8082/api/admin/products?${params.toString()}`, {
        headers: getAuthHeader()
      });
      
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('[2025-03-24 11:05:16] laserXnext: Error fetching products:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, stockFilter, sortBy, sortOrder, page]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Handle bulk select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };
  
  // Handle individual select
  const handleSelectProduct = (e, productId) => {
    if (e.target.checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) return;
    
    try {
      if (action === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
          await axios.delete('http://localhost:8082/api/admin/products', {
            headers: getAuthHeader(),
            data: { productIds: selectedProducts }
          });
          
          // Refetch products after deletion
          fetchProducts();
          setSelectedProducts([]);
        }
      } else if (action === 'activate' || action === 'deactivate') {
        await axios.put('http://localhost:8082/api/admin/products/status', {
          productIds: selectedProducts,
          status: action === 'activate' ? 'Active' : 'Draft'
        }, {
          headers: getAuthHeader()
        });
        
        // Refetch products after status update
        fetchProducts();
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error(`[2025-03-24 11:05:16] laserXnext: Error performing bulk action:`, error);
      setErrorMessage(error.response?.data?.error || `Failed to ${action} products`);
    }
  };
  
  // Handle pagination
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column with default ascending order
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fi fi-rr-spinner admin-spinner"></i>
        <p>Loading products...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-products">
      {errorMessage && (
        <div className="error-message">
          <i className="fi fi-rr-exclamation"></i>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>
            <i className="fi fi-rr-cross-small"></i>
          </button>
        </div>
      )}
      
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <Link to="/admin/products/new" className="admin-button primary">
            <i className="fi fi-rr-plus"></i> Add New Product
          </Link>
          
          <div className="bulk-actions">
            <select 
              className="bulk-action-select"
              disabled={selectedProducts.length === 0}
              onChange={(e) => handleBulkAction(e.target.value)}
              value=""
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
            </select>
          </div>
        </div>
        
        <div className="toolbar-right">
          <div className="search-box">
            <i className="fi fi-rr-search"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            )}
          </div>
          
          <div className="filter-controls">
            <select 
              className="category-filter"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select 
              className="stock-filter"
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table products-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedProducts.length === products.length && products.length > 0}
                />
              </th>
              <th className="image-column">Image</th>
              <th 
                className={`sortable ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                Product Name
                {sortBy === 'name' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th>Category</th>
              <th 
                className={`sortable ${sortBy === 'price' ? 'active' : ''}`}
                onClick={() => handleSort('price')}
              >
                Price
                {sortBy === 'price' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th 
                className={`sortable ${sortBy === 'stock' ? 'active' : ''}`}
                onClick={() => handleSort('stock_quantity')}
              >
                Stock
                {sortBy === 'stock' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th>Status</th>
              <th 
                className={`sortable ${sortBy === 'created_at' ? 'active' : ''}`}
                onClick={() => handleSort('created_date_time')}
              >
                Date Added
                {sortBy === 'created_at' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-results">
                  <i className="fi fi-rr-info"></i>
                  <p>No products found</p>
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td>
                    <input 
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleSelectProduct(e, product.id)}
                    />
                  </td>
                  <td className="product-image">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      onError={(e) => { e.target.src = "/1.webp"; }}
                    />
                  </td>
                  <td className="admin-product-name">
                    <Link to={`/admin/products/${product.id}`}>{product.name}</Link>
                  </td>
                  <td>{product.category}</td>
                  <td className="admin-product-price">
                    {formatCurrency(product.price)}
                    {product.discount_percentage > 0 && (
                      <span className="discount-tag">-{product.discount_percentage}%</span>
                    )}
                  </td>
                  <td className={`product-stock ${product.stock < 10 ? 'low-stock' : ''}`}>
                    {product.stock} units
                  </td>
                  <td>
                    <span className={`status-badge status-${product.status.toLowerCase().replace(' ', '-')}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="date-added">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <div className="actions-dropdown">
                      <button className="action-button">
                        <i className="fi fi-rr-menu-dots-vertical"></i>
                      </button>
                      <div className="dropdown-content">
                        <Link to={`/admin/products/${product.id}`}>
                          <i className="fi fi-rr-edit"></i> Edit
                        </Link>
                        <button 
                          className="dropdown-item text-danger"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                              try {
                                await axios.delete('http://localhost:8082/api/admin/products', {
                                  headers: getAuthHeader(),
                                  data: { productIds: [product.id] }
                                });
                                fetchProducts();
                              } catch (error) {
                                console.error(`[2025-03-24 11:05:16] laserXnext: Error deleting product:`, error);
                                setErrorMessage(error.response?.data?.error || 'Failed to delete product');
                              }
                            }
                          }}
                        >
                          <i className="fi fi-rr-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="admin-pagination">
        <div className="pagination-info">
          Showing {products.length} of {(totalPages - 1) * 10 + products.length} products
        </div>
        
        <div className="pagination-controls">
          <button 
            className="pagination-button"
            disabled={page === 1}
            onClick={() => goToPage(1)}
          >
            <i className="fi fi-rr-angle-double-left"></i>
          </button>
          <button 
            className="pagination-button"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
          >
            <i className="fi fi-rr-angle-left"></i>
          </button>
          
          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Create a sliding window of 5 page numbers around the current page
              let pageNum;
              if (totalPages <= 5) {
                // Show all pages if 5 or fewer
                pageNum = i + 1;
              } else if (page <= 3) {
                // At the start
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                // At the end
                pageNum = totalPages - 4 + i;
              } else {
                // In the middle
                pageNum = page - 2 + i;
              }
              
              return (
                <button 
                  key={pageNum}
                  className={`pagination-button ${pageNum === page ? 'active' : ''}`}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button 
            className="pagination-button"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
          >
            <i className="fi fi-rr-angle-right"></i>
          </button>
          <button 
            className="pagination-button"
            disabled={page === totalPages}
            onClick={() => goToPage(totalPages)}
          >
            <i className="fi fi-rr-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;