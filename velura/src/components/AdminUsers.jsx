import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/admintable.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/userdata")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString();
  };

  const deleteUser = (id) => {
    fetch(`http://localhost:3000/api/deleteuser/${id}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Deleted user:", data);
        setUsers(users.filter((user) => user.id !== id));
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        toast.success("User and their resume deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        toast.error(`Error deleting user: ${error.message}`);
      });
  };
  

  const showConfirmationToast = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="toast-notify-delete">
          <p>Are you sure you want to delete this user?</p>
          <button onClick={() => { deleteUser(id); closeToast(); }}>Yes</button>
          <button onClick={closeToast}>No</button>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      }
    );
  };

  return (
    <div>
      <h2>All Users</h2>
      <ToastContainer />
      <table border="1">
        <thead>
          <tr>
            <th className="table-id">ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Date Account Made</th>
            <th className="table-action">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{formatDate(user.date_account_made)}</td>
              <td>
                <div className="action-buttons">
                  <i
                    className="fi fi-rr-trash"
                    onClick={() => showConfirmationToast(user.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
