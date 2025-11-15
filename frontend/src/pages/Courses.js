import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../services/api';
import { BookOpen, Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    description: '',
    credits: 3,
    teacher_id: 1
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await coursesAPI.createCourse(formData);
      setIsModalOpen(false);
      setFormData({
        course_code: '',
        course_name: '',
        description: '',
        credits: 3,
        teacher_id: 1
      });
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Error creating course:', error);
      setError('Failed to create course');
    }
  };

  const canManageCourses = user?.role === 'admin' || user?.role === 'teacher';

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner text="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <div className="card-header">
          <h1>
            <BookOpen size={24} style={{ marginRight: '0.5rem' }} />
            Courses Management
          </h1>
          {canManageCourses && (
            <button 
              className="btn btn-success"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              Add Course
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="card">
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} 
            />
            <input
              type="text"
              placeholder="Search courses by code, name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        {/* Courses Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Description</th>
                <th>Credits</th>
                <th>Teacher</th>
                {canManageCourses && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <strong>{course.course_code}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>
                      {course.course_name}
                    </div>
                  </td>
                  <td>
                    {course.description || (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                        No description
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {course.credits} credits
                    </span>
                  </td>
                  <td>
                    {course.teacher?.user?.full_name || 'Unknown Teacher'}
                  </td>
                  {canManageCourses && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.5rem' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.5rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '0.5rem' }}
                        >
                          <Users size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td 
                    colSpan={canManageCourses ? 6 : 5} 
                    style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}
                  >
                    {searchTerm ? 'No courses found matching your search' : 'No courses found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Course Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormData({
              course_code: '',
              course_name: '',
              description: '',
              credits: 3,
              teacher_id: 1
            });
          }}
          title="Add New Course"
        >
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course_code">Course Code *</label>
                <input
                  type="text"
                  id="course_code"
                  name="course_code"
                  value={formData.course_code}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="form-group">
                <label htmlFor="course_name">Course Name *</label>
                <input
                  type="text"
                  id="course_name"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="credits">Credits *</label>
                <select
                  id="credits"
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  required
                >
                  <option value={1}>1 Credit</option>
                  <option value={2}>2 Credits</option>
                  <option value={3}>3 Credits</option>
                  <option value={4}>4 Credits</option>
                  <option value={5}>5 Credits</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="teacher_id">Teacher ID *</label>
                <input
                  type="number"
                  id="teacher_id"
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleInputChange}
                  required
                  placeholder="Teacher ID"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Course description..."
                rows="4"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
              >
                Create Course
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Courses;