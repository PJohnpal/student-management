import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, studentsAPI, coursesAPI } from '../services/api';
import { 
  Users, 
  BookOpen, 
  Award, 
  Calendar,
  TrendingUp,
  UserCheck,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (user?.role === 'admin') {
          const [statsResponse, studentsResponse, coursesResponse] = await Promise.all([
            dashboardAPI.getStats(),
            studentsAPI.getStudents(0, 5),
            coursesAPI.getCourses(0, 5)
          ]);
          setStats(statsResponse.data);
          setStudents(studentsResponse.data);
          setCourses(coursesResponse.data);
        } else {
          // For teachers and students, fetch basic data
          const [studentsResponse, coursesResponse] = await Promise.all([
            studentsAPI.getStudents(0, 5),
            coursesAPI.getCourses(0, 5)
          ]);
          setStudents(studentsResponse.data);
          setCourses(coursesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard">
        <div className="card-header">
          <h1>
            <BarChart3 size={24} style={{ marginRight: '0.5rem' }} />
            Dashboard
          </h1>
          <p style={{ color: '#64748b' }}>
            Welcome back, {user?.full_name}!
          </p>
        </div>

        {user?.role === 'admin' && stats && (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <Users size={32} color="#667eea" />
                <h3>{stats.total_students}</h3>
                <p>Total Students</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>
                  <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Active
                </div>
              </div>
              
              <div className="stat-card">
                <Award size={32} color="#10b981" />
                <h3>{stats.total_teachers}</h3>
                <p>Total Teachers</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>
                  <UserCheck size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Staff
                </div>
              </div>
              
              <div className="stat-card">
                <BookOpen size={32} color="#f59e0b" />
                <h3>{stats.total_courses}</h3>
                <p>Total Courses</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#f59e0b' }}>
                  Active Courses
                </div>
              </div>
              
              <div className="stat-card">
                <Calendar size={32} color="#ef4444" />
                <h3>{stats.total_enrollments}</h3>
                <p>Total Enrollments</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#ef4444' }}>
                  This Semester
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {stats.recent_activity && stats.recent_activity.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2>Recent Activity</h2>
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
                      {stats.recent_activity.map((activity) => (
                        <tr key={activity.id}>
                          <td>
                            {activity.student?.user?.full_name || 'Unknown Student'}
                          </td>
                          <td>
                            {activity.course?.course_name || 'Unknown Course'}
                          </td>
                          <td>
                            {formatDate(activity.enrollment_date)}
                          </td>
                          <td>
                            <span className={`badge badge-${activity.status === 'active' ? 'success' : 'warning'}`}>
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Recent Students */}
        <div className="form-row">
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h2>
                <Users size={20} style={{ marginRight: '0.5rem' }} />
                Recent Students
              </h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Enrollment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.student_id}</td>
                      <td>{student.user?.full_name}</td>
                      <td>{student.user?.email}</td>
                      <td>{formatDate(student.enrollment_date)}</td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Courses */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h2>
                <BookOpen size={20} style={{ marginRight: '0.5rem' }} />
                Recent Courses
              </h2>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.course_code}</td>
                      <td>{course.course_name}</td>
                      <td>{course.credits}</td>
                      <td>
                        {course.teacher?.user?.full_name || 'Unknown Teacher'}
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>
                        No courses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {user?.role === 'admin' && (
              <>
                <button className="btn btn-success">
                  <Users size={16} />
                  Add Student
                </button>
                <button className="btn btn-success">
                  <Award size={16} />
                  Add Teacher
                </button>
              </>
            )}
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <button className="btn btn-success">
                <BookOpen size={16} />
                Create Course
              </button>
            )}
            <button className="btn btn-secondary">
              <Calendar size={16} />
              View Calendar
            </button>
            <button className="btn btn-secondary">
              <BarChart3 size={16} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;