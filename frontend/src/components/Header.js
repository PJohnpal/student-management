import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Users,
  GraduationCap,
  BookMarked,
  ClipboardList,
  Award
} from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard', roles: ['admin', 'teacher', 'student'] },
    { path: '/students', icon: Users, label: 'Students', roles: ['admin', 'teacher'] },
    { path: '/teachers', icon: GraduationCap, label: 'Teachers', roles: ['admin'] },
    { path: '/courses', icon: BookMarked, label: 'Courses', roles: ['admin', 'teacher', 'student'] },
    { path: '/enrollments', icon: ClipboardList, label: 'Enrollments', roles: ['admin', 'teacher'] },
    { path: '/grades', icon: Award, label: 'Grades', roles: ['admin', 'teacher', 'student'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="logo">
            <BookOpen size={24} />
            <span>Student Management</span>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={isActive(item.path) ? 'active' : ''}
                  style={{
                    background: isActive(item.path) ? 'rgba(255, 255, 255, 0.3)' : 'transparent'
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="nav-links">
            <div className="user-info">
              <User size={16} />
              <span>{user?.full_name}</span>
              <span className="role-badge">{user?.role}</span>
            </div>
            
            <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <User size={16} />
              Profile
            </Link>
            
            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-nav">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="mobile-user-info">
              <div className="user-details">
                <User size={16} />
                <span>{user?.full_name}</span>
                <span className="role-badge">{user?.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-danger btn-block"
                style={{ marginTop: '1rem' }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .desktop-nav {
          display: flex;
          gap: 0.5rem;
        }

        .mobile-nav {
          display: none;
          flex-direction: column;
          background: white;
          border-radius: 8px;
          margin-top: 1rem;
          padding: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #374151;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .mobile-nav-item:hover,
        .mobile-nav-item.active {
          background: #667eea;
          color: white;
        }

        .mobile-user-info {
          padding: 1rem 0;
          border-top: 1px solid #e5e7eb;
          margin-top: 1rem;
        }

        .user-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
        }

        .role-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-nav {
            display: flex;
          }

          .mobile-menu-btn {
            display: block;
          }

          .user-info span:not(.role-badge) {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .nav-links .btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;