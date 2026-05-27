import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiFile, FiX, FiSend } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

const API = API_BASE_URL;

const CreateAssignment = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', subject: '', dueDate: '',
    totalMarks: 100, batch: '', course: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      files.forEach(file => data.append('files', file));

      await axios.post(`${API}/assignments`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Assignment created successfully!');
      setFormData({ title: '', description: '', subject: '', dueDate: '', totalMarks: 100, batch: '', course: '' });
      setFiles([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>➕ Create Assignment</h1>
          <p>Create a new assignment for your students</p>
        </motion.div>

        <motion.div
          className="card"
          style={{ maxWidth: '700px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Assignment Title</label>
              <input type="text" name="title" className="form-input" placeholder="Enter title"
                value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" placeholder="Describe the assignment"
                value={formData.description} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" name="subject" className="form-input" placeholder="e.g., React.js"
                  value={formData.subject} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="datetime-local" name="dueDate" className="form-input"
                  value={formData.dueDate} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input type="number" name="totalMarks" className="form-input"
                  value={formData.totalMarks} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select name="course" className="form-select" value={formData.course} onChange={handleChange}>
                  <option value="">All Courses</option>
                  <option value="Web Development">Web Development</option>
                  <option value="App Development">App Development</option>
                  <option value="Python Programming">Python Programming</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Batch</label>
                <input type="text" name="batch" className="form-input" placeholder="e.g., Batch-2024"
                  value={formData.batch} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Attachments (Optional)</label>
              <div className="upload-area" onClick={() => fileRef.current.click()}>
                <FiUploadCloud className="upload-icon" />
                <h3>Upload reference files</h3>
                <p>PDFs, images, documents</p>
              </div>
              <input type="file" ref={fileRef} style={{ display: 'none' }} multiple
                onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files)])} />
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, i) => (
                    <div key={i} className="file-item">
                      <div className="file-info">
                        <FiFile className="file-icon" />
                        <span style={{ fontSize: '0.85rem' }}>{file.name}</span>
                      </div>
                      <button className="remove-btn" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}>
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <motion.button
              type="submit" className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Creating...' : <><FiSend /> Create Assignment</>}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAssignment;
