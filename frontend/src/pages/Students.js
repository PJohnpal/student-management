import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { Users, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { formatDate } from '../utils/helpers';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        // Implement delete functionality
        console.log('Delete student:', studentId);
        // await studentsAPI.deleteStudent(studentId);
        // fetchStudents(); // Refresh the list
      } catch (error) {
        console.error('Error deleting student:', error);
        setError('Failed to delete student');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner text="Loading students..." />
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <div className="card-header">
          <h1>
            <Users size={24} style={{ marginRight: '0.5rem' }} />
            Students Management
          </h1>
          <button 
            className="btn btn-success"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Add Student
          </button>
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
              placeholder="Search students by name, ID, or email..."
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

        {/* Students Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Enrollment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.student_id}</strong>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600' }}>
                        {student.user?.full_name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        DOB: {formatDate(student.date_of_birth)}
                      </div>
                    </div>
                  </td>
                  <td>{student.user?.email}</td>
                  <td>{student.phone || 'N/A'}</td>
                  <td>{formatDate(student.enrollment_date)}</td>
                  <td>
                    <span className="badge badge-success">
                      Active
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem' }}
                        onClick={() => handleViewStudent(student)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.5rem' }}
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                    {searchTerm ? 'No students found matching your search' : 'No students found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Student Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
          title={selectedStudent ? 'Student Details' : 'Add New Student'}
          size="lg"
        >
          {selectedStudent ? (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    value={selectedStudent.student_id}
                    readOnly
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={selectedStudent.user?.full_name}
                    readOnly
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedStudent.user?.email}
                    readOnly
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={selectedStudent.phone || 'N/A'}
                    readOnly
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="text"
                    value={formatDate(selectedStudent.date_of_birth)}
                    readOnly
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
                <div className="form-group">
                  <label>Enrollment Date</label>
                  <input
                    type="text"
                    value={formatDate(selectedStudent.enrollment_date)}
                    readOnly
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={selectedStudent.address || 'N/A'}
                  readOnly
                  rows="3"
                  style={{ backgroundColor: '#f8fafc' }}
                />
              </div>
            </div>
          ) : (
            <div>
              <p>Add new student form would go here...</p>
              {/* Add student form implementation */}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedStudent(null);
              }}
            >
              Close
            </button>
            {!selectedStudent && (
              <button className="btn btn-success">
                Save Student
              </button>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Students;