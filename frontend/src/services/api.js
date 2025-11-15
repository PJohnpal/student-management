import axios from 'axios';

// Use environment variable or fallback to local development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  registerStudent: (studentData) => api.post('/register/student', studentData),
  registerTeacher: (teacherData) => api.post('/register/teacher', teacherData),
};

// Students API
export const studentsAPI = {
  getStudents: (skip = 0, limit = 100) => api.get(`/students?skip=${skip}&limit=${limit}`),
  getStudent: (studentId) => api.get(`/students/${studentId}`),
};

// Teachers API
export const teachersAPI = {
  // Add teacher endpoints when available
};

// Courses API
export const coursesAPI = {
  getCourses: (skip = 0, limit = 100) => api.get(`/courses?skip=${skip}&limit=${limit}`),
  createCourse: (courseData) => api.post('/courses', courseData),
};

// Enrollments API
export const enrollmentsAPI = {
  createEnrollment: (enrollmentData) => api.post('/enrollments', enrollmentData),
};

// Grades API
export const gradesAPI = {
  createGrade: (gradeData) => api.post('/grades', gradeData),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;