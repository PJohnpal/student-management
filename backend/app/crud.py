from sqlalchemy.orm import Session
from . import models, schemas, auth
from typing import List, Optional

# User CRUD
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# Student CRUD
def create_student(db: Session, student: schemas.StudentCreate):
    # Create user first
    user_data = schemas.UserCreate(
        email=student.email,
        full_name=student.full_name,
        password=student.password,
        role=schemas.UserRole.STUDENT
    )
    db_user = create_user(db, user_data)
    
    # Create student
    db_student = models.Student(
        user_id=db_user.id,
        student_id=student.student_id,
        date_of_birth=student.date_of_birth,
        address=student.address,
        phone=student.phone,
        enrollment_date=student.enrollment_date
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()

def get_student(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_user_id(db: Session, user_id: int):
    return db.query(models.Student).filter(models.Student.user_id == user_id).first()

# Teacher CRUD
def create_teacher(db: Session, teacher: schemas.TeacherCreate):
    # Create user first
    user_data = schemas.UserCreate(
        email=teacher.email,
        full_name=teacher.full_name,
        password=teacher.password,
        role=schemas.UserRole.TEACHER
    )
    db_user = create_user(db, user_data)
    
    # Create teacher
    db_teacher = models.Teacher(
        user_id=db_user.id,
        teacher_id=teacher.teacher_id,
        department=teacher.department,
        hire_date=teacher.hire_date,
        specialization=teacher.specialization
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def get_teachers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Teacher).offset(skip).limit(limit).all()

def get_teacher(db: Session, teacher_id: int):
    return db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()

# Course CRUD
def create_course(db: Session, course: schemas.CourseCreate):
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Course).offset(skip).limit(limit).all()

def get_course(db: Session, course_id: int):
    return db.query(models.Course).filter(models.Course.id == course_id).first()

# Enrollment CRUD
def create_enrollment(db: Session, enrollment: schemas.EnrollmentCreate):
    db_enrollment = models.Enrollment(**enrollment.dict())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

def get_enrollments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Enrollment).offset(skip).limit(limit).all()

def get_student_enrollments(db: Session, student_id: int):
    return db.query(models.Enrollment).filter(models.Enrollment.student_id == student_id).all()

# Grade CRUD
def create_grade(db: Session, grade: schemas.GradeCreate):
    db_grade = models.Grade(**grade.dict())
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade

def get_grades(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Grade).offset(skip).limit(limit).all()

def get_student_grades(db: Session, student_id: int):
    return db.query(models.Grade).filter(models.Grade.student_id == student_id).all()

# Dashboard Stats
def get_dashboard_stats(db: Session):
    total_students = db.query(models.Student).count()
    total_teachers = db.query(models.Teacher).count()
    total_courses = db.query(models.Course).count()
    recent_enrollments = db.query(models.Enrollment).order_by(models.Enrollment.enrollment_date.desc()).limit(5).all()
    
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_courses": total_courses,
        "recent_enrollments": recent_enrollments
    }