import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [productNames, setProductNames] = useState({});

  // Get auth token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch product name by ID
  const fetchProductName = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:8082/api/sarees/${productId}`, {
        headers: getAuthHeader(),
      });
      return response.data.name;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] laserXnext: Error fetching product name:`, error);
      return 'Unknown Product';
    }
  };

  // Get product name by ID
  const getProductName = (productId) => {
    if (productNames[productId]) {
      return productNames[productId];
    }
    fetchProductName(productId).then((name) => {
      setProductNames((prevNames) => ({ ...prevNames, [productId]: name }));
    });
    return 'Loading...';
  };

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      // Fetch product options for filter if needed
      if (products.length === 0) {
        const productsResponse = await axios.get('http://localhost:8082/api/admin/products', {
          headers: getAuthHeader(),
          params: {
            limit: 100, // Get a reasonable number of products for the dropdown
          },
        });
        setProducts(productsResponse.data.products);
      }

      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (productFilter) params.append('product_id', productFilter);
      if (ratingFilter) params.append('rating', ratingFilter);
      if (sortBy) params.append('sort', sortBy);
      if (sortOrder) params.append('order', sortOrder);
      params.append('page', page);
      params.append('limit', 10);

      // Fetch reviews
      const response = await axios.get(
        `http://localhost:8082/api/admin/reviews?${params.toString()}`,
        {
          headers: getAuthHeader(),
        }
      );

      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] laserXnext: Error fetching reviews:`, error);
      setErrorMessage(error.response?.data?.error || 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [searchTerm, productFilter, ratingFilter, sortBy, sortOrder, page]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Truncate long text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Handle bulk select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Only select anonymous reviews
      const anonymousReviews = reviews
        .filter((review) => review.name === 'Anonymous')
        .map((review) => review.id);
      setSelectedReviews(anonymousReviews);
    } else {
      setSelectedReviews([]);
    }
  };

  // Handle individual select
  const handleSelectReview = (e, reviewId, isAnonymous) => {
    // Only allow selecting anonymous reviews
    if (!isAnonymous) return;

    if (e.target.checked) {
      setSelectedReviews([...selectedReviews, reviewId]);
    } else {
      setSelectedReviews(selectedReviews.filter((id) => id !== reviewId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedReviews.length} anonymous reviews?`)) {
      try {
        await axios.delete('http://localhost:8082/api/admin/reviews', {
          headers: getAuthHeader(),
          data: { reviewIds: selectedReviews },
        });

        setSuccessMessage(`Successfully deleted ${selectedReviews.length} reviews`);
        setSelectedReviews([]);
        fetchReviews();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] laserXnext: Error deleting reviews:`, error);
        setErrorMessage(error.response?.data?.error || 'Failed to delete reviews');
      }
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
      // Set new sort column with default descending order for dates, ascending for others
      setSortBy(column);
      setSortOrder(column === 'created_at' ? 'desc' : 'asc');
    }
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="admin-loading">
        <i className="fi fi-rr-spinner admin-spinner"></i>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="admin-reviews">
      {errorMessage && (
        <div className="error-message">
          <i className="fi fi-rr-exclamation"></i>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>
            <i className="fi fi-rr-cross-small"></i>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          <i className="fi fi-rr-check"></i>
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage('')}>
            <i className="fi fi-rr-cross-small"></i>
          </button>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="toolbar-left">
          {selectedReviews.length > 0 && (
            <button className="admin-button danger" onClick={handleBulkDelete}>
              <i className="fi fi-rr-trash"></i> Delete Selected
            </button>
          )}

          <div className="selected-info">
            {selectedReviews.length > 0 && (
              <span>{selectedReviews.length} anonymous review(s) selected</span>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          <div className="search-box">
            <i className="fi fi-rr-search"></i>
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <i className="fi fi-rr-cross-small"></i>
              </button>
            )}
          </div>

          <div className="filter-controls">
            <select
              className="product-filter"
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <select
              className="rating-filter"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table reviews-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedReviews.length > 0 &&
                    selectedReviews.length === reviews.filter((r) => r.name === 'Anonymous').length &&
                    reviews.some((r) => r.name === 'Anonymous')
                  }
                />
              </th>
              <th
                className={`sortable ${sortBy === 'created_at' ? 'active' : ''}`}
                onClick={() => handleSort('created_at')}
              >
                Date
                {sortBy === 'created_at' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th>Product</th>
              <th
                className={`sortable ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                Reviewer
                {sortBy === 'name' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th
                className={`sortable ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => handleSort('rating')}
              >
                Rating
                {sortBy === 'rating' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th>Review Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">
                  <i className="fi fi-rr-info"></i>
                  <p>No reviews found</p>
                </td>
              </tr>
            ) : (
              reviews.map((review) => {
                const isAnonymous = review.name === 'Anonymous';

                return (
                  <tr key={review.id} className={isAnonymous ? 'anonymous-review' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={(e) => handleSelectReview(e, review.id, isAnonymous)}
                        disabled={!isAnonymous}
                      />
                    </td>
                    <td className="review-date">{formatDate(review.created_at)}</td>
                    <td className="review-product">
                      <Link className="Product-Link" to={`/admin/products/${review.product_id}`}>{getProductName(review.product_id)}</Link>
                    </td>
                    <td className={`review-author ${isAnonymous ? 'anonymous' : ''}`}>
                      {isAnonymous ? (
                        <span className="anonymous-badge">Anonymous</span>
                      ) : (
                        <>
                          {review.name}
                          {review.user_id && (
                            <Link to={`/admin/users/${review.user_id}`} className="user-link">
                              <i className="fi fi-rr-user"></i>
                            </Link>
                          )}
                        </>
                      )}
                    </td>
                    <td className="review-rating">
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`fi ${star <= review.rating ? 'fi-rr-star' : ''}`}></i>
                        ))}
                      </div>
                    </td>
                    <td className="admin-review-content">
                      {review.title && <div className="admin-review-title">{review.title}</div>}
                      <div className="admin-review-comment">{truncateText(review.comment)}</div>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-dropdown">
                        <button className="action-button">
                          <i className="fi fi-rr-menu-dots-vertical"></i>
                        </button>
                        <div className="dropdown-content">
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              // Open modal or expand to show full review
                              alert(`Full review:\n\nTitle: ${review.title || 'N/A'}\n\nComment: ${review.comment || 'N/A'}`);
                            }}
                          >
                            <i className="fi fi-rr-eye"></i> View Full Review
                          </button>
                          {isAnonymous && (
                            <button
                              className="dropdown-item text-danger"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete this anonymous review?`)) {
                                  try {
                                    await axios.delete(`http://localhost:8082/api/admin/reviews/${review.id}`, {
                                      headers: getAuthHeader(),
                                    });
                                    setSuccessMessage('Review deleted successfully');
                                    fetchReviews();

                                    // Clear success message after 3 seconds
                                    setTimeout(() => {
                                      setSuccessMessage('');
                                    }, 3000);
                                  } catch (error) {
                                    console.error(`[${new Date().toISOString()}] laserXnext: Error deleting review:`, error);
                                    setErrorMessage(error.response?.data?.error || 'Failed to delete review');
                                  }
                                }
                              }}
                            >
                              <i className="fi fi-rr-trash"></i> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <div className="pagination-info">
          Showing {reviews.length} of {(totalPages - 1) * 10 + reviews.length} reviews
        </div>

        <div className="pagination-controls">
          <button className="pagination-button" disabled={page === 1} onClick={() => goToPage(1)}>
            <i className="fi fi-rr-angle-double-left"></i>
          </button>
          <button className="pagination-button" disabled={page === 1} onClick={() => goToPage(page - 1)}>
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

          <button className="pagination-button" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>
            <i className="fi fi-rr-angle-right"></i>
          </button>
          <button className="pagination-button" disabled={page === totalPages} onClick={() => goToPage(totalPages)}>
            <i className="fi fi-rr-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reviews;