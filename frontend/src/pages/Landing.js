import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import'./Landing.css';
import {
  FiBookOpen, FiFileText, FiAward, FiUsers,
  FiUpload, FiCheckCircle, FiArrowRight, FiMoon, FiSun,
} from 'react-icons/fi';
import logo from '../assests/logo-img.png';

const Landing = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const features = [
    {
      icon: <FiBookOpen />,
      title: 'Assignment Management',
      desc: 'Submit assignments with photos, PDFs, and URLs. Teachers can review and grade seamlessly.'
    },
    {
      icon: <FiFileText />,
      title: 'MCQ Based Exams',
      desc: 'Take timed MCQ exams online. Teachers can create exams with PDF uploads and auto-grading.'
    },
    {
      icon: <FiAward />,
      title: 'Marks & Grading',
      desc: 'View your marks, grades, and performance analytics. Teachers can grade individually.'
    },
    {
      icon: <FiUsers />,
      title: 'Student Management',
      desc: 'Teachers can manage students, track progress, and monitor assignment submissions.'
    },
    {
      icon: <FiUpload />,
      title: 'Multi-format Upload',
      desc: 'Upload images, PDFs, documents, and share URLs for assignment submissions.'
    },
    {
      icon: <FiCheckCircle />,
      title: 'Real-time Dashboard',
      desc: 'Interactive dashboard with charts, statistics, and real-time performance tracking.'
    }
  ];

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${10 + Math.random() * 20}s`,
    size: `${2 + Math.random() * 4}px`
  }));

  return (
    <div className="landing-page">
      {/* Particles */}
      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size
            }}
          />
        ))}
      </div>

      {/* Nav */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
       <div className="landing-logo">
  <img src={logo} alt="Logo" className="main-logo" />
</div>
        <div className="landing-nav-links">
          <button
            type="button"
            className="landing-theme-toggle"
            onClick={() => setDarkMode((current) => !current)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
            {/* <span>{darkMode ? 'Light' : 'Dark'}</span> */}
          </button>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ⚡ Welcome to Universal CodeBox Portal
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Learn, Submit &<br />
            <span className="gradient-text">Excel Together</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            A comprehensive student-teacher portal for managing assignments,
            conducting exams, tracking grades, and building your coding career
            at Universal CodeBox Institute.
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Learning <FiArrowRight />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Teacher Login
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-title">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Powerful <span className="gradient-text">Features</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Everything you need for a complete learning experience
          </motion.p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 0 40px rgba(102, 126, 234, 0.3)' }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '40px 20px',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        <p>© 2023 Universal CodeBox. All rights reserved.</p>
        <p style={{ marginTop: '8px' }}>
          <a href="https://universalcodebox.com/" target="_blank" rel="noreferrer"
            style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            universalcodebox.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Landing;
