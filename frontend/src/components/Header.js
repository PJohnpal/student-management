import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, User, LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="logo">
            <BookOpen size={24} />
            <span>Student Management</span>
          </div>
          
          <div className="nav-links">
            {user && (
              <>
                <span>Welcome, {user.full_name}</span>
                <span>({user.role})</span>
                <Link to="/">
                  <button>Dashboard</button>
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link to="/students">
                      <button>Students</button>
                    </Link>
                    <Link to="/courses">
                      <button>Courses</button>
                    </Link>
                  </>
                )}
                <Link to="/grades">
                  <button>Grades</button>
                </Link>
                <button onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;