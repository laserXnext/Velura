import React, {useState} from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "./Components/adminNav";
import "./CSS/admin.css";

const Admin = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className={`admin-container ${isCollapsed ? "collapsed" : ""}`}>
      <AdminNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
