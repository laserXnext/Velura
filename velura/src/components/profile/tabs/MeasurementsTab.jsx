import React, { useState } from 'react';
import { toast } from 'react-toastify';

const MeasurementsTab = ({ measurements, setMeasurements }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeasurements, setEditedMeasurements] = useState({...measurements});
  const [loading, setLoading] = useState(false);
  
  // Current timestamp from the provided datetime
  const currentTime = '2025-03-18 10:40:23'; // Updated timestamp
  const currentUser = 'laserXnext'; // Current user

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects like blouse.bust
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedMeasurements({
        ...editedMeasurements,
        [parent]: {
          ...editedMeasurements[parent],
          [child]: value
        }
      });
    } else {
      setEditedMeasurements({
        ...editedMeasurements,
        [name]: value
      });
    }
  };
  
  const handleCancel = () => {
    setEditedMeasurements({...measurements});
    setIsEditing(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      
      if (!token || !userId) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      
      const response = await fetch(`http://localhost:8082/api/user/measurements/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedMeasurements)
      });
      
      if (response.ok) {
        // Update the measurements state with current timestamp
        setMeasurements({
          ...editedMeasurements,
          lastUpdated: currentTime
        });
        toast.success("Measurements updated successfully!");

        setIsEditing(false);
      } else {
        let errorMessage = "Failed to update measurements. Please try again.";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          try {
            errorMessage = await response.text();
          } catch (textError) {
            console.error("Couldn't parse error response:", textError);
          }
        }
        
        console.error("Error updating measurements:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating measurements:", error);
      toast.error("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="profile-section measurements-section">
      <div className="section-header">
        <h2>Your Measurements</h2>
        {!isEditing ? (
          <button 
            className="edit-btn" 
            onClick={() => setIsEditing(true)}
          >
            <i className="fi fi-rr-edit"></i> Edit
          </button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="measurements-display">
          <div className="measurements-group">
            <h3>Blouse Measurements</h3>
            <div className="measurement-row">
              <div className="measurement-item">
                <span className="measurement-label">Bust</span>
                <span className="measurement-value">{measurements.blouse?.bust || '-'} inches</span>
              </div>
              <div className="measurement-item">
                <span className="measurement-label">Waist</span>
                <span className="measurement-value">{measurements.blouse?.waist || '-'} inches</span>
              </div>
            </div>
            <div className="measurement-row">
              <div className="measurement-item">
                <span className="measurement-label">Shoulder</span>
                <span className="measurement-value">{measurements.blouse?.shoulder || '-'} inches</span>
              </div>
              <div className="measurement-item">
                <span className="measurement-label">Arm Length</span>
                <span className="measurement-value">{measurements.blouse?.armLength || '-'} inches</span>
              </div>
            </div>
            <div className="measurement-row">
              <div className="measurement-item">
                <span className="measurement-label">Armhole</span>
                <span className="measurement-value">{measurements.blouse?.armhole || '-'} inches</span>
              </div>
            </div>
          </div>
          
          <div className="measurements-group">
            <h3>Petticoat Measurements</h3>
            <div className="measurement-row">
              <div className="measurement-item">
                <span className="measurement-label">Waist</span>
                <span className="measurement-value">{measurements.petticoat?.waist || '-'} inches</span>
              </div>
              <div className="measurement-item">
                <span className="measurement-label">Length</span>
                <span className="measurement-value">{measurements.petticoat?.length || '-'} inches</span>
              </div>
            </div>
          </div>

          <div className="measurement-guide">
            <div className="guide-header">
              <i className="fi fi-rr-info"></i>
              <h4>How to Measure</h4>
            </div>
            <div className="guide-content">
              <p>For the most accurate fit, please measure yourself while wearing minimal clothing. Use a flexible measuring tape and keep it snug but not tight.</p>
              <ul>
                <li><strong>Bust:</strong> Measure at the fullest part of your bust, keeping the tape parallel to the floor.</li>
                <li><strong>Waist:</strong> Measure at your natural waistline, the smallest part of your waist.</li>
                <li><strong>Shoulder:</strong> Measure from the edge of one shoulder to the other.</li>
                <li><strong>Arm Length:</strong> Measure from your shoulder to your wrist.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <form className="measurements-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Blouse Measurements</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="blouse.bust">Bust (inches)</label>
                <input
                  type="number"
                  id="blouse.bust"
                  name="blouse.bust"
                  value={editedMeasurements.blouse?.bust || ''}
                  onChange={handleInputChange}
                  step="0.25"
                  min="20"
                  max="60"
                  placeholder="Enter measurement"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="blouse.waist">Waist (inches)</label>
                <input
                  type="number"
                  id="blouse.waist"
                  name="blouse.waist"
                  value={editedMeasurements.blouse?.waist || ''}
                  onChange={handleInputChange}
                  step="0.25"
                  min="18"
                  max="50"
                  placeholder="Enter measurement"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="blouse.shoulder">Shoulder (inches)</label>
                <input
                  type="number"
                  id="blouse.shoulder"
                  name="blouse.shoulder"
                  value={editedMeasurements.blouse?.shoulder || ''}
                  onChange={handleInputChange}
                  step="0.25"
                  min="10"
                  max="30"
                  placeholder="Enter measurement"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="blouse.armLength">Arm Length (inches)</label>
                <input
                  type="number"
                  id="blouse.armLength"
                  name="blouse.armLength"
                  value={editedMeasurements.blouse?.armLength || ''}
                  onChange={handleInputChange}
                  step="0.25"
                  min="15"
                  max="40"
                  placeholder="Enter measurement"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="blouse.armhole">Armhole (inches)</label>
                <input
                  type="number"
                  id="blouse.armhole"
                  name="blouse.armhole"
                  value={editedMeasurements.blouse?.armhole || ''}
                  onChange={handleInputChange}
                  step="0.25"
                  min="10"
                  max="30"
                  placeholder="Enter measurement"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Petticoat Measurements</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="petticoat.waist">Waist (inches)</label>
                <input
                  type="number"
                  id="petticoat.waist"
                  name="petticoat.waist"
                  value={editedMeasurements.petticoat?.waist || ''}
                  onChange={handleInputChange}
                  step="0.25"
                  min="18"
                  max="50"
                  placeholder="Enter measurement"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="petticoat.length">Length (inches)</label>
                <input
                  type="number"
                  id="petticoat.length"
                  name="petticoat.length"
                  value={editedMeasurements.petticoat?.length || ''}
                  onChange={handleInputChange}
                  step="0.25"
                  min="30"
                  max="60"
                  placeholder="Enter measurement"
                />
              </div>
            </div>
          </div>

          <div className="measure-tips">
            <div className="tip-icon">
              <i className="fi fi-rr-bulb"></i>
            </div>
            <div className="tip-content">
              <h4>Measurement Tips</h4>
              <p>For the most accurate results:</p>
              <ul>
                <li>Use a flexible measuring tape</li>
                <li>Keep the tape snug but not tight</li>
                <li>Measure over minimal clothing</li>
                <li>Have someone help you if possible</li>
              </ul>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Measurements'}
            </button>
          </div>
          
          <div className="form-footer">
            <p>Last edited: {currentTime} by {currentUser}</p>
          </div>
        </form>
      )}
    </div>
  );
};

export default MeasurementsTab;