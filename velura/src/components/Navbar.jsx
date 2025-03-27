import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/cartContext";
import MiniProfile from "./miniprofile";
import useAuth from "../hooks/useAuth";
import "../css/navbar.css"; 

const Navbar = () => {
    const user = useAuth();
    const { itemCount } = useCart();

    const [showProfile, setShowProfile] = useState(false);

    const toggleProfile = () => {
        setShowProfile((prev) => !prev);
    };

    const closeProfile = (e) => {
        if (!e.target.closest(".mini-profile") && !e.target.closest(".user-profile")) {
            setShowProfile(false);
        }
    };

    const cartNav = () => {
        window.location.href = "/cart";
    }

    useEffect(() => {
        document.addEventListener("click", closeProfile);
        return () => {
            document.removeEventListener("click", closeProfile);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src="./src/assets/logo.png" alt="Logo" />
            </div>
            <ul className="navbar-links">
                <li><Link to="/"><i class="fi fi-rr-house-chimney"/>Home</Link></li>
                <li><Link to="/product"><i class="fi fi-rr-shopping-bag"/>Saree</Link></li>
                <li><Link to="/about"><i class="fi fi-rr-info"/>About Us</Link></li>
            </ul>
            <div className="navbar-buttons">
                {user ? (
                    <div className="user-profile">
                        <i className="fi fi-rr-cart-shopping-fast" id="profile" onClick={cartNav}  data-count={itemCount}></i>
                        <i className="fi fi-rr-circle-user" id="profile" onClick={toggleProfile}/>
                        
                    </div>
                ) : (
                    <>
                        <button className="login-button">
                            <Link to="/Login"><span>Login</span></Link>
                        </button>
                        <button className="signup-button">
                            <Link to="/Signup"><span>Sign Up</span></Link>
                        </button>
                    </>
                )}
            </div>
            {showProfile && <MiniProfile onClose={() => setShowProfile(false)} />}
        </nav>
    );
};

export default Navbar;
