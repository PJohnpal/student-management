from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from datetime import datetime, timedelta
from typing import List, Optional
import os

from . import schemas, auth
from .database import supabase

app = FastAPI(
    title="Student Management System API",
    description="A comprehensive student management system with FastAPI and Supabase",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Dependency to get current user
def get_current_user(token: str = Depends(security)):
    user_id = auth.verify_token(token.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    # Get user from database
    user_result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_result.data[0]

# Health check
@app.get("/")
def read_root():
    return {
        "message": "Student Management System API",
        "version": "2.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if supabase else "disconnected"
    }

# Auth routes
@app.post("/register/student", response_model=schemas.StudentResponse)
def register_student(student: schemas.StudentCreate):
    try:
        # Check if user exists
        existing_user = supabase.table("users").select("*").eq("email", student.email).execute()
        if existing_user.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create user
        user_data = {
            "email": student.email,
            "password": auth.get_password_hash(student.password),
            "full_name": student.full_name,
            "role": "student",
            "created_at": datetime.utcnow().isoformat()
        }
        user_result = supabase.table("users").insert(user_data).execute()
        user_id = user_result.data[0]["id"]

        # Create student
        student_data = {
            "user_id": user_id,
            "student_id": student.student_id,
            "date_of_birth": student.date_of_birth,
            "address": student.address,
            "phone": student.phone,
            "enrollment_date": student.enrollment_date
        }
        student_result = supabase.table("students").insert(student_data).execute()
        
        return {**student_result.data[0], "user": user_result.data[0]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register/teacher", response_model=schemas.TeacherResponse)
def register_teacher(teacher: schemas.TeacherCreate):
    try:
        # Check if user exists
        existing_user = supabase.table("users").select("*").eq("email", teacher.email).execute()
        if existing_user.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create user
        user_data = {
            "email": teacher.email,
            "password": auth.get_password_hash(teacher.password),
            "full_name": teacher.full_name,
            "role": "teacher",
            "created_at": datetime.utcnow().isoformat()
        }
        user_result = supabase.table("users").insert(user_data).execute()
        user_id = user_result.data[0]["id"]

        # Create teacher
        teacher_data = {
            "user_id": user_id,
            "teacher_id": teacher.teacher_id,
            "department": teacher.department,
            "hire_date": teacher.hire_date,
            "specialization": teacher.specialization
        }
        teacher_result = supabase.table("teachers").insert(teacher_data).execute()
        
        return {**teacher_result.data[0], "user": user_result.data[0]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest):
    try:
        # Find user
        user_result = supabase.table("users").select("*").eq("email", credentials.email).execute()
        if not user_result.data:
            raise HTTPException(status_code=400, detail="Invalid credentials")
        
        user = user_result.data[0]
        
        # Verify password
        if not auth.verify_password(credentials.password, user["password"]):
            raise HTTPException(status_code=400, detail="Invalid credentials")
        
        # Create token
        access_token = auth.create_access_token(
            data={"sub": str(user["id"])},
            expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Student routes
@app.get("/students", response_model=List[schemas.StudentResponse])
def get_students(skip: int = 0, limit: int = 100):
    try:
        result = supabase.table("students").select("*, user:users(*)").range(skip, skip + limit).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: int):
    try:
        result = supabase.table("students").select("*, user:users(*)").eq("id", student_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Student not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Course routes
@app.get("/courses", response_model=List[schemas.CourseResponse])
def get_courses(skip: int = 0, limit: int = 100):
    try:
        result = supabase.table("courses").select("*, teacher:teachers(*)").range(skip, skip + limit).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/courses", response_model=schemas.CourseResponse)
def create_course(course: schemas.CourseCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        result = supabase.table("courses").insert(course.dict()).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dashboard routes
@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Get counts
        students_count = supabase.table("students").select("id", count="exact").execute()
        teachers_count = supabase.table("teachers").select("id", count="exact").execute()
        courses_count = supabase.table("courses").select("id", count="exact").execute()
        enrollments_count = supabase.table("enrollments").select("id", count="exact").execute()

        # Get recent activity (last 5 enrollments)
        recent_activity = supabase.table("enrollments").select("*, student:students(*, user:users(*)), course:courses(*)").order("enrollment_date", desc=True).limit(5).execute()

        return {
            "total_students": students_count.count or 0,
            "total_teachers": teachers_count.count or 0,
            "total_courses": courses_count.count or 0,
            "total_enrollments": enrollments_count.count or 0,
            "recent_activity": recent_activity.data or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enrollment routes
@app.post("/enrollments", response_model=schemas.EnrollmentResponse)
def create_enrollment(enrollment: schemas.EnrollmentCreate, current_user: dict = Depends(get_current_user)):
    try:
        enrollment_data = enrollment.dict()
        enrollment_data["enrollment_date"] = datetime.utcnow().isoformat()
        
        result = supabase.table("enrollments").insert(enrollment_data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Grade routes
@app.post("/grades", response_model=schemas.GradeResponse)
def create_grade(grade: schemas.GradeCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        result = supabase.table("grades").insert(grade.dict()).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)