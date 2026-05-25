import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiClock,
  FiDownload,
  FiEye,
  FiFile,
  FiFileText,
  FiImage,
  FiTrash2
} from 'react-icons/fi';
import { API_BASE_URL, buildAssetUrl } from '../../config';

const API = API_BASE_URL;

const ViewExams = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [grading, setGrading] = useState(null);
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });
  const [deleting, setDeleting] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await axios.get(`${API}/exams`);
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Delete this exam?')) return;

    setDeleting(examId);
    try {
      await axios.delete(`${API}/exams/${examId}`);
      setExams((current) => current.filter((exam) => exam._id !== examId));
      toast.success('Exam deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    } finally {
      setDeleting(null);
    }
  };

  const fetchResults = async (exam) => {
    setSelectedExam(exam);
    setResultsLoading(true);

    try {
      const { data } = await axios.get(`${API}/exams/${exam._id}/results`);
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load exam results');
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleGrade = async (resultId) => {
    if (!selectedExam) return;

    try {
      const { data } = await axios.put(
        `${API}/exams/${selectedExam._id}/results/${resultId}/grade`,
        gradeData
      );
      setResults((current) => current.map((result) => result._id === resultId ? data : result));
      setGrading(null);
      setGradeData({ marks: '', feedback: '' });
      toast.success('Marks saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save marks');
    }
  };

  const formatDateTime = (value) => {
    if (!value) return 'Not set';
    return new Date(value).toLocaleString();
  };

  const isExamActive = (exam) => {
    const now = new Date();
    return new Date(exam.startTime) <= now && new Date(exam.endTime) >= now;
  };

  const fileUrl = (path) => buildAssetUrl(path);

  const getMcqAnswerRows = (result) => {
    const questions = result.exam?.questions || [];
    return (result.answers || []).map((answer, index) => {
      const question = questions.find((q) => String(q._id) === String(answer.questionId));
      const selectedOption = question?.options?.[answer.selectedOption];
      const correctOption = question?.options?.find((option) => option.isCorrect);

      return {
        index,
        questionText: question?.question || `Question ${index + 1}`,
        selectedText: selectedOption?.text || 'Not answered',
        correctText: correctOption?.text || 'Not set'
      };
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>{selectedExam ? 'Exam Results' : 'View Exams'}</h1>
          <p>{selectedExam ? selectedExam.title : 'Review all exams created for students'}</p>
        </motion.div>

        {selectedExam ? (
          <>
            <button
              className="btn btn-outline"
              style={{ marginBottom: '20px' }}
              onClick={() => {
                setSelectedExam(null);
                setResults([]);
              }}
            >
              Back to Exams
            </button>

            {resultsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="content-grid-3">
                {results.map((result, index) => (
                  <motion.div
                    key={result._id}
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Poppins', fontSize: '1rem', marginBottom: '4px' }}>
                          {result.student?.name || 'Student'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {result.student?.enrollmentNo || result.student?.email || 'No student details'}
                        </p>
                      </div>
                      <span className="badge badge-success">{result.status}</span>
                    </div>

                    <div style={{ display: 'grid', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <div>Email: {result.student?.email || 'N/A'}</div>
                      <div>Course: {result.student?.course || 'N/A'}</div>
                      <div>Batch: {result.student?.batch || 'N/A'}</div>
                      <div>Submitted: {formatDateTime(result.completedAt || result.createdAt)}</div>
                      <div>Time Taken: {Math.round((result.timeTaken || 0) / 60)} min</div>
                    </div>

                    {result.answerText && (
                      <p style={{
                        marginTop: '12px',
                        padding: '10px',
                        background: 'rgba(102,126,234,0.07)',
                        borderRadius: '8px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem'
                      }}>
                        {result.answerText}
                      </p>
                    )}

                    {result.exam?.examType === 'mcq' && result.answers?.length > 0 && (
                      <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                        <h4 style={{ fontFamily: 'Poppins', fontSize: '0.95rem' }}>Submitted MCQ Answers</h4>
                        {getMcqAnswerRows(result).map((answer) => (
                          <div
                            key={`${answer.questionText}-${answer.index}`}
                            style={{
                              padding: '10px',
                              background: 'rgba(102,126,234,0.07)',
                              border: '1px solid rgba(102,126,234,0.18)',
                              borderRadius: '8px'
                            }}
                          >
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                              {answer.index + 1}. {answer.questionText}
                            </strong>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'grid', gap: '4px' }}>
                              <div>Student answer: {answer.selectedText}</div>
                              
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.submissionFiles?.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                        {result.submissionFiles.map((file, fileIndex) => (
                          <a
                            key={`${file.filepath}-${fileIndex}`}
                            href={fileUrl(file.filepath)}
                            target="_blank"
                            rel="noreferrer"
                            className="file-item"
                            style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
                          >
                            <div className="file-info">
                              {file.mimetype?.startsWith('image/') ? <FiImage className="file-icon" /> : <FiFile className="file-icon" />}
                              <span style={{ fontSize: '0.8rem' }}>{file.filename}</span>
                            </div>
                            <FiDownload size={14} style={{ color: 'var(--primary)' }} />
                          </a>
                        ))}
                      </div>
                    )}

                    <div style={{
                      marginTop: '15px',
                      padding: '12px',
                      background: 'rgba(72, 187, 120, 0.1)',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>
                        {result.score}/{result.totalMarks}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {Number(result.percentage || 0).toFixed(1)}%
                      </div>
                    </div>

                    {grading === result._id ? (
                      <div style={{ marginTop: '12px' }}>
                        <input
                          type="number"
                          className="form-input"
                          placeholder={`Marks out of ${result.totalMarks}`}
                          min="0"
                          max={result.totalMarks}
                          value={gradeData.marks}
                          onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
                          style={{ marginBottom: '8px', padding: '8px' }}
                        />
                        <textarea
                          className="form-textarea"
                          placeholder="Feedback"
                          value={gradeData.feedback}
                          onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                          style={{ minHeight: '70px', marginBottom: '8px', padding: '8px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleGrade(result._id)}>
                            <FiCheck /> Save Marks
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => setGrading(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-block btn-sm"
                        style={{ marginTop: '12px' }}
                        onClick={() => {
                          setGrading(result._id);
                          setGradeData({
                            marks: result.score || '',
                            feedback: result.feedback || ''
                          });
                        }}
                      >
                        Give Marks
                      </button>
                    )}
                  </motion.div>
                ))}

                {results.length === 0 && (
                  <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-state">
                      <div className="empty-icon"><FiFileText size={40} color="#667eea" /></div>
                      <h3>No Submissions Yet</h3>
                      <p>No student has submitted this exam yet</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="content-grid-3">
          {exams.map((exam, index) => {
            const active = isExamActive(exam);
            const upcoming = new Date(exam.startTime) > new Date();

            return (
              <motion.div
                key={exam._id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                  <span className="badge badge-primary">
                    <FiBookOpen /> {exam.subject}
                  </span>
                  <span className={`badge badge-${active ? 'success' : upcoming ? 'info' : 'warning'}`}>
                    {active ? 'Active' : upcoming ? 'Upcoming' : 'Closed'}
                  </span>
                </div>

                <h3 style={{ marginBottom: '8px', fontFamily: 'Poppins', fontSize: '1.1rem' }}>
                  {exam.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>
                  {exam.description || 'No description'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                  <span className="badge badge-info">{exam.examType === 'document' ? 'Document' : 'MCQ'}</span>
                  <span className="badge badge-warning">{exam.totalMarks} marks</span>
                  <span className="badge badge-primary">{exam.duration} min</span>
                  {exam.examType === 'mcq' && (
                    <span className="badge badge-info">{exam.questions?.length || 0} questions</span>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '8px', marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div><FiCalendar /> Start: {formatDateTime(exam.startTime)}</div>
                  <div><FiClock /> End: {formatDateTime(exam.endTime)}</div>
                  <div>Course: {exam.course || 'All courses'}</div>
                  <div>Batch: {exam.batch || 'All batches'}</div>
                </div>

                {exam.examType === 'document' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                    {exam.examImage && (
                      <a className="btn btn-outline btn-sm" href={fileUrl(exam.examImage)} target="_blank" rel="noreferrer">
                        <FiImage /> Open Image
                      </a>
                    )}
                    {exam.pdfFile && (
                      <a className="btn btn-outline btn-sm" href={fileUrl(exam.pdfFile)} target="_blank" rel="noreferrer">
                        <FiFileText /> Open PDF
                      </a>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gap: '8px' }}>
                  <button
                    className="btn btn-primary btn-block btn-sm"
                    onClick={() => fetchResults(exam)}
                  >
                    <FiEye /> View Results
                  </button>
                  <button
                    className="btn btn-danger btn-block btn-sm"
                    onClick={() => handleDelete(exam._id)}
                    disabled={deleting === exam._id}
                  >
                    <FiTrash2 /> {deleting === exam._id ? 'Deleting...' : 'Delete Exam'}
                  </button>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}

        {!selectedExam && exams.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon"><FiBookOpen size={40} color="#667eea" /></div>
              <h3>No Exams Created</h3>
              <p>Create an exam first, then it will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExams;
