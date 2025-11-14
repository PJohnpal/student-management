from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

from . import models, schemas, crud, auth
from .database import SessionLocal, engine, get_db
from .config import settings

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Management System API",
    description="A comprehensive student management system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Dependency to get current user
def get_current_user(token: str = Depends(security), db: Session = Depends(get_db)):
    user_id = auth.verify_token(token.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    user = crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Auth routes
@app.post("/register/student", response_model=schemas.StudentResponse)
def register_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = crud.get_user_by_email(db, email=student.email)
    if db_student:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_student(db=db, student=student)

@app.post("/register/teacher", response_model=schemas.TeacherResponse)
def register_teacher(teacher: schemas.TeacherCreate, db: Session = Depends(get_db)):
    db_teacher = crud.get_user_by_email(db, email=teacher.email)
    if db_teacher:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_teacher(db=db, teacher=teacher)

@app.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user_data.email)
    if not db_user or not auth.verify_password(user_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = auth.create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

# Student routes
@app.get("/students", response_model=List[schemas.StudentResponse])
def read_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [schemas.UserRole.ADMIN, schemas.UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    students = crud.get_students(db, skip=skip, limit=limit)
    return students

@app.get("/students/me", response_model=schemas.StudentResponse)
def read_student_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    student = crud.get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# Teacher routes
@app.get("/teachers", response_model=List[schemas.TeacherResponse])
def read_teachers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    teachers = crud.get_teachers(db, skip=skip, limit=limit)
    return teachers

# Course routes
@app.get("/courses", response_model=List[schemas.CourseResponse])
def read_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    courses = crud.get_courses(db, skip=skip, limit=limit)
    return courses

@app.post("/courses", response_model=schemas.CourseResponse)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [schemas.UserRole.ADMIN, schemas.UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_course(db=db, course=course)

# Enrollment routes
@app.post("/enrollments", response_model=schemas.EnrollmentResponse)
def create_enrollment(
    enrollment: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_enrollment(db=db, enrollment=enrollment)

@app.get("/enrollments/me", response_model=List[schemas.EnrollmentResponse])
def read_enrollments_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    student = crud.get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return crud.get_student_enrollments(db, student.id)

# Grade routes
@app.post("/grades", response_model=schemas.GradeResponse)
def create_grade(
    grade: schemas.GradeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [schemas.UserRole.ADMIN, schemas.UserRole.TEACHER]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.create_grade(db=db, grade=grade)

@app.get("/grades/me", response_model=List[schemas.GradeResponse])
def read_grades_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    student = crud.get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return crud.get_student_grades(db, student.id)

# Dashboard routes
@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.get_dashboard_stats(db)

@app.get("/")
def read_root():
    return {"message": "Student Management System API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)