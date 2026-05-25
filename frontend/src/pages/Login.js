import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn  } from 'react-icons/fi';
import logo from '../assests/logo-img.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card">
          <div className="auth-header">
            
           <img src={logo} alt="Logo" style={{ height: '50px', marginstart:"10px"}} ></img>
            <h2>Welcome Back</h2>
            <p>Login to Universal CodeBox Portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <FiMail style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              ) : (
                <>
                  <FiLogIn /> Login
                </>
              )}
            </motion.button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Register here</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;