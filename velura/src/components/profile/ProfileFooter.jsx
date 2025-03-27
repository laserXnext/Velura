import React from 'react';

const ProfileFooter = ({ currentDate, currentUser }) => {
  return (
    <div className="profile-footer">
      <div className="footer-info">
        <p className="last-login">Last login : {currentDate}</p>
      </div>
      <div className="support-links">
        <a href="#" className="support-link">Need Help?</a>
        <a href="#" className="support-link">Contact Support</a>
        <a href="#" className="support-link">Privacy Policy</a>
      </div>
    </div>
  );
};

export default ProfileFooter;