import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiEye, FiCheck, FiFile, FiLink, FiDownload } from 'react-icons/fi';
import { API_BASE_URL, buildAssetUrl } from '../../config';

const API = API_BASE_URL;

const ViewSubmissions = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await axios.get(`${API}/assignments`);
      setAssignments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const { data } = await axios.get(`${API}/submissions/assignment/${assignmentId}`);
      setSubmissions(data);
      setSelectedAssignment(assignments.find(a => a._id === assignmentId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleGrade = async (submissionId) => {
    try {
      await axios.put(`${API}/submissions/grade/${submissionId}`, gradeData);
      toast.success('Graded successfully!');
      setGrading(null);
      setGradeData({ marks: '', feedback: '' });
      if (selectedAssignment) fetchSubmissions(selectedAssignment._id);
    } catch (error) {
      toast.error('Failed to grade');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>👁️ View Submissions</h1>
          <p>Review and grade student submissions</p>
        </motion.div>

        {!selectedAssignment ? (
          <div className="content-grid-3">
            {assignments.map((assignment, i) => (
              <motion.div
                key={assignment._id} className="card" style={{ cursor: 'pointer' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => fetchSubmissions(assignment._id)}
                whileHover={{ scale: 1.02 }}
              >
                <span className="badge badge-primary" style={{ marginBottom: '12px', display: 'inline-block' }}>
                  {assignment.subject}
                </span>
                <h3 style={{ marginBottom: '8px', fontFamily: 'Poppins', fontSize: '1.05rem' }}>
                  {assignment.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
                <button className="btn btn-outline btn-block btn-sm">
                  <FiEye /> View Submissions
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <button className="btn btn-outline" style={{ marginBottom: '20px' }}
              onClick={() => { setSelectedAssignment(null); setSubmissions([]); }}>
              ← Back to Assignments
            </button>

            <h3 style={{ marginBottom: '15px', fontFamily: 'Poppins' }}>
              Submissions for: {selectedAssignment.title}
            </h3>

            <div className="content-grid-3">
              {submissions.map((sub, i) => (
                <motion.div
                  key={sub._id} className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'var(--gradient-primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem'
                      }}>
                        {sub.student?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.student?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sub.student?.enrollmentNo || sub.student?.email}
                        </div>
                      </div>
                    </div>
                    <span className={`badge badge-${sub.status === 'graded' ? 'success' : 'warning'}`}>
                      {sub.status}
                    </span>
                  </div>

                  {/* Files */}
                  {sub.files?.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      {sub.files.map((file, fi) => (
                        <a key={fi} href={buildAssetUrl(file.filepath)}
                          target="_blank" rel="noreferrer"
                          className="file-item" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
                          <div className="file-info">
                            <FiFile size={14} className="file-icon" />
                            <span style={{ fontSize: '0.8rem' }}>{file.filename}</span>
                          </div>
                          <FiDownload size={14} style={{ color: 'var(--primary)' }} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* URLs */}
                  {sub.urls?.length > 0 && sub.urls.map((url, ui) => (
                    <div key={ui} className="url-item" style={{ marginBottom: '4px' }}>
                      <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem' }}>
                        <FiLink size={12} /> {url.substring(0, 35)}...
                      </a>
                    </div>
                  ))}

                  {sub.text && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0',
                      padding: '8px', background: 'rgba(102,126,234,0.05)', borderRadius: '8px' }}>
                      {sub.text.substring(0, 100)}
                    </p>
                  )}

                  {sub.status === 'graded' ? (
                    <div style={{
                      padding: '10px', background: 'rgba(72, 187, 120, 0.1)',
                      borderRadius: '8px', marginTop: '10px'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                        Marks: {sub.marks}/{selectedAssignment.totalMarks}
                      </span>
                      {sub.feedback && <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-secondary)' }}>{sub.feedback}</p>}
                    </div>
                  ) : grading === sub._id ? (
                    <div style={{ marginTop: '10px' }}>
                      <input type="number" className="form-input" placeholder="Marks" style={{ marginBottom: '8px', padding: '8px' }}
                        value={gradeData.marks}
                        onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
                        max={selectedAssignment.totalMarks} />
                      <textarea className="form-textarea" placeholder="Feedback..." style={{ minHeight: '60px', marginBottom: '8px', padding: '8px' }}
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleGrade(sub._id)}>
                          <FiCheck /> Grade
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setGrading(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: '10px' }}
                      onClick={() => setGrading(sub._id)}>
                      Grade Submission
                    </button>
                  )}
                </motion.div>
              ))}

              {submissions.length === 0 && (
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No Submissions Yet</h3>
                    <p>No students have submitted this assignment yet</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewSubmissions;