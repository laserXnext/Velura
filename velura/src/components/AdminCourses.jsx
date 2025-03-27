import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/admintable.css";

const AdminCourses = () => {
  const [sarees, setSarees] = useState([]);
  const [selectedSareeId, setSelectedSareeId] = useState(null);

  useEffect(() => {
    // Temporary data
    const tempSarees = [
      { id: 1, created_date_time: "2023-01-01T00:00:00", updated_date_time: "2023-01-01T00:00:00", available: true, category: "Category 1", color: "Red", description: "Description 1", discount_percentage: 10, image_url: "http://example.com/image1.jpg", material: "Material 1", name: "Saree 1", price: 100.0, rating: 4.5, stock_quantity: 10 },
      { id: 2, created_date_time: "2023-01-02T00:00:00", updated_date_time: "2023-01-02T00:00:00", available: false, category: "Category 2", color: "Blue", description: "Description 2", discount_percentage: 20, image_url: "http://example.com/image2.jpg", material: "Material 2", name: "Saree 2", price: 200.0, rating: 4.0, stock_quantity: 20 },
      { id: 3, created_date_time: "2023-01-03T00:00:00", updated_date_time: "2023-01-03T00:00:00", available: true, category: "Category 3", color: "Green", description: "Description 3", discount_percentage: 30, image_url: "http://example.com/image3.jpg", material: "Material 3", name: "Saree 3", price: 300.0, rating: 3.5, stock_quantity: 30 },
    ];
    setSarees(tempSarees);
  }, []);

  return (
    <div className="admin-courses-container">
      <h2>All Sarees</h2>
      <ToastContainer />
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Created Date</th>
            <th>Updated Date</th>
            <th>Available</th>
            <th>Category</th>
            <th>Color</th>
            <th>Description</th>
            <th>Discount (%)</th>
            <th>Image</th>
            <th>Material</th>
            <th>Name</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Stock Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sarees.map((saree) => (
            <tr key={saree.id}>
              <td>{saree.id}</td>
              <td>{saree.created_date_time}</td>
              <td>{saree.updated_date_time}</td>
              <td>{saree.available ? "Yes" : "No"}</td>
              <td>{saree.category}</td>
              <td>{saree.color}</td>
              <td>{saree.description}</td>
              <td>{saree.discount_percentage}%</td>
              <td><img src={saree.image_url} alt={saree.name} width="50" /></td>
              <td>{saree.material}</td>
              <td>{saree.name}</td>
              <td>${saree.price.toFixed(2)}</td>
              <td>{saree.rating}</td>
              <td>{saree.stock_quantity}</td>
              <td>
                <div className="action-buttons">
                  <i className="fi fi-rr-edit" onClick={() => setSelectedSareeId(saree.id)} />
                  <i className="fi fi-rr-trash" onClick={() => toast("Confirm delete?")} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCourses;