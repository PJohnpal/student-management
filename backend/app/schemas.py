from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Student Schemas
class StudentBase(BaseModel):
    student_id: str
    date_of_birth: date
    address: Optional[str] = None
    phone: Optional[str] = None
    enrollment_date: date

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

# Teacher Schemas
class TeacherBase(BaseModel):
    teacher_id: str
    department: str
    hire_date: date
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

# Course Schemas
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
    teacher: TeacherResponse

    class Config:
        from_attributes = True

# Enrollment Schemas
class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int
    status: str = "active"

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentResponse(EnrollmentBase):
    id: int
    enrollment_date: date
    student: StudentResponse
    course: CourseResponse

    class Config:
        from_attributes = True

# Grade Schemas
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

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None

# Dashboard Stats
class DashboardStats(BaseModel):
    total_students: int
    total_teachers: int
    total_courses: int
    recent_enrollments: List[EnrollmentResponse]