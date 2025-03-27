import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/editform.css";

const EditCourse = ({ courseId, onClose }) => {
  const [course, setCourse] = useState({
    title: "",
    provider: "",
    platform: "",
    duration: "",
    level: "",
    description: "",
    enrollment_link: "",
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState("");

  const platformOptions = ["Online", "Offline"];
  const levelOptions = ["Beginner", "Intermediate", "Advanced", "Mixed"];

  useEffect(() => {
    axios
      .get(`/api/coursesdata/${courseId}`)
      .then((response) => setCourse(response.data))
      .catch((error) => console.error("Error fetching course:", error));
  }, [courseId]);

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/editcourse/${courseId}`, course);
      toast.success("Course updated successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldClick = (field) => {
    setCurrentField(field);
    setIsModalOpen(true);
  };

  const handleSave = (value) => {
    setCourse((prev) => ({ ...prev, [currentField]: value }));
    setIsModalOpen(false);
  };

  return (
    <div className="edit-course-overlay">
      <ToastContainer />
      <div className="edit-course-container">
        <h2>Edit Course</h2>
        <form onSubmit={handleSubmit} className="edit-course-form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={course.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="provider"
            placeholder="Provider"
            value={course.provider}
            onChange={handleChange}
            required
          />

          <select
            name="platform"
            value={course.platform}
            onChange={handleChange}
            required
          >
            {platformOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="duration"
            placeholder="Duration"
            value={course.duration}
            onChange={handleChange}
            required
          />

          <select
            name="level"
            value={course.level}
            onChange={handleChange}
            required
          >
            {levelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div
            className="expandable-field"
            onClick={() => handleFieldClick("description")}
          >
            {course.description || "Description"}
          </div>

          <input
            type="hidden"
            name="description"
            value={course.description}
          />

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <i class="fi fi-rr-cross" onClick={() => setIsModalOpen(false)}></i>
                <h3>{currentField.toUpperCase()}</h3>
                <textarea
                  autoFocus
                  defaultValue={course[currentField]}
                  placeholder={`Enter ${currentField}...`}
                />
                <div className="modal-buttons">
                  <button type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSave(
                        document.querySelector(".modal-content textarea").value
                      )
                    }
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <input
            type="text"
            name="enrollment_link"
            placeholder="Enrollment Link"
            value={course.enrollment_link}
            onChange={handleChange}
            required
          />

          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
