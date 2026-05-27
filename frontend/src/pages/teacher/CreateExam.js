import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSend, FiUploadCloud, FiX, FiCheck } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

const API = API_BASE_URL;

const toIsoDateTime = (value) => new Date(value).toISOString();

const CreateExam = () => {
  // Mode selection: 'mcq' or 'files' or null
  const [mode, setMode] = useState(null);

  // Shared exam data
  const [examData, setExamData] = useState({
    title: '', description: '', subject: '', duration: 60,
    startTime: '', endTime: '', batch: '', course: ''
  });

  // MCQ Mode data
  const [questions, setQuestions] = useState([{
    question: '', options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ], marks: 1
  }]);

  // File Upload Mode data
  const [examImage, setExamImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const examImageRef = useRef();
  const pdfRef = useRef();

  // ============ COMMON FUNCTIONS ============

  const validateFile = (file, type) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File size exceeds 10MB limit`);
      return false;
    }

    if (type === 'pdf' && file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file');
      return false;
    }

    if (type === 'image' && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return false;
    }

    return true;
  };

  const handleExamChange = (e) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setExamData({
      title: '', description: '', subject: '', duration: 60,
      startTime: '', endTime: '', batch: '', course: ''
    });
    setQuestions([{
      question: '', options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ], marks: 1
    }]);
    setExamImage(null);
    setPdfFile(null);
    if (examImageRef.current) examImageRef.current.value = '';
    if (pdfRef.current) pdfRef.current.value = '';
  };

  // ============ MCQ MODE FUNCTIONS ============

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = value;
    setQuestions(updated);
  };

  const handleCorrectAnswer = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt, isCorrect: i === oIndex
    }));
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '', options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ], marks: 1
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const submitMCQ = async (e) => {
    e.preventDefault();

    if (!examData.title.trim()) {
      toast.error('Please enter exam title');
      return;
    }
    if (!examData.subject.trim()) {
      toast.error('Please enter subject');
      return;
    }
    if (!examData.startTime || !examData.endTime) {
      toast.error('Please set start and end time');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        toast.error(`Question ${i + 1}: Please enter question text`);
        return;
      }
      if (!questions[i].options.every(o => o.text.trim())) {
        toast.error(`Question ${i + 1}: Please fill all options`);
        return;
      }
    }

    const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks), 0);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', examData.title);
      formData.append('description', examData.description);
      formData.append('subject', examData.subject);
      formData.append('duration', examData.duration);
      formData.append('startTime', toIsoDateTime(examData.startTime));
      formData.append('endTime', toIsoDateTime(examData.endTime));
      formData.append('batch', examData.batch);
      formData.append('course', examData.course);
      formData.append('totalMarks', totalMarks);
      formData.append('questions', JSON.stringify(questions));
      formData.append('examType', 'mcq');

      const response = await axios.post(`${API}/exams`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('MCQ Exam created successfully!');
      resetForm();
      setMode(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create exam');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ FILE UPLOAD MODE FUNCTIONS ============

  const handleExamImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file, 'image')) {
      setExamImage(file);
      toast.success('Exam image uploaded');
    }
    e.target.value = '';
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file, 'pdf')) {
      setPdfFile(file);
      toast.success('PDF uploaded');
    }
    e.target.value = '';
  };

  const removeExamImage = () => {
    setExamImage(null);
    if (examImageRef.current) examImageRef.current.value = '';
  };

  const removePdf = () => {
    setPdfFile(null);
    if (pdfRef.current) pdfRef.current.value = '';
  };

  const submitFiles = async (e) => {
    e.preventDefault();

    if (!examData.title.trim()) {
      toast.error('Please enter exam title');
      return;
    }
    if (!examData.subject.trim()) {
      toast.error('Please enter subject');
      return;
    }
    if (!examData.startTime || !examData.endTime) {
      toast.error('Please set start and end time');
      return;
    }
    if (!examImage && !pdfFile) {
      toast.error('Please upload either an image or PDF');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', examData.title);
      formData.append('description', examData.description);
      formData.append('subject', examData.subject);
      formData.append('duration', examData.duration);
      formData.append('startTime', toIsoDateTime(examData.startTime));
      formData.append('endTime', toIsoDateTime(examData.endTime));
      formData.append('batch', examData.batch);
      formData.append('course', examData.course);
      formData.append('examType', 'document');
      
      if (examImage) formData.append('examImage', examImage);
      if (pdfFile) formData.append('pdfFile', pdfFile);

      const response = await axios.post(`${API}/exams`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Exam uploaded successfully!');
      resetForm();
      setMode(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload exam');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ UI RENDERING ============

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>📝 Create Exam</h1>
          <p>Choose how to create your exam</p>
        </motion.div>

        {/* MODE SELECTION SCREEN */}
        {!mode ? (
          <motion.div 
            className="card" 
            style={{ maxWidth: '900px' }}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '30px', fontFamily: 'Poppins' }}>
              How would you like to create your exam?
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
              {/* MCQ OPTION */}
              <motion.button
                type="button"
                onClick={() => setMode('mcq')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '40px 30px',
                  border: '2px solid rgba(102,126,234,0.3)',
                  borderRadius: '16px',
                  background: 'rgba(102,126,234,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(102,126,234,0.3)';
                  e.currentTarget.style.background = 'rgba(102,126,234,0.05)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📋</div>
                <h3 style={{ fontFamily: 'Poppins', marginBottom: '10px' }}>Create MCQ Exam</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Create multiple choice questions with options and mark correct answers
                </p>
                <div style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                  ✓ Add multiple questions
                  <br />✓ Set correct answers
                  <br />✓ Assign marks to each question
                </div>
              </motion.button>

              {/* FILE UPLOAD OPTION */}
              <motion.button
                type="button"
                onClick={() => setMode('files')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '40px 30px',
                  border: '2px solid rgba(102,126,234,0.3)',
                  borderRadius: '16px',
                  background: 'rgba(102,126,234,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(102,126,234,0.3)';
                  e.currentTarget.style.background = 'rgba(102,126,234,0.05)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📄</div>
                <h3 style={{ fontFamily: 'Poppins', marginBottom: '10px' }}>Upload Exam Files</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Upload exam PDF or image instead of creating MCQs
                </p>
                <div style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                  ✓ Upload PDF file
                  <br />✓ Upload exam image
                  <br />✓ Or both PDF and image
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : null}

        {/* MCQ MODE FORM */}
        {mode === 'mcq' ? (
          <motion.div 
            className="card" 
            style={{ maxWidth: '900px' }}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              type="button"
              onClick={() => setMode(null)}
              style={{
                marginBottom: '20px',
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--text-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}
            >
              ← Back to selection
            </button>

            <form onSubmit={submitMCQ}>
              {/* Basic Information */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontFamily: 'Poppins', marginBottom: '15px' }}>Exam Details</h3>
                
                <div className="form-group">
                  <label className="form-label">Exam Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input 
                    type="text" 
                    name="title" 
                    className="form-input" 
                    placeholder="e.g., JavaScript MCQ Test"
                    value={examData.title} 
                    onChange={handleExamChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    name="description" 
                    className="form-textarea" 
                    placeholder="Exam description..."
                    value={examData.description} 
                    onChange={handleExamChange} 
                    rows="3"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Subject <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="text" 
                      name="subject" 
                      className="form-input" 
                      placeholder="e.g., Mathematics"
                      value={examData.subject} 
                      onChange={handleExamChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input 
                      type="number" 
                      name="duration" 
                      className="form-input" 
                      min="10"
                      value={examData.duration} 
                      onChange={handleExamChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course</label>
                    <select 
                      name="course" 
                      className="form-select" 
                      value={examData.course} 
                      onChange={handleExamChange}
                    >
                      <option value="">Select Course</option>
                      <option value="Web Development">Web Development</option>
                      <option value="App Development">App Development</option>
                      <option value="Python Programming">Python Programming</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="datetime-local" 
                      name="startTime" 
                      className="form-input"
                      value={examData.startTime} 
                      onChange={handleExamChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="datetime-local" 
                      name="endTime" 
                      className="form-input"
                      value={examData.endTime} 
                      onChange={handleExamChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch</label>
                    <input 
                      type="text" 
                      name="batch" 
                      className="form-input" 
                      placeholder="e.g., Batch-2024"
                      value={examData.batch} 
                      onChange={handleExamChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div style={{ borderTop: '1px solid rgba(102,126,234,0.15)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: 'Poppins' }}>Questions ({questions.length})</h3>
                  <span className="badge badge-primary">
                    Total Marks: {questions.reduce((sum, q) => sum + Number(q.marks), 0)}
                  </span>
                </div>

                {questions.map((q, qIndex) => (
                  <motion.div
                    key={qIndex}
                    style={{
                      background: 'rgba(102,126,234,0.05)',
                      border: '1px solid rgba(102,126,234,0.15)',
                      borderRadius: '14px',
                      padding: '20px',
                      marginBottom: '15px'
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: qIndex * 0.05 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                      <span className="badge badge-primary">Question {qIndex + 1}</span>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ width: '80px', padding: '6px 10px' }}
                          placeholder="Marks" 
                          value={q.marks}
                          onChange={(e) => handleQuestionChange(qIndex, 'marks', e.target.value)} 
                          min="1" 
                        />
                        {questions.length > 1 && (
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm" 
                            onClick={() => removeQuestion(qIndex)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label">Question Text</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Enter your question..."
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} 
                        required 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={opt.isCorrect}
                            onChange={() => handleCorrectAnswer(qIndex, oIndex)}
                            style={{ accentColor: 'var(--primary)', marginTop: '8px', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                              placeholder={`Option ${oIndex + 1}`}
                              value={opt.text}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} 
                              required 
                            />
                            {opt.isCorrect && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>
                                ✓ Correct Answer
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                <motion.button
                  type="button" 
                  className="btn btn-outline btn-block"
                  onClick={addQuestion}
                  whileHover={{ scale: 1.02 }}
                  style={{ marginBottom: '20px', marginTop: '15px' }}
                >
                  <FiPlus /> Add Another Question
                </motion.button>
              </div>

              <motion.button
                type="submit" 
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: '20px' }}
              >
                {loading ? 'Creating...' : <><FiSend /> Create MCQ Exam</>}
              </motion.button>
            </form>
          </motion.div>
        ) : null}

        {/* FILE UPLOAD MODE FORM */}
        {mode === 'files' ? (
          <motion.div 
            className="card" 
            style={{ maxWidth: '900px' }}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              type="button"
              onClick={() => setMode(null)}
              style={{
                marginBottom: '20px',
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--text-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}
            >
              ← Back to selection
            </button>

            <form onSubmit={submitFiles}>
              {/* Basic Information */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontFamily: 'Poppins', marginBottom: '15px' }}>Exam Details</h3>
                
                <div className="form-group">
                  <label className="form-label">Exam Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input 
                    type="text" 
                    name="title" 
                    className="form-input" 
                    placeholder="e.g., Physics Exam"
                    value={examData.title} 
                    onChange={handleExamChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    name="description" 
                    className="form-textarea" 
                    placeholder="Exam description..."
                    value={examData.description} 
                    onChange={handleExamChange} 
                    rows="3"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Subject <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="text" 
                      name="subject" 
                      className="form-input" 
                      placeholder="e.g., Physics"
                      value={examData.subject} 
                      onChange={handleExamChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input 
                      type="number" 
                      name="duration" 
                      className="form-input" 
                      min="10"
                      value={examData.duration} 
                      onChange={handleExamChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course</label>
                    <select 
                      name="course" 
                      className="form-select" 
                      value={examData.course} 
                      onChange={handleExamChange}
                    >
                      <option value="">Select Course</option>
                      <option value="Web Development">Web Development</option>
                      <option value="App Development">App Development</option>
                      <option value="Python Programming">Python Programming</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="datetime-local" 
                      name="startTime" 
                      className="form-input"
                      value={examData.startTime} 
                      onChange={handleExamChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="datetime-local" 
                      name="endTime" 
                      className="form-input"
                      value={examData.endTime} 
                      onChange={handleExamChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch</label>
                    <input 
                      type="text" 
                      name="batch" 
                      className="form-input" 
                      placeholder="e.g., Batch-2024"
                      value={examData.batch} 
                      onChange={handleExamChange} 
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div style={{ borderTop: '1px solid rgba(102,126,234,0.15)', paddingTop: '20px' }}>
                <h3 style={{ fontFamily: 'Poppins', marginBottom: '20px' }}>Upload Exam Files</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Exam Image */}
                  <div className="form-group">
                    <label className="form-label">Exam Image (Optional)</label>
                    <div 
                      onClick={() => examImageRef.current.click()}
                      style={{
                        padding: '30px 20px',
                        border: '2px dashed rgba(102,126,234,0.3)',
                        borderRadius: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        background: 'rgba(102,126,234,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102,126,234,0.3)';
                        e.currentTarget.style.background = 'rgba(102,126,234,0.05)';
                      }}
                    >
                      <FiUploadCloud style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '8px' }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        JPG or PNG • Max 10MB
                      </p>
                    </div>
                    <input 
                      type="file" 
                      ref={examImageRef} 
                      style={{ display: 'none' }} 
                      accept=".jpg,.jpeg,.png"
                      onChange={handleExamImageUpload} 
                    />
                    {examImage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                          marginTop: '10px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          padding: '10px', 
                          background: 'rgba(76,175,80,0.1)', 
                          borderRadius: '8px' 
                        }}
                      >
                        <FiCheck style={{ color: '#4CAF50' }} />
                        <span style={{ fontSize: '0.9rem' }}>{examImage.name}</span>
                        <button 
                          type="button" 
                          onClick={removeExamImage}
                          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                        >
                          <FiX />
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* PDF */}
                  <div className="form-group">
                    <label className="form-label">Exam PDF (Optional)</label>
                    <div 
                      onClick={() => pdfRef.current.click()}
                      style={{
                        padding: '30px 20px',
                        border: '2px dashed rgba(102,126,234,0.3)',
                        borderRadius: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        background: 'rgba(102,126,234,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(102,126,234,0.3)';
                        e.currentTarget.style.background = 'rgba(102,126,234,0.05)';
                      }}
                    >
                      <FiUploadCloud style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '8px' }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        PDF • Max 10MB
                      </p>
                    </div>
                    <input 
                      type="file" 
                      ref={pdfRef} 
                      style={{ display: 'none' }} 
                      accept=".pdf"
                      onChange={handlePdfUpload} 
                    />
                    {pdfFile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                          marginTop: '10px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          padding: '10px', 
                          background: 'rgba(76,175,80,0.1)', 
                          borderRadius: '8px' 
                        }}
                      >
                        <FiCheck style={{ color: '#4CAF50' }} />
                        <span style={{ fontSize: '0.9rem' }}>{pdfFile.name}</span>
                        <button 
                          type="button" 
                          onClick={removePdf}
                          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                        >
                          <FiX />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <p style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Upload at least one file (image or PDF)
                </p>
              </div>

              <motion.button
                type="submit" 
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: '20px' }}
              >
                {loading ? 'Uploading...' : <><FiUploadCloud /> Upload Exam</>}
              </motion.button>
            </form>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default CreateExam;
