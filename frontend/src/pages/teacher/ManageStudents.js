import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import { FiUsers, FiMail, FiPhone, FiBookOpen, FiSearch } from 'react-icons/fi';
import CountUp from 'react-countup';
import { API_BASE_URL } from '../../config';

const API = API_BASE_URL;

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (search) {
      setFiltered(students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.enrollmentNo?.toLowerCase().includes(search.toLowerCase()) ||
        s.course?.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFiltered(students);
    }
  }, [search, students]);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get(`${API}/auth/students`);
      setStudents(data);
      setFiltered(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const courseCount = students.reduce((acc, s) => {
    if (s.course) acc[s.course] = (acc[s.course] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>👥 Manage Students</h1>
          <p>View and manage all enrolled students</p>
        </motion.div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '25px' }}>
          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="stat-icon purple"><FiUsers /></div>
            <div className="stat-info">
              <h3><CountUp end={students.length} duration={2} /></h3>
              <p>Total Students</p>
            </div>
          </motion.div>
          {Object.entries(courseCount).slice(0, 3).map(([course, count], i) => (
            <motion.div key={course} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.1 }}>
              <div className={`stat-icon ${['green', 'orange', 'pink'][i]}`}><FiBookOpen /></div>
              <div className="stat-info">
                <h3><CountUp end={count} duration={2} /></h3>
                <p>{course}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ marginBottom: '20px' }}>
          <div className="navbar-search" style={{ maxWidth: '400px' }}>
            <FiSearch />
            <input type="text" placeholder="Search students..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
        </motion.div>

        {/* Student Table */}
        <motion.div className="table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="table-header">
            <h3>All Students ({filtered.length})</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Enrollment No</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <motion.tr key={student._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'var(--gradient-primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '0.9rem'
                      }}>
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <FiPhone size={12} /> {student.phone || 'N/A'}
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{student.course || 'N/A'}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{student.batch || 'N/A'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{student.enrollmentNo || 'N/A'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageStudents;