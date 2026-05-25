import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';
import { FiUsers, FiFileText, FiBookOpen, FiAward, FiTrendingUp } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = API_BASE_URL;

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, assignments: 0, exams: 0, marks: 0 });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, assignRes, examsRes, marksRes] = await Promise.all([
        axios.get(`${API}/auth/students`),
        axios.get(`${API}/assignments`),
        axios.get(`${API}/exams`),
        axios.get(`${API}/marks`)
      ]);

      setStudents(studentsRes.data);
      setStats({
        students: studentsRes.data.length,
        assignments: assignRes.data.length,
        exams: examsRes.data.length,
        marks: marksRes.data.length
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const courseDistribution = students.reduce((acc, s) => {
    if (s.course) acc[s.course] = (acc[s.course] || 0) + 1;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(courseDistribution),
    datasets: [{
      data: Object.values(courseDistribution),
      backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#48bb78', '#ed8936', '#63b3ed', '#fc8181'],
      borderWidth: 0
    }]
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />

        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Welcome, {user?.name}! 👨‍🏫</h1>
          <p>Here's your teaching dashboard overview</p>
        </motion.div>

        <div className="stats-grid">
          {[
            { icon: <FiUsers />, color: 'purple', label: 'Total Students', value: stats.students },
            { icon: <FiFileText />, color: 'green', label: 'Assignments', value: stats.assignments },
            { icon: <FiBookOpen />, color: 'orange', label: 'Exams', value: stats.exams },
            { icon: <FiAward />, color: 'pink', label: 'Grades Given', value: stats.marks }
          ].map((stat, i) => (
            <motion.div
              key={i} className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 0 40px rgba(102, 126, 234, 0.3)' }}
            >
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              <div className="stat-info">
                <h3><CountUp end={stat.value} duration={2} /></h3>
                <p>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="content-grid">
          <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3>Students by Course</h3>
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: { color: '#a0aec0', font: { size: 11 } } } } }} />
            </div>
          </motion.div>

          <motion.div className="table-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="table-header">
              <h3>Recent Students</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>Enrollment</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 8).map((student, i) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'var(--gradient-primary)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontWeight: '700', fontSize: '0.75rem'
                        }}>
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {student.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{student.course || 'N/A'}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.batch || 'N/A'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{student.enrollmentNo || 'N/A'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;