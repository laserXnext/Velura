import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  
  const navigate = useNavigate();

  // Get authentication header using the same approach as your existing code
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Helper function to make authenticated API calls
  const fetchWithAuth = async (url) => {
    // Get auth headers using your existing function
    const headers = getAuthHeader();
    
    // Check if we have an authorization header
    if (!headers.Authorization) {
      console.error(`[2025-03-25 13:16:24] laserXnext: No token found in localStorage`);
      throw new Error('No authentication token found');
    }
    
    console.log(`[2025-03-25 13:16:24] laserXnext: Fetching ${url} with auth token`);
    
    const response = await fetch(url, {
      headers: headers
    });
    
    if (response.status === 401) {
      console.error(`[2025-03-25 13:16:24] laserXnext: Unauthorized access for ${url}`);
      throw new Error('Unauthorized access');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[2025-03-25 13:16:24] laserXnext: API error for ${url}: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  };
  
  useEffect(() => {
    // Fetch dashboard data from real APIs
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setAuthError(false);

        const userRole = localStorage.getItem("role");
        if (userRole !== "admin") {
          console.error(
            `[2025-03-25 13:16:24] laserXnext: Unauthorized access - not an admin`
          );
          setAuthError(true);
          return;
        }
  
        
        // Use try-catch blocks for each API call to prevent one failure from stopping all data fetching
        let productsData = { pagination: { total: 0 } };
        let lowStockData = { pagination: { total: 0 } };
        let ordersData = { orders: [], pagination: { total: 0 } };
        let pendingOrdersData = { pagination: { total: 0 } };
        let userStatsData = { totalUsers: 0 };
        
        try {
          // Fetch product stats
          productsData = await fetchWithAuth('/api/admin/products');
        } catch (error) {
          console.error(`[2025-03-25 13:16:24] laserXnext: Error fetching products:`, error.message);
          
          if (error.message === 'Unauthorized access') {
            setAuthError(true);
            return;
          }
        }
        
        try {
          // Fetch low stock products count
          lowStockData = await fetchWithAuth('/api/admin/products?stock=low');
        } catch (error) {
          console.error(`[2025-03-25 13:16:24] laserXnext: Error fetching low stock products:`, error.message);
        }
        
        try {
          // Fetch orders
          ordersData = await fetchWithAuth('/api/admin/orders');
        } catch (error) {
          console.error(`[2025-03-25 13:16:24] laserXnext: Error fetching orders:`, error.message);
        }
        
        try {
          // Fetch pending orders
          pendingOrdersData = await fetchWithAuth('/api/admin/orders?status=Pending');
        } catch (error) {
          console.error(`[2025-03-25 13:16:24] laserXnext: Error fetching pending orders:`, error.message);
        }
        
        try {
          // Fetch user stats
          userStatsData = await fetchWithAuth('/api/admin/users/stats');
        } catch (error) {
          console.error(`[2025-03-25 13:16:24] laserXnext: Error fetching user stats:`, error.message);
        }
        
        // Calculate total revenue from orders
        let totalRevenue = 0;
        if (ordersData && ordersData.orders) {
          totalRevenue = ordersData.orders.reduce((sum, order) => sum + order.total_amount, 0);
        }
        
        // Set stats
        setStats({
          revenue: totalRevenue,
          orders: ordersData?.pagination?.total || 0,
          customers: userStatsData?.totalUsers || 0,
          products: productsData?.pagination?.total || 0,
          pendingOrders: pendingOrdersData?.pagination?.total || 0,
          lowStockProducts: lowStockData?.pagination?.total || 0
        });
        
        // Fetch top products
        try {
          const topProductsData = await fetchWithAuth('/api/admin/products?sort=sales&order=desc&limit=5');
          
          if (topProductsData && topProductsData.products) {
            // Format top products data
            const formattedTopProducts = topProductsData.products.map(product => ({
              id: product.id,
              name: product.name,
              sales: product.sold_count || 0,
              revenue: product.price * (product.sold_count || 0)
            }));
            setTopProducts(formattedTopProducts);
          }
        } catch (error) {
          console.error(`[2025-03-25 13:16:24] laserXnext: Error fetching top products:`, error.message);
        }
        
        // Fetch recent orders
        try {
          const recentOrdersData = await fetchWithAuth('/api/admin/orders?limit=5&sort=order_date&order=desc');
          
          if (recentOrdersData && recentOrdersData.orders) {
            // Format recent orders data
            const formattedRecentOrders = recentOrdersData.orders.map(order => ({
              id: order.id,
              customer: order.customer_name,
              date: order.order_date,
              status: order.status,
              total: order.total_amount
            }));
            setRecentOrders(formattedRecentOrders);
          }
        } catch (error) {
          console.error(`[2025-03-25 13:16:24] laserXnext: Error fetching recent orders:`, error.message);
        }
        
      } catch (error) {
        console.error(`[2025-03-25 13:16:24] laserXnext: Dashboard data error:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Handle login redirect if authentication fails
  if (authError) {
    return (
      <div className="admin-auth-error">
        <div className="auth-error-container">
          <i className="fi fi-rr-lock auth-error-icon"></i>
          <h2>Authentication Required</h2>
          <p>Your session may have expired. Please log in again to continue.</p>
          <button 
            className="auth-login-button"
            onClick={() => navigate('/login', { state: { returnUrl: '/admin' } })}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fi fi-rr-spinner admin-spinner"></i>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-icon revenue">
            <i className="fi fi-rr-sack-dollar"></i>
          </div>
          <div className="stats-info">
            <h3>Total Revenue</h3>
            <p className="stats-value">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon orders">
            <i className="fi fi-rr-shopping-cart"></i>
          </div>
          <div className="stats-info">
            <h3>Total Orders</h3>
            <p className="stats-value">{stats.orders}</p>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon customers">
            <i className="fi fi-rr-users"></i>
          </div>
          <div className="stats-info">
            <h3>Customers</h3>
            <p className="stats-value">{stats.customers}</p>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon products">
            <i className="fi fi-rr-box"></i>
          </div>
          <div className="stats-info">
            <h3>Products</h3>
            <p className="stats-value">{stats.products}</p>
          </div>
        </div>
      </div>
      
      {/* Alert Cards */}
      <div className="alert-cards">
        <Link to="/admin/orders?status=pending" className="alert-card pending-orders">
          <div className="alert-icon">
            <i className="fi fi-rr-exclamation"></i>
          </div>
          <div className="alert-info">
            <h3>{stats.pendingOrders} Pending Orders</h3>
            <p>Orders waiting to be processed</p>
          </div>
          <i className="fi fi-rr-angle-right alert-arrow"></i>
        </Link>
        
        <Link to="/admin/products?stock=low" className="alert-card low-stock">
          <div className="alert-icon">
            <i className="fi fi-rr-exclamation"></i>
          </div>
          <div className="alert-info">
            <h3>{stats.lowStockProducts} Low Stock Items</h3>
            <p>Products that need restocking</p>
          </div>
          <i className="fi fi-rr-angle-right alert-arrow"></i>
        </Link>
      </div>
      
      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Top Products */}
        <div className="dashboard-card top-products">
          <div className="card-header">
            <h2>Top Selling Products</h2>
            <Link to="/admin/products" className="view-all">
              View All
            </Link>
          </div>
          <div className="card-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length > 0 ? (
                  topProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <Link to={`/admin/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </td>
                      <td>{product.sales} units</td>
                      <td>{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-table-message">No product data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="dashboard-card recent-orders">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="view-all">
              View All
            </Link>
          </div>
          <div className="card-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/admin/orders/${order.id}`}>
                          {order.id}
                        </Link>
                      </td>
                      <td>{order.customer}</td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatCurrency(order.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-table-message">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;