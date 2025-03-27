import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 10) {
      newErrors.username = "Username cannot exceed 10 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    } else if (formData.password.length > 8) {
      newErrors.password = "Password cannot exceed 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    navigate("/product");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8082/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const responseText = await response.text();

      if (response.status === 409) {
        toast.error(
          "Username or email already exists. Please try a different one."
        );
      } else if (response.ok) {
        toast.success("Registration successful! Please login to continue.");
        localStorage.setItem("username", formData.username);
        // Redirect after a short delay to show the toast message
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.error("Error response:", response.status, responseText);
        toast.error("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
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
            ></path>
          </svg>
          <h1 className="logo">
            <img src="./src/assets/logo.png" alt="Logo" />
          </h1>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-login-signup-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                maxLength="10"
                required
              />
              {errors.username && (
                <span className="error">{errors.username}</span>
              )}
            </div>

            <div className="form-login-signup-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-login-signup-group">
              <input
                type="password"
                name="password"
                placeholder="Password (4-8 characters)"
                value={formData.password}
                onChange={handleChange}
                minLength="4"
                maxLength="8"
                required
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>

            <div className="form-login-signup-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </div>

            <button className="btn signup" type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
            <p className="text">
              Already have an account? <Link to="/Login">Login</Link>
            </p>
          </form>
        </div>
        <div className="textcontainer">
          <h1 className="title">Join the World of Elegance!</h1>
          <h2 className="sub-title">Timeless traditions, just a click away.</h2>
          <p className="description">
            Create an account to explore exquisite sarees, get exclusive
            discounts, and stay updated with the latest trends in ethnic
            fashion. Start your journey of elegance today!
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
