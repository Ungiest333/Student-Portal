import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSend, FiTrash2 } from 'react-icons/fi';

const API = 'http://localhost:5000/api';

const GradeStudent = () => {
  const [students, setStudents] = useState([]);
  const [allMarks, setAllMarks] = useState([]);
  const [formData, setFormData] = useState({
    student: '', subject: '', examType: 'quiz',
    marksObtained: '', totalMarks: '', remarks: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        axios.get(`${API}/auth/students`),
        axios.get(`${API}/marks`)
      ]);
      setStudents(sRes.data);
      setAllMarks(mRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/marks`, formData);
      toast.success('Marks added successfully!');
      setFormData({ student: '', subject: '', examType: 'quiz', marksObtained: '', totalMarks: '', remarks: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add marks');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMarks = async (id) => {
    try {
      await axios.delete(`${API}/marks/${id}`);
      toast.success('Marks deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>⭐ Grade Students</h1>
          <p>Add and manage student marks</p>
        </motion.div>

        <div className="content-grid">
          {/* Add Marks Form */}
          <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 style={{ fontFamily: 'Poppins', marginBottom: '20px' }}>Add Marks</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Student</label>
                <select className="form-select" value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })} required>
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.enrollmentNo || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-input" placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Type</label>
                  <select className="form-select" value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}>
                    <option value="quiz">Quiz</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Marks Obtained</label>
                  <input type="number" className="form-input"
                    value={formData.marksObtained}
                    onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input type="number" className="form-input"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea className="form-textarea" placeholder="Optional remarks..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} style={{ minHeight: '80px' }} />
              </div>

              <motion.button type="submit" className="btn btn-primary btn-block" disabled={submitting}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {submitting ? 'Adding...' : <><FiSend /> Add Marks</>}
              </motion.button>
            </form>
          </motion.div>

          {/* Recent Marks */}
          <motion.div className="table-container" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="table-header">
              <h3>Recent Marks</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allMarks.slice(0, 15).map((mark, i) => (
                  <motion.tr key={mark._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {mark.student?.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {mark.student?.enrollmentNo}
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{mark.subject}</span></td>
                    <td>{mark.marksObtained}/{mark.totalMarks}</td>
                    <td>
                      <span className={`badge ${mark.grade === 'A+' || mark.grade === 'A' ? 'badge-success' : mark.grade === 'F' ? 'badge-danger' : 'badge-warning'}`}>
                        {mark.grade}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteMarks(mark._id)}>
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {allMarks.length === 0 && (
              <div className="empty-state">
                <p>No marks added yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GradeStudent;