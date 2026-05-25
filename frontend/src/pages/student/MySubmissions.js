import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import { FiFile, FiLink, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const API = 'http://localhost:5000/api';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data } = await axios.get(`${API}/submissions/my`);
      setSubmissions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = {
    submitted: <FiClock color="#ed8936" />,
    graded: <FiCheckCircle color="#48bb78" />,
    resubmit: <FiAlertCircle color="#fc8181" />
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>📦 My Submissions</h1>
          <p>Track all your assignment submissions</p>
        </motion.div>

        <div className="content-grid-3">
          {submissions.map((sub, i) => (
            <motion.div
              key={sub._id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-primary">{sub.assignment?.subject || 'N/A'}</span>
                <span className={`badge badge-${sub.status === 'graded' ? 'success' : sub.status === 'resubmit' ? 'danger' : 'warning'}`}>
                  {statusIcon[sub.status]} {sub.status}
                </span>
              </div>

              <h4 style={{ marginBottom: '8px', fontFamily: 'Poppins' }}>
                {sub.assignment?.title || 'Assignment'}
              </h4>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
                Submitted: {new Date(sub.submittedAt).toLocaleString()}
              </p>

              {sub.files?.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Files:</p>
                  {sub.files.map((file, fi) => (
                    <div key={fi} className="file-item" style={{ marginBottom: '4px', padding: '6px 10px' }}>
                      <div className="file-info">
                        <FiFile size={14} className="file-icon" />
                        <span style={{ fontSize: '0.8rem' }}>{file.filename}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sub.urls?.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>URLs:</p>
                  {sub.urls.map((url, ui) => (
                    <div key={ui} className="url-item" style={{ padding: '6px 10px' }}>
                      <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem' }}>
                        <FiLink size={12} /> {url.substring(0, 40)}...
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {sub.status === 'graded' && (
                <div style={{
                  padding: '12px', background: 'rgba(72, 187, 120, 0.1)',
                  borderRadius: '10px', marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                      Marks: {sub.marks}/{sub.assignment?.totalMarks}
                    </span>
                  </div>
                  {sub.feedback && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      Feedback: {sub.feedback}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Submissions Yet</h3>
              <p>Submit your first assignment to see it here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubmissions;