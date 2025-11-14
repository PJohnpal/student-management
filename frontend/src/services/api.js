import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  registerStudent: (studentData) => api.post('/register/student', studentData),
  registerTeacher: (teacherData) => api.post('/register/teacher', teacherData),
};

export const studentsAPI = {
  getStudents: () => api.get('/students'),
  getStudentMe: () => api.get('/students/me'),
};

export const teachersAPI = {
  getTeachers: () => api.get('/teachers'),
};

export const coursesAPI = {
  getCourses: () => api.get('/courses'),
  createCourse: (courseData) => api.post('/courses', courseData),
};

export const enrollmentsAPI = {
  createEnrollment: (enrollmentData) => api.post('/enrollments', enrollmentData),
  getMyEnrollments: () => api.get('/enrollments/me'),
};

export const gradesAPI = {
  createGrade: (gradeData) => api.post('/grades', gradeData),
  getMyGrades: () => api.get('/grades/me'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;