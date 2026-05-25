import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // ✅ Add this
import { motion } from 'framer-motion';
import { FiSearch, FiBell, FiSettings, FiMenu, FiX } from 'react-icons/fi';

const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ Add this
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMenuToggle) onMenuToggle(!isMobileMenuOpen);
  };

  // ✅ Determine base path by role
  const base = user?.role === 'teacher' ? '/teacher' : '/student';

  return (
    <motion.div
      className="navbar"
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      {isMobile && (
        <button
          className="navbar-mobile-menu-btn"
          onClick={handleMenuToggle}
          style={{
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: '10px', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer',
            transition: 'all 0.3s ease', fontSize: '1.2rem'
          }}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      )}

      <div className="navbar-search">
        <FiSearch />
        <input type="text" placeholder="Search anything..." />
      </div>

      <div className="navbar-actions">

        {/* ✅ Bell — navigates to notifications */}
        <div
          className="navbar-notification"
          onClick={() => navigate(`${base}/notifications`)}
          style={{ cursor: 'pointer' }}
          title="Notifications"
        >
          <FiBell />
          <span className="badge">3</span>
        </div>

        {/* ✅ Settings — navigates to settings */}
        <div
          className="navbar-notification"
          onClick={() => navigate(`${base}/settings`)}
          style={{ cursor: 'pointer' }}
          title="Settings"
        >
          <FiSettings />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 15px', background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '12px', border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--gradient-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '0.85rem'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{user?.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;