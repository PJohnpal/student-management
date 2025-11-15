import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { UserPlus, BookOpen, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    
    // Student fields
    student_id: '',
    date_of_birth: '',
    enrollment_date: '',
    address: '',
    phone: '',
    
    // Teacher fields
    teacher_id: '',
    department: '',
    hire_date: '',
    specialization: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, role, ...submitData } = formData;
      
      let response;
      if (role === 'student') {
        response = await authAPI.registerStudent(submitData);
      } else {
        response = await authAPI.registerTeacher(submitData);
      }
      
      setSuccess('Registration successful! You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = formData.role === 'student';

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="text-center mb-8">
          <BookOpen size={48} color="#667eea" />
          <h2>Create Account</h2>
          <p className="text-gray-600 mt-2">Join the student management system</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {isStudent ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="student_id">Student ID</label>
                  <input
                    type="text"
                    id="student_id"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    required
                    placeholder="Enter student ID"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="enrollment_date">Enrollment Date</label>
                  <input
                    type="date"
                    id="enrollment_date"
                    name="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                  disabled={loading}
                ></textarea>
              </div>
            </>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher_id">Teacher ID</label>
                <input
                  type="text"
                  id="teacher_id"
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleChange}
                  required
                  placeholder="Enter teacher ID"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  placeholder="Enter department"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hire_date">Hire Date</label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Enter specialization"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        <style jsx>{`
          .text-center {
            text-align: center;
          }
          
          .mb-8 {
            margin-bottom: 2rem;
          }
          
          .mt-2 {
            margin-top: 0.5rem;
          }
          
          .mt-6 {
            margin-top: 1.5rem;
          }
          
          .text-gray-600 {
            color: #6b7280;
          }
          
          .text-primary-600 {
            color: #667eea;
          }
          
          .hover\:text-primary-700:hover {
            color: #5a67d8;
          }
          
          .font-medium {
            font-weight: 500;
          }
          
          .password-input-container {
            position: relative;
          }
          
          .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 4px;
          }
          
          .password-toggle:hover {
            color: #374151;
          }
          
          textarea {
            resize: vertical;
            min-height: 80px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Register;