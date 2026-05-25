import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBell,
  FiLock,
  FiMoon,
  FiSettings,
  FiSun,
  FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={checked}
    onClick={() => onChange(!checked)}
    style={{
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      background: checked ? '#667eea' : 'rgba(120,120,140,0.28)',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.3s',
      flexShrink: 0,
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: '3px',
        left: checked ? '23px' : '3px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.3s',
      }}
    />
  </button>
);

const Section = ({ icon, title, children }) => (
  <motion.section
    className="card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ marginBottom: '20px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <span style={{ color: '#667eea', fontSize: '1.1rem' }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
    </div>
    {children}
  </motion.section>
);

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications
      ? JSON.parse(savedNotifications)
      : {
          assignments: true,
          exams: true,
          grades: true,
          announcements: false,
        };
  });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        bio: profile.bio.trim(),
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await axios.post(`${API}/auth/change-password`, {
        currentPassword,
        newPassword,
      });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1><FiSettings /> Settings</h1>
            <p>Manage your account preferences</p>
          </motion.div>

          <Section icon={<FiUser />} title="Profile Information">
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={profile.email} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </Section>

          <Section icon={<FiLock />} title="Change Password">
            <form onSubmit={handlePasswordSave}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </Section>

          <Section icon={<FiBell />} title="Notification Preferences">
            {Object.entries(notifications).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>
                  {key} notifications
                </span>
                <Toggle
                  label={`${key} notifications`}
                  checked={value}
                  onChange={(nextValue) => setNotifications({ ...notifications, [key]: nextValue })}
                />
              </div>
            ))}
          </Section>

          <Section icon={darkMode ? <FiMoon /> : <FiSun />} title="Appearance">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
              <Toggle label="Dark mode" checked={darkMode} onChange={setDarkMode} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
