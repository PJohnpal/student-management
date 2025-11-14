import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, enrollmentsAPI, gradesAPI } from '../services/api';
import { Users, BookOpen, Award, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'admin') {
          const statsResponse = await dashboardAPI.getStats();
          setStats(statsResponse.data);
        }
        
        if (user?.role === 'student') {
          const [enrollmentsResponse, gradesResponse] = await Promise.all([
            enrollmentsAPI.getMyEnrollments(),
            gradesAPI.getMyGrades()
          ]);
          setEnrollments(enrollmentsResponse.data);
          setGrades(gradesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
      <div className="dashboard">
        <h1>Dashboard</h1>
        
        {user?.role === 'admin' && stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <Users size={32} color="#667eea" />
                <h3>{stats.total_students}</h3>
                <p>Total Students</p>
              </div>
              <div className="stat-card">
                <Award size={32} color="#10b981" />
                <h3>{stats.total_teachers}</h3>
                <p>Total Teachers</p>
              </div>
              <div className="stat-card">
                <BookOpen size={32} color="#f59e0b" />
                <h3>{stats.total_courses}</h3>
                <p>Total Courses</p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Recent Enrollments</h2>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Enrollment Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_enrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>{enrollment.student.user.full_name}</td>
                        <td>{enrollment.course.course_name}</td>
                        <td>{new Date(enrollment.enrollment_date).toLocaleDateString()}</td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            backgroundColor: enrollment.status === 'active' ? '#d1fae5' : '#f3f4f6',
                            color: enrollment.status === 'active' ? '#059669' : '#6b7280'
                          }}>
                            {enrollment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {user?.role === 'student' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <BookOpen size={32} color="#667eea" />
                <h3>{enrollments.length}</h3>
                <p>Enrolled Courses</p>
              </div>
              <div className="stat-card">
                <Award size={32} color="#10b981" />
                <h3>{grades.length}</h3>
                <p>Grades Received</p>
              </div>
              <div className="stat-card">
                <Calendar size={32} color="#f59e0b" />
                <h3>
                  {grades.length > 0 
                    ? (grades.reduce((acc, grade) => acc + grade.grade, 0) / grades.length).toFixed(2)
                    : '0.00'
                  }
                </h3>
                <p>Average Grade</p>
              </div>
            </div>

            <div className="form-row">
              <div className="card" style={{ flex: 1 }}>
                <div className="card-header">
                  <h2>My Courses</h2>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Enrollment Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td>{enrollment.course.course_code}</td>
                          <td>{enrollment.course.course_name}</td>
                          <td>{enrollment.course.credits}</td>
                          <td>{new Date(enrollment.enrollment_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card" style={{ flex: 1 }}>
                <div className="card-header">
                  <h2>My Grades</h2>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Grade</th>
                        <th>Semester</th>
                        <th>Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade.id}>
                          <td>{grade.course.course_name}</td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              backgroundColor: grade.grade >= 3.0 ? '#d1fae5' : '#fee2e2',
                              color: grade.grade >= 3.0 ? '#059669' : '#dc2626'
                            }}>
                              {grade.grade}
                            </span>
                          </td>
                          <td>{grade.semester}</td>
                          <td>{grade.academic_year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;