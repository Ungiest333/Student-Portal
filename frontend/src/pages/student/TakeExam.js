import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiClock, FiCheckCircle, FiAlertCircle, FiPlay, FiSend, FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import { API_BASE_URL, buildAssetUrl } from '../../config';

const API = API_BASE_URL;

const TakeExam = () => {
  const [exams, setExams] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [documentText, setDocumentText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const [examsRes, resultsRes] = await Promise.all([
        axios.get(`${API}/exams`),
        axios.get(`${API}/exams/results/my`)
      ]);
      setExams(examsRes.data);
      setResults(resultsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasAttempted = (examId) => {
    return results.some(r => {
      const resultExamId = r.exam?._id || r.exam;
      return resultExamId === examId && ['completed', 'graded', 'timed-out'].includes(r.status);
    });
  };

  const startExam = async (exam) => {
    try {
      const { data } = await axios.get(`${API}/exams/${exam._id}`);
      setActiveExam(data);
      setTimeLeft(data.duration * 60);
      setStarted(true);
      setAnswers({});
      setDocumentFiles([]);
      setDocumentText('');
    } catch (error) {
      toast.error('Failed to load exam');
    }
  };

  const submitExam = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const timeTaken = (activeExam.duration * 60) - timeLeft;

      if (activeExam.examType === 'document') {
        if (!documentFiles.length && !documentText.trim()) {
          toast.error('Please upload your answer file or add a note');
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        documentFiles.forEach((file) => formData.append('answerFiles', file));
        formData.append('answerText', documentText);
        formData.append('timeTaken', timeTaken);

        await axios.post(`${API}/exams/${activeExam._id}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.success('Exam submitted successfully!');
        setStarted(false);
        setActiveExam(null);
        setDocumentFiles([]);
        setDocumentText('');
        fetchExams();
        return;
      }

      const answerArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId, selectedOption
      }));

      const { data } = await axios.post(`${API}/exams/${activeExam._id}/submit`, {
        answers: answerArray, timeTaken
      });

      toast.success(`Exam submitted! Score: ${data.score}/${data.totalMarks}`);
      setStarted(false);
      setActiveExam(null);
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [answers, activeExam, documentFiles, documentText, timeLeft, submitting]);

  const handleDocumentFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    const validFiles = selected.filter((file) => {
      const isValid = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type);
      if (!isValid) toast.error(`${file.name} is not a photo or PDF`);
      return isValid;
    });
    setDocumentFiles((current) => current.concat(validFiles));
    e.target.value = '';
  };

  const removeDocumentFile = (index) => {
    setDocumentFiles((current) => current.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitExam]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  // Active Exam View
  if (started && activeExam) {
    return (
      <div className="page-container">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="main-content" style={{ paddingTop: '90px' }}>
          <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />
          <div className="exam-container">
            <motion.div
              className="exam-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontSize: '1.3rem' }}>{activeExam.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {activeExam.questions?.length} Questions • {activeExam.totalMarks} Marks
                </p>
              </div>
              <div className={`exam-timer ${timeLeft < 60 ? 'warning' : ''}`}>
                <FiClock style={{ marginRight: '6px' }} />
                {formatTime(timeLeft)}
              </div>
            </motion.div>

            {activeExam.examType === 'document' ? (
              <motion.div
                className="question-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 style={{ fontFamily: 'Poppins', marginBottom: '12px' }}>Upload Your Answer</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>
                  Submit your completed exam as photos or a PDF file.
                </p>

                {activeExam.examImage && (
                  <a className="btn btn-outline btn-sm" href={buildAssetUrl(activeExam.examImage)} target="_blank" rel="noreferrer" style={{ marginRight: '8px', marginBottom: '15px' }}>
                    View Exam Image
                  </a>
                )}
                {activeExam.pdfFile && (
                  <a className="btn btn-outline btn-sm" href={buildAssetUrl(activeExam.pdfFile)} target="_blank" rel="noreferrer" style={{ marginBottom: '15px' }}>
                    View Exam PDF
                  </a>
                )}

                <div className="upload-area" onClick={() => document.getElementById('exam-answer-files').click()}>
                  <FiUploadCloud className="upload-icon" />
                  <h3>Upload photos or PDF</h3>
                  <p>JPG, PNG, or PDF files only</p>
                </div>
                <input
                  id="exam-answer-files"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleDocumentFiles}
                />

                {documentFiles.length > 0 && (
                  <div className="file-list">
                    {documentFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="file-item">
                        <div className="file-info">
                          <FiFile className="file-icon" />
                          <span style={{ fontSize: '0.85rem' }}>{file.name}</span>
                        </div>
                        <button type="button" className="remove-btn" onClick={() => removeDocumentFile(index)}>
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '18px' }}>
                  <label className="form-label">Answer Note</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Optional note for your teacher"
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                  />
                </div>
              </motion.div>
            ) : activeExam.questions?.map((question, qIndex) => (
              <motion.div
                key={question._id}
                className="question-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.05 }}
              >
                <div className="question-text">
                  <span className="question-number">{qIndex + 1}</span>
                  {question.question}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '10px' }}>
                    ({question.marks} marks)
                  </span>
                </div>

                {question.options?.map((option, oIndex) => (
                  <motion.div
                    key={oIndex}
                    className={`option-item ${answers[question._id] === oIndex ? 'selected' : ''}`}
                    onClick={() => setAnswers({ ...answers, [question._id]: oIndex })}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="option-radio" />
                    <span>{option.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            ))}

            <motion.div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
              <p style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>
                {activeExam.examType === 'document'
                  ? `Files selected: ${documentFiles.length}`
                  : `Answered: ${Object.keys(answers).length}/${activeExam.questions?.length}`}
              </p>
              <motion.button
                className="btn btn-primary btn-lg"
                onClick={submitExam}
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? 'Submitting...' : <><FiSend /> Submit Exam</>}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Exam List View
  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>📝 Exams</h1>
          <p>Take your MCQ-based exams</p>
        </motion.div>

        <div className="content-grid-3">
          {exams.map((exam, i) => {
            const attempted = hasAttempted(exam._id);
            const result = results.find(r => (r.exam?._id || r.exam) === exam._id);
            const now = new Date();
            const isActive = new Date(exam.startTime) <= now && new Date(exam.endTime) >= now;

            return (
              <motion.div
                key={exam._id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span className="badge badge-primary">{exam.subject}</span>
                  {attempted ? (
                    <span className="badge badge-success"><FiCheckCircle /> Completed</span>
                  ) : isActive ? (
                    <span className="badge badge-warning"><FiAlertCircle /> Active</span>
                  ) : (
                    <span className="badge badge-info"><FiClock /> Upcoming</span>
                  )}
                </div>

                <h3 style={{ marginBottom: '8px', fontFamily: 'Poppins', fontSize: '1.1rem' }}>
                  {exam.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>
                  {exam.description?.substring(0, 80)}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                  <span className="badge badge-info">{exam.duration} min</span>
                  <span className="badge badge-warning">{exam.totalMarks} marks</span>
                  <span className="badge badge-primary">
                    {exam.examType === 'document' ? 'Photo/PDF Submission' : `${exam.questions?.length || 0} questions`}
                  </span>
                </div>

                {attempted && result ? (
                  <div style={{
                    padding: '12px', background: 'rgba(72, 187, 120, 0.1)',
                    borderRadius: '10px', textAlign: 'center'
                  }}>
                    {exam.examType === 'document' && result.status !== 'graded' ? (
                      <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--success)' }}>
                        Submitted, waiting for marks
                      </p>
                    ) : (
                      <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--success)' }}>
                        Score: {result.score}/{result.totalMarks} ({result.percentage?.toFixed(1)}%)
                      </p>
                    )}
                  </div>
                ) : isActive ? (
                  <motion.button
                    className="btn btn-primary btn-block"
                    onClick={() => startExam(exam)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiPlay /> Start Exam
                  </motion.button>
                ) : (
                  <button className="btn btn-outline btn-block" disabled>
                    Not Available
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {exams.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No Exams Available</h3>
              <p>Check back later for upcoming exams</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeExam;
