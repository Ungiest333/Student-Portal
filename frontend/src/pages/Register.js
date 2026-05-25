import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../assests/logo-img.png';
import { FiUser, FiMail, FiLock, FiPhone, FiBookOpen, FiHash,  FiUserPlus } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', phone: '', course: '', batch: '', enrollmentNo: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const user = await register(formData);
      toast.success(`Welcome, ${user.name}!`);
      navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        style={{ maxWidth: '520px' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card">
          <div className="auth-header">
<img src={logo} alt="Logo" style={{ height: '50px', marginstart:"10px"}} />     
       <h2>Create Account</h2>
            <p>Join Universal CodeBox Portal</p>
          </div>

          <div className="role-selector">
            <motion.div
              className={`role-option ${formData.role === 'student' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'student' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="role-icon">🎓</div>
              <div className="role-label">Student</div>
            </motion.div>
            <motion.div
              className={`role-option ${formData.role === 'teacher' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'teacher' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="role-icon">👨‍🏫</div>
              <div className="role-label">Teacher</div>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label"><FiUser size={12} /> Full Name</label>
                <input type="text" name="name" className="form-input" placeholder="Your name"
                  value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label"><FiMail size={12} /> Email</label>
                <input type="email" name="email" className="form-input" placeholder="Email"
                  value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label"><FiLock size={12} /> Password</label>
                <input type="password" name="password" className="form-input" placeholder="Password"
                  value={formData.password} onChange={handleChange} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label"><FiLock size={12} /> Confirm Password</label>
                <input type="password" name="confirmPassword" className="form-input" placeholder="Confirm"
                  value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label"><FiPhone size={12} /> Phone</label>
                <input type="tel" name="phone" className="form-input" placeholder="Phone number"
                  value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label"><FiBookOpen size={12} /> Course</label>
                <select name="course" className="form-select" value={formData.course} onChange={handleChange}>
                  <option value="">Select Course</option>
                  <option value="Web Development">Web Development</option>
                  <option value="App Development">App Development</option>
                  <option value="Python Programming">Python Programming</option>
                  <option value="Java Programming">Java Programming</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label"><FiHash size={12} /> Batch</label>
                <input type="text" name="batch" className="form-input" placeholder="e.g., Batch-2024"
                  value={formData.batch} onChange={handleChange} />
              </div>
              {formData.role === 'student' && (
                <div className="form-group">
                  <label className="form-label"><FiHash size={12} /> Enrollment No</label>
                  <input type="text" name="enrollmentNo" className="form-input" placeholder="UCB-001"
                    value={formData.enrollmentNo} onChange={handleChange} />
                </div>
              )}
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
                <><FiUserPlus /> Create Account</>
              )}
            </motion.button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;