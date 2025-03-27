import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [countries, setCountries] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get auth token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Fetch countries if needed
      if (countries.length === 0) {
        const countriesResponse = await axios.get('http://localhost:8082/api/admin/users/countries', {
          headers: getAuthHeader()
        });
        setCountries(countriesResponse.data);
      }
      
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (countryFilter) params.append('country', countryFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (sortBy) params.append('sort', sortBy);
      if (sortOrder) params.append('order', sortOrder);
      params.append('page', page);
      params.append('limit', 10);
      
      // Fetch users
      const response = await axios.get(`http://localhost:8082/api/admin/users?${params.toString()}`, {
        headers: getAuthHeader()
      });
      
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] laserXnext: Error fetching users:`, error);
      setErrorMessage(error.response?.data?.error || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, countryFilter, statusFilter, sortBy, sortOrder, page]);
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle bulk select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user.user_id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  // Handle individual select
  const handleSelectUser = (e, userId) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;
    
    try {
      if (action === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          await axios.delete('http://localhost:8082/api/admin/users', {
            headers: getAuthHeader(),
            data: { userIds: selectedUsers }
          });
          
          // Refetch users after deletion
          fetchUsers();
          setSelectedUsers([]);
        }
      } else if (action === 'activate' || action === 'deactivate') {
        await axios.put('http://localhost:8082/api/admin/users/status', {
          userIds: selectedUsers,
          status: action === 'activate' ? 'Active' : 'Inactive'
        }, {
          headers: getAuthHeader()
        });
        
        // Refetch users after status update
        fetchUsers();
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] laserXnext: Error performing bulk action:`, error);
      setErrorMessage(error.response?.data?.error || `Failed to ${action} users`);
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
        <p>Loading users...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-users">
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
          <Link to="/admin/customers/new" className="admin-button primary">
            <i className="fi fi-rr-plus"></i> Add New User
          </Link>
          
          <div className="bulk-actions">
            <select 
              className="bulk-action-select"
              disabled={selectedUsers.length === 0}
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
              placeholder="Search users..."
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
              className="country-filter"
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <select 
              className="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table users-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedUsers.length === users.length && users.length > 0}
                />
              </th>
              <th className="image-column">Avatar</th>
              <th 
                className={`sortable ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                Name
                {sortBy === 'name' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th 
                className={`sortable ${sortBy === 'email' ? 'active' : ''}`}
                onClick={() => handleSort('email')}
              >
                Email
                {sortBy === 'email' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th>Phone</th>
              <th>Location</th>
              <th 
                className={`sortable ${sortBy === 'date_joined' ? 'active' : ''}`}
                onClick={() => handleSort('date_joined')}
              >
                Date Joined
                {sortBy === 'date_joined' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th 
                className={`sortable ${sortBy === 'last_login' ? 'active' : ''}`}
                onClick={() => handleSort('last_login')}
              >
                Last Login
                {sortBy === 'last_login' && (
                  <i className={`fi fi-rr-${sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}`}></i>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-results">
                  <i className="fi fi-rr-info"></i>
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.user_id}>
                  <td>
                    <input 
                      type="checkbox"
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={(e) => handleSelectUser(e, user.user_id)}
                    />
                  </td>
                  <td className="user-avatar">
                    <img 
                      src={user.profile_image_path} 
                      alt={user.name}
                      onError={(e) => { e.target.src = "/default-avatar.png"; }}
                    />
                  </td>
                  <td className="admin-user-name">
                    <Link className='fullname' to={`/admin/customers/${user.user_id}`}>{user.name}</Link>
                    <span className="username">@{user.username}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td className="user-location">
                    {user.city && user.country ? `${user.city}, ${user.country}` : 'N/A'}
                  </td>
                  <td className="date-joined">
                    {formatDate(user.date_joined)}
                  </td>
                  <td className="last-login">
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </td>
                  <td className="actions-cell">
                    <div className="actions-dropdown">
                      <button className="action-button">
                        <i className="fi fi-rr-menu-dots-vertical"></i>
                      </button>
                      <div className="dropdown-content">
                        <button 
                          className="dropdown-item text-danger"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete "${user.name}"?`)) {
                              try {
                                await axios.delete('http://localhost:8082/api/admin/users', {
                                  headers: getAuthHeader(),
                                  data: { userIds: [user.user_id] }
                                });
                                fetchUsers();
                              } catch (error) {
                                console.error(`[${new Date().toISOString()}] laserXnext: Error deleting user:`, error);
                                setErrorMessage(error.response?.data?.error || 'Failed to delete user');
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
          Showing {users.length} of {(totalPages - 1) * 10 + users.length} users
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

export default Users;