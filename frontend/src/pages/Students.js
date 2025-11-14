import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { Users, Plus } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentsAPI.getStudents();
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
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
          <button className="btn btn-success">
            <Plus size={18} />
            Add Student
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Enrollment Date</th>
                <th>Date of Birth</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.student_id}</td>
                  <td>{student.user.full_name}</td>
                  <td>{student.user.email}</td>
                  <td>{new Date(student.enrollment_date).toLocaleDateString()}</td>
                  <td>{new Date(student.date_of_birth).toLocaleDateString()}</td>
                  <td>{student.phone || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                        Edit
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.5rem' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;