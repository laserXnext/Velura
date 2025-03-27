import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaBriefcase, FaCog, FaSignOutAlt, FaBars, FaBook, FaTimes } from "react-icons/fa";
import { PiDressFill } from "react-icons/pi";
import "../CSS/adminNav.css";

const AdminNav = ({ isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/admin/dashboard" },
    { name: "Users", icon: <FaUsers />, path: "/admin/users" },
    { name: "Sarees", icon: <PiDressFill />, path: "/admin/saree" },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? <FaBars /> : <FaTimes />}
      </button>
      <ul className="menu">
        {menuItems.map((item, index) => (
          <li key={index} className="menu-item">
            <Link to={item.path} className="menu-link">
              {item.icon}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <div className="logout">
        <button className="logout-btn">
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminNav;
