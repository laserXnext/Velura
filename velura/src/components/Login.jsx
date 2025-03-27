import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../CSS/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleRedirect = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Using the updated port number to match your server configuration
      const response = await fetch("http://localhost:8082/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Log the response to see what fields are available
        console.log('[2025-03-25 19:49:44] laserXnext: Login response:', result);

        // Store basic user info
        localStorage.setItem("token", result.token); 
        localStorage.setItem("username", result.username); 
        localStorage.setItem("user_id", result.user_id);
        
        // Determine role - use result.role if available, otherwise set based on username
        // For testing, we're forcing admin for specific username
        let userRole = result.role;
        
        // If no role came from server, determine based on username (for testing)
        if (!userRole) {
            userRole = result.username === 'admin' ? 'admin' : 'user';
            console.log(`[2025-03-25 19:49:44] laserXnext: No role in response, assigning based on username: ${userRole}`);
        }
        
        // Hardcode admin role for specific usernames (FOR TESTING ONLY)
        if (result.username === 'laserXnext' || result.username === 'admin') {
            userRole = 'admin';
            console.log(`[2025-03-25 19:49:44] laserXnext: Force setting admin role for user: ${result.username}`);
        }
        
        // Store the role
        localStorage.setItem("role", userRole);
        
        // Store user data in localStorage
        const userData = {
          username: result.username,
          token: result.token,
          user_id: result.user_id,
          role: userRole
        };
        localStorage.setItem("user_data", JSON.stringify(userData));
        
        toast.success(`Welcome back, ${result.username}!`);
        
        setTimeout(() => {
          // Redirect based on user role
          if (userRole === "admin") {
            console.log(`[2025-03-25 19:49:44] laserXnext: Redirecting to admin panel`);
            navigate('/admin');
          } else {
            console.log(`[2025-03-25 19:49:44] laserXnext: Redirecting to home page`);
            navigate('/');
          }
        }, 1500);
      } else {
        if (response.status === 401) {
          toast.error("Invalid username or password. Please try again.");
        } else {
          const errorText = await response.text();
          console.error("[2025-03-25 19:49:44] laserXnext: Error response:", errorText);
          toast.error("Login failed. Please try again later.");
        }
      }
    } catch (error) {
      console.error("[2025-03-25 19:49:44] laserXnext: Fetch error:", error);
      toast.error("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="card">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            onClick={handleRedirect} 
            viewBox="0 0 24 24" 
            id="arrow-circle-left"
          >
            <path 
              fill="var(--background-col)" 
              d="M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M15,13h-3.6l1.3,1.3c0.4,0.4,0.4,1,0,1.4c-0.4,0.4-1,0.4-1.4,0l-3-3c-0.4-0.4-0.4-1,0-1.4c0,0,0,0,0,0l3-3c0.4-0.4,1-0.4,1.4,0c0,0,0,0,0,0c0.4,0.4,0.4,1,0,1.4c0,0,0,0,0,0L11.4,11H15c0.6,0,1,0.4,1,1S15.6,13,15,13z"
            />
          </svg>
          
          <h1 className="logo">
            <img src="./src/assets/logo.png" alt="Logo" />
          </h1>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-login-signup-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>
            
            <div className="form-login-signup-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            
            <button 
              type="submit" 
              className="btn login"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <p className="text">
              Don't have an account? <Link to="/Signup">Sign Up</Link>
            </p>
            
            <p className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
          </form>
        </div>
        
        <div className="textcontainer-login">
          <h1 className="title-login">Welcome Back to Elegance!</h1>
          <h2 className="sub-title-login">Step into the world of timeless tradition.</h2>
          <p className="description-login">
            Log in to explore the finest collection of sarees, handpicked for every occasion. 
            Continue your journey of elegance with exclusive deals, new arrivals, and a seamless shopping experience!
          </p>
        </div>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Login;