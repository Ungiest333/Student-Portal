import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'; // ADD THIS
import {
  FiUploadCloud, FiFile, FiX, FiLink,
  FiPlus, FiSend, FiClock, FiCheckCircle,
  FiPaperclip, FiImage, FiFileText
} from 'react-icons/fi';

const API = 'http://localhost:5000/api';

const getFileUrl = function(filepath) {
  var filename = filepath.split('\\').pop().split('/').pop();
  return 'http://localhost:5000/uploads/' + filename;
};

var FileIcon = function(props) {
  var mimetype = props.mimetype;
  if (!mimetype) return React.createElement(FiFile, null);
  if (mimetype.startsWith('image/')) return React.createElement(FiImage, null);
  if (mimetype === 'application/pdf') return React.createElement(FiFileText, null);
  return React.createElement(FiFile, null);
};

var getFileLabel = function(mimetype) {
  if (!mimetype) return 'File';
  if (mimetype.startsWith('image/')) return 'Image';
  if (mimetype === 'application/pdf') return 'PDF';
  if (mimetype.includes('word')) return 'Doc';
  if (mimetype.includes('zip') || mimetype.includes('rar')) return 'Archive';
  return 'File';
};

const SubmitAssignment = function() {
  // ADD THIS - Get token from AuthContext
  const { token } = useAuth();

  var assignmentsState = useState([]);
  var assignments = assignmentsState[0];
  var setAssignments = assignmentsState[1];

  var mySubmissionsState = useState([]);
  var mySubmissions = mySubmissionsState[0];
  var setMySubmissions = mySubmissionsState[1];

  var selectedState = useState(null);
  var selectedAssignment = selectedState[0];
  var setSelectedAssignment = selectedState[1];

  var filesState = useState([]);
  var files = filesState[0];
  var setFiles = filesState[1];

  var urlsState = useState([]);
  var urls = urlsState[0];
  var setUrls = urlsState[1];

  var urlInputState = useState('');
  var urlInput = urlInputState[0];
  var setUrlInput = urlInputState[1];

  var textState = useState('');
  var text = textState[0];
  var setText = textState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var submittingState = useState(false);
  var submitting = submittingState[0];
  var setSubmitting = submittingState[1];

  var sidebarState = useState(false);
  var isSidebarOpen = sidebarState[0];
  var setIsSidebarOpen = sidebarState[1];

  var previewState = useState(null);
  var previewFile = previewState[0];
  var setPreviewFile = previewState[1];

  var fileRef = useRef();

  useEffect(function() { fetchData(); }, [token]); // ADD token as dependency

  // FIXED FETCH DATA - Now uses token from AuthContext
  var fetchData = async function() {
    try {
      console.log('🔄 Fetching assignments and submissions...');
      
      if (!token) {
        console.error('❌ No token available');
        toast.error('Please login first');
        setLoading(false);
        return;
      }

      // axios is already configured with the token in AuthContext!
      var results = await Promise.all([
        axios.get(API + '/assignments'),
        axios.get(API + '/submissions/my')
      ]);
      
      console.log('✅ Data fetched successfully!');
      console.log('📋 Assignments:', results[0].data);
      console.log('📤 Submissions:', results[1].data);
      
      setAssignments(results[0].data);
      setMySubmissions(results[1].data);
      
    } catch (err) {
      console.error('❌ FetchData Error:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again');
      } else if (err.response?.status === 403) {
        toast.error('Access forbidden');
      } else if (err.response?.status === 500) {
        toast.error('Server error: ' + (err.response.data?.message || 'Unknown error'));
      } else {
        toast.error('Error: ' + (err.response?.data?.message || err.message));
      }
      console.error('Response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  var isSubmitted = function(id) {
    return mySubmissions.some(function(s) {
      return (s.assignment && s.assignment._id === id) || s.assignment === id;
    });
  };

  var handleFileSelect = function(e) {
    var newFiles = Array.from(e.target.files);
    setFiles(function(prev) { return prev.concat(newFiles); });
  };

  var removeFile = function(i) {
    setFiles(function(prev) { return prev.filter(function(_, idx) { return idx !== i; }); });
  };

  var addUrl = function() {
    if (urlInput.trim()) {
      var val = urlInput.trim();
      setUrls(function(prev) { return prev.concat([val]); });
      setUrlInput('');
    }
  };

  var removeUrl = function(i) {
    setUrls(function(prev) { return prev.filter(function(_, idx) { return idx !== i; }); });
  };

  // FIXED SUBMIT - No need to get token, axios already has it
  var handleSubmit = async function(e) {
    e.preventDefault();
    if (!selectedAssignment) return toast.error('Select an assignment');
    if (!files.length && !urls.length && !text.trim())
      return toast.error('Please add files, URLs, or text');

    setSubmitting(true);
    try {
      var formData = new FormData();
      formData.append('assignment', selectedAssignment._id);
      formData.append('text', text);
      formData.append('urls', JSON.stringify(urls));
      files.forEach(function(f) { formData.append('files', f); });

      // axios already has the Authorization header set in AuthContext!
      await axios.post(API + '/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
          // Don't override Authorization - axios already has it
        }
      });

      toast.success('Assignment submitted successfully!');
      setFiles([]);
      setUrls([]);
      setText('');
      setSelectedAssignment(null);
      fetchData();
    } catch (err) {
      console.error('Submit error:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again');
      } else {
        toast.error((err.response?.data?.message) || 'Submission failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return React.createElement(LoadingSpinner, null);

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={function() { setIsSidebarOpen(false); }} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={function(s) { setIsSidebarOpen(s); }} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Assignments</h1>
          <p>View and submit your assignments</p>
        </motion.div>

        <div className="content-grid">

          {/* Assignment List */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 style={{ marginBottom: '15px', fontFamily: 'Poppins', color: 'var(--text-primary)' }}>
              Available Assignments
            </h3>

            {assignments && assignments.length > 0 ? (
              assignments.map(function(assignment, i) {
                return (
                  <motion.div
                    key={assignment._id}
                    className="card"
                    style={{
                      marginBottom: '12px',
                      cursor: isSubmitted(assignment._id) ? 'default' : 'pointer',
                      borderColor: selectedAssignment && selectedAssignment._id === assignment._id ? 'var(--primary)' : undefined,
                      boxShadow: selectedAssignment && selectedAssignment._id === assignment._id
                        ? '0 0 20px rgba(102,126,234,0.2)' : undefined
                    }}
                    onClick={function() {
                      if (!isSubmitted(assignment._id)) setSelectedAssignment(assignment);
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '6px', color: 'var(--text-primary)' }}>
                          {assignment.title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          {assignment.description ? assignment.description.substring(0, 100) : ''}
                          {assignment.description && assignment.description.length > 100 ? '...' : ''}
                        </p>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="badge badge-primary">{assignment.subject}</span>
                          <span className="badge badge-info">
                            <FiClock size={10} /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          <span className="badge badge-warning">Marks: {assignment.totalMarks}</span>
                        </div>

                        {assignment.attachments && assignment.attachments.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <p style={{
                              fontSize: '0.72rem', color: 'var(--text-muted)',
                              textTransform: 'uppercase', letterSpacing: '0.5px',
                              marginBottom: '8px', fontWeight: '600',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                              <FiPaperclip size={10} /> Attachments
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {assignment.attachments.map(function(file, idx) {
                                var url = getFileUrl(file.filepath);
                                var isImage = file.mimetype && file.mimetype.startsWith('image/');
                                return (
                                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {isImage && (
                                      <img
                                        src={url}
                                        alt={file.filename}
                                        onClick={function(e) { e.stopPropagation(); setPreviewFile(url); }}
                                        style={{
                                          width: '72px', height: '56px', objectFit: 'cover',
                                          borderRadius: '6px',
                                          border: '1px solid rgba(102,126,234,0.3)',
                                          cursor: 'zoom-in', display: 'block'
                                        }}
                                      />
                                    )}
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={function(e) { e.stopPropagation(); }}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '4px 8px', borderRadius: '6px',
                                        background: 'rgba(102,126,234,0.1)',
                                        border: '1px solid rgba(102,126,234,0.25)',
                                        color: '#667eea', fontSize: '0.75rem',
                                        textDecoration: 'none', fontWeight: '500',
                                        maxWidth: '150px', overflow: 'hidden',
                                        textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                      }}
                                    >
                                      <FileIcon mimetype={file.mimetype} />
                                      <span>{getFileLabel(file.mimetype)}: {file.filename}</span>
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {isSubmitted(assignment._id) && (
                        <span className="badge badge-success" style={{ marginLeft: '10px', flexShrink: 0 }}>
                          <FiCheckCircle /> Submitted
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="card">
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  No assignments available yet
                </p>
              </div>
            )}
          </motion.div>

          {/* Submit Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {selectedAssignment ? (
              <div className="card">
                <h3 style={{ marginBottom: '6px', fontFamily: 'Poppins' }}>
                  Submit: {selectedAssignment.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  {selectedAssignment.description}
                </p>

                {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                  <div style={{
                    marginBottom: '22px', padding: '16px',
                    background: 'rgba(102,126,234,0.07)',
                    border: '1px solid rgba(102,126,234,0.2)',
                    borderRadius: '12px'
                  }}>
                    <p style={{
                      fontSize: '0.78rem', color: '#667eea', fontWeight: '700',
                      textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px'
                    }}>
                      Reference Files from Teacher
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {selectedAssignment.attachments.map(function(file, idx) {
                        var url = getFileUrl(file.filepath);
                        var isImage = file.mimetype && file.mimetype.startsWith('image/');
                        var isPdf = file.mimetype === 'application/pdf';

                        return (
                          <div key={idx}>
                            {isImage && (
                              <img
                                src={url}
                                alt={file.filename}
                                onClick={function() { setPreviewFile(url); }}
                                style={{
                                  width: '100%', maxHeight: '220px',
                                  objectFit: 'cover', borderRadius: '10px',
                                  border: '1px solid rgba(102,126,234,0.25)',
                                  marginBottom: '8px', cursor: 'zoom-in', display: 'block'
                                }}
                              />
                            )}

                            {isPdf && (
                              <iframe
                                src={url}
                                title={file.filename}
                                style={{
                                  width: '100%', height: '260px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(102,126,234,0.25)',
                                  marginBottom: '8px', background: '#fff'
                                }}
                              />
                            )}

                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '7px 14px', borderRadius: '8px',
                                background: 'rgba(102,126,234,0.12)',
                                border: '1px solid rgba(102,126,234,0.3)',
                                color: '#667eea', fontSize: '0.82rem',
                                textDecoration: 'none', fontWeight: '600'
                              }}
                            >
                              <FileIcon mimetype={file.mimetype} />
                              <span>Open {file.filename}</span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Upload Files (Photos, PDFs, Docs)</label>
                    <div className="upload-area" onClick={function() { fileRef.current.click(); }}>
                      <FiUploadCloud className="upload-icon" />
                      <h3>Click to upload files</h3>
                      <p>Supports images, PDFs, docs (max 50MB each)</p>
                    </div>
                    <input
                      type="file"
                      ref={fileRef}
                      style={{ display: 'none' }}
                      multiple
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.zip,.rar"
                    />
                    {files.length > 0 && (
                      <div className="file-list">
                        {files.map(function(file, i) {
                          return (
                            <div key={i} className="file-item">
                              <div className="file-info">
                                <FiFile className="file-icon" />
                                <span style={{ fontSize: '0.85rem' }}>{file.name}</span>
                              </div>
                              <button type="button" className="remove-btn" onClick={function() { removeFile(i); }}>
                                <FiX />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Add URLs</label>
                    <div className="url-input-group">
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://example.com"
                        value={urlInput}
                        onChange={function(e) { setUrlInput(e.target.value); }}
                      />
                      <button type="button" className="btn btn-outline btn-sm" onClick={addUrl}>
                        <FiPlus />
                      </button>
                    </div>
                    {urls.length > 0 && (
                      <div className="url-list">
                        {urls.map(function(url, i) {
                          return (
                            <div key={i} className="url-item">
                              <a href={url} target="_blank" rel="noreferrer">
                                <FiLink /> {url}
                              </a>
                              <button type="button" className="remove-btn" onClick={function() { removeUrl(i); }}>
                                <FiX />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Add any notes or description..."
                      value={text}
                      onChange={function(e) { setText(e.target.value); }}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting
                      ? <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                      : <span><FiSend /> Submit Assignment</span>
                    }
                  </motion.button>
                </form>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">
                    <FiFileText size={40} color="#667eea" />
                  </div>
                  <h3>Select an Assignment</h3>
                  <p>Click on an assignment from the list to start submitting</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {previewFile && (
        <div
          onClick={function() { setPreviewFile(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img
            src={previewFile}
            alt="Preview"
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              borderRadius: '14px',
              border: '2px solid rgba(102,126,234,0.4)',
              boxShadow: '0 0 60px rgba(102,126,234,0.3)'
            }}
          />
          <button
            onClick={function() { setPreviewFile(null); }}
            style={{
              position: 'fixed', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
              borderRadius: '50%', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmitAssignment;