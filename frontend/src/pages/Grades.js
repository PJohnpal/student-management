import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gradesAPI, studentsAPI, coursesAPI } from '../services/api';
import { Award, Plus } from 'lucide-react';

const Grades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'student') {
          const response = await gradesAPI.getMyGrades();
          setGrades(response.data);
        } else {
          const [gradesResponse, studentsResponse, coursesResponse] = await Promise.all([
            gradesAPI.getMyGrades(),
            studentsAPI.getStudents(),
            coursesAPI.getCourses()
          ]);
          setGrades(gradesResponse.data);
          setStudents(studentsResponse.data);
          setCourses(coursesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching grades data:', error);
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
      <div style={{ padding: '2rem 0' }}>
        <div className="card-header">
          <h1>
            <Award size={24} style={{ marginRight: '0.5rem' }} />
            {user?.role === 'student' ? 'My Grades' : 'Grades Management'}
          </h1>
          {user?.role !== 'student' && (
            <button className="btn btn-success">
              <Plus size={18} />
              Add Grade
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {user?.role !== 'student' && <th>Student</th>}
                <th>Course</th>
                <th>Grade</th>
                <th>Semester</th>
                <th>Academic Year</th>
                {user?.role !== 'student' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  {user?.role !== 'student' && <td>{grade.student.user.full_name}</td>}
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
                  {user?.role !== 'student' && (
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
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Grades;