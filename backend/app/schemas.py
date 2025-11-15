from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.STUDENT

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    student_id: str
    date_of_birth: str
    address: Optional[str] = None
    phone: Optional[str] = None
    enrollment_date: str

class StudentCreate(StudentBase):
    email: EmailStr
    full_name: str
    password: str

class StudentResponse(StudentBase):
    id: int
    user_id: int
    user: UserResponse

    class Config:
        from_attributes = True

class TeacherBase(BaseModel):
    teacher_id: str
    department: str
    hire_date: str
    specialization: Optional[str] = None

class TeacherCreate(TeacherBase):
    email: EmailStr
    full_name: str
    password: str

class TeacherResponse(TeacherBase):
    id: int
    user_id: int
    user: UserResponse

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    course_code: str
    course_name: str
    description: Optional[str] = None
    credits: int

class CourseCreate(CourseBase):
    teacher_id: int

class CourseResponse(CourseBase):
    id: int
    teacher_id: int

    class Config:
        from_attributes = True

class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int
    status: str = "active"

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentResponse(EnrollmentBase):
    id: int
    enrollment_date: datetime
    student: StudentResponse
    course: CourseResponse

    class Config:
        from_attributes = True

class GradeBase(BaseModel):
    student_id: int
    course_id: int
    grade: float
    semester: str
    academic_year: str

class GradeCreate(GradeBase):
    pass

class GradeResponse(GradeBase):
    id: int
    student: StudentResponse
    course: CourseResponse

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class DashboardStats(BaseModel):
    total_students: int
    total_teachers: int
    total_courses: int
    total_enrollments: int
    recent_activity: List[dict]