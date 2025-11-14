-- Create database
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- Create user for the application
CREATE USER IF NOT EXISTS 'student_user'@'%' IDENTIFIED BY 'student_password';
GRANT ALL PRIVILEGES ON student_management.* TO 'student_user'@'%';
FLUSH PRIVILEGES;