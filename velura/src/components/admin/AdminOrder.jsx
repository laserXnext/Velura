// src/pages/admin/Orders.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const Orders = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("order_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Get auth token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (dateFilter) params.append("dateFilter", dateFilter);
      if (sortBy) params.append("sort", sortBy);
      if (sortOrder) params.append("order", sortOrder);
      params.append("page", page);
      params.append("limit", 10);

      const response = await axios.get(
        `http://localhost:8082/api/admin/orders?${params.toString()}`,
        { headers: getAuthHeader() }
      );

      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] laserXnext: Error fetching orders:`,
        error
      );
      setErrorMessage(error.response?.data?.error || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, dateFilter, sortBy, sortOrder, page]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle bulk select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Handle individual select
  const handleSelectOrder = (e, orderId) => {
    if (e.target.checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) return;

    let status;
    if (action === "mark-processing") {
      status = "Processing";
    } else if (action === "mark-shipped") {
      status = "Shipped";
    } else if (action === "mark-delivered") {
      status = "Delivered";
    } else if (action === "mark-cancelled") {
      if (
        !window.confirm(
          `Are you sure you want to cancel ${selectedOrders.length} orders?`
        )
      ) {
        return;
      }
      status = "Cancelled";
    } else {
      return;
    }

    try {
      await axios.put(
        "http://localhost:8082/api/admin/orders/status",
        { orderIds: selectedOrders, status },
        { headers: getAuthHeader() }
      );

      // Refetch orders to update the list
      fetchOrders();

      // Clear selection
      setSelectedOrders([]);
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] laserXnext: Error updating orders:`,
        error
      );
      setErrorMessage(
        error.response?.data?.error || `Failed to update orders to ${status}`
      );
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
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column with default descending order for dates, ascending for others
      setSortBy(column);
      setSortOrder(column === "order_date" ? "desc" : "asc");
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fi fi-rr-spinner admin-spinner"></i>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      {errorMessage && (
        <div className="admin-error-message">
          <i className="fi fi-rr-exclamation"></i>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage("")}>
            <i className="fi fi-rr-cross-small"></i>
          </button>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="bulk-actions">
            <select
              className="bulk-action-select"
              disabled={selectedOrders.length === 0}
              onChange={(e) => handleBulkAction(e.target.value)}
              value=""
            >
              <option value="">Bulk Actions</option>
              <option value="mark-processing">Mark as Processing</option>
              <option value="mark-shipped">Mark as Shipped</option>
              <option value="mark-delivered">Mark as Delivered</option>
              <option value="mark-cancelled">Mark as Cancelled</option>
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="search-box">
            <i className="fi fi-rr-search"></i>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on new search
              }}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            )}
          </div>

          <div className="filter-controls">
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-controls">
            <select
              className="admin-date-filter"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table orders-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedOrders.length === orders.length && orders.length > 0
                  }
                />
              </th>
              <th
                className={`sortable ${sortBy === "order_id" ? "active" : ""}`}
                onClick={() => handleSort("order_id")}
              >
                Order
                {sortBy === "order_id" && (
                  <i
                    className={`fi fi-rr-${
                      sortOrder === "asc" ? "arrow-up" : "arrow-down"
                    }`}
                  ></i>
                )}
              </th>
              <th
                className={`sortable ${
                  sortBy === "customer_name" ? "active" : ""
                }`}
                onClick={() => handleSort("customer_name")}
              >
                Customer
                {sortBy === "customer_name" && (
                  <i
                    className={`fi fi-rr-${
                      sortOrder === "asc" ? "arrow-up" : "arrow-down"
                    }`}
                  ></i>
                )}
              </th>
              <th
                className={`sortable ${
                  sortBy === "order_date" ? "active" : ""
                }`}
                onClick={() => handleSort("order_date")}
              >
                Date
                {sortBy === "order_date" && (
                  <i
                    className={`fi fi-rr-${
                      sortOrder === "asc" ? "arrow-up" : "arrow-down"
                    }`}
                  ></i>
                )}
              </th>
              <th>Status</th>
              <th
                className={`sortable ${
                  sortBy === "total_amount" ? "active" : ""
                }`}
                onClick={() => handleSort("total_amount")}
              >
                Total
                {sortBy === "total_amount" && (
                  <i
                    className={`fi fi-rr-${
                      sortOrder === "asc" ? "arrow-up" : "arrow-down"
                    }`}
                  ></i>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">
                  <i className="fi fi-rr-info"></i>
                  <p>No orders found</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => handleSelectOrder(e, order.id)}
                    />
                  </td>
                  <td className="order-id">
                    <Link to={`/admin/orders/${order.id}`}>{order.id}</Link>
                    <span className="admin-order-items">
                      {order.items_count} items
                    </span>
                  </td>
                  <td className="customer-info">
                    <div className="customer-name">{order.customer_name}</div>
                    <div className="customer-email">{order.customer_email}</div>
                  </td>
                  <td className="order-date">{formatDate(order.order_date)}</td>
                  <td>
                    <span
                      className={`status-badge status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="order-total">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="actions-cell">
                    <div className="actions-dropdown">
                      <button className="action-button">
                        <i className="fi fi-rr-menu-dots-vertical"></i>
                      </button>
                      <div className="dropdown-content">
                        <Link to={`/admin/orders/${order.id}`}>
                          <i className="fi fi-rr-eye"></i> View Details
                        </Link>
                        <button className="dropdown-item">
                          <i className="fi fi-rr-print"></i> Print Invoice
                        </button>
                        <div className="dropdown-divider"></div>
                        <button
                          className="dropdown-item text-danger"
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Are you sure you want to change the status of order ${order.id} to Cancelled?`
                              )
                            ) {
                              try {
                                await axios.put(
                                  "http://localhost:8082/api/admin/orders/status",
                                  { orderIds: [order.id], status: "Cancelled" },
                                  { headers: getAuthHeader() }
                                );
                                fetchOrders();
                              } catch (error) {
                                console.error(
                                  `[${new Date().toISOString()}] laserXnext: Error cancelling order:`,
                                  error
                                );
                                setErrorMessage(
                                  error.response?.data?.error ||
                                    "Failed to cancel order"
                                );
                              }
                            }
                          }}
                        >
                          <i className="fi fi-rr-cross-circle"></i> Cancel Order
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
          Showing {orders.length} of {(totalPages - 1) * 10 + orders.length}{" "}
          orders
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
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`pagination-button ${
                    pageNum === page ? "active" : ""
                  }`}
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

export default Orders;
