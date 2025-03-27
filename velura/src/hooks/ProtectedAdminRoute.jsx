import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedAdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  
  useEffect(() => {
    // If not admin, show toast message
    if (userRole !== "admin") {
      toast.error("You don't have permission to access the admin panel", {
        position: "top-center",
        autoClose: 3000
      });
    }
  }, [userRole]);
  
  // If not authenticated or not an admin, redirect to login page
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace state={{ returnUrl: window.location.pathname }} />;
  }
  
  // If authenticated but not an admin, redirect to home page
  if (userRole !== "admin") {
    return <Navigate to="/" replace />;
  }
  
  // If admin, render the protected route
  return children;
};

export default ProtectedAdminRoute;