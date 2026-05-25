import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiHome, FiUpload, FiFileText, FiAward, FiUsers,
  FiPlusCircle, FiEye, FiStar, FiLogOut, FiBookOpen, FiList
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isTeacher } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const studentLinks = [
    { path: '/student/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/student/assignments', icon: <FiUpload />, label: 'Assignments' },
    { path: '/student/submissions', icon: <FiList />, label: 'My Submissions' },
    { path: '/student/exams', icon: <FiFileText />, label: 'Exams' },
    { path: '/student/marks', icon: <FiAward />, label: 'My Marks' },
  ];

  const teacherLinks = [
    { path: '/teacher/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/teacher/create-assignment', icon: <FiPlusCircle />, label: 'Create Assignment' },
    { path: '/teacher/submissions', icon: <FiEye />, label: 'View Submissions' },
    { path: '/teacher/create-exam', icon: <FiBookOpen />, label: 'Create Exam' },
    { path: '/teacher/exams', icon: <FiList />, label: 'View Exams' },
    { path: '/teacher/grade', icon: <FiStar />, label: 'Grade Students' },
    { path: '/teacher/students', icon: <FiUsers />, label: 'Manage Students' },
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}
      <motion.div
        className={`sidebar ${isOpen && isMobile ? 'open' : ''}`}
        initial={isMobile ? { x: -280 } : { x: 0 }}
        animate={isMobile && isOpen ? { x: 0 } : isMobile ? { x: -280 } : { x: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
          
          </div>
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <h4>{user?.name}</h4>
              <span>{user?.role}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-title">Navigation</div>
          {links.map((link, index) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={link.path}
                onClick={handleLinkClick}
                className={`sidebar-nav-item ${location.pathname === link.path ? 'active' : ''}`}
              >
                <span className="icon">{link.icon}</span>
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-logout">
          <button className="sidebar-nav-item" onClick={handleLogout}>
            <span className="icon"><FiLogOut /></span>
            Logout
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
