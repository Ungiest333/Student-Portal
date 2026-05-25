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
import { FiFileText, FiCheckCircle, FiAward, FiClock, FiTrendingUp } from 'react-icons/fi';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = 'http://localhost:5000/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignments: 0, submissions: 0, exams: 0, avgMarks: 0
  });
  const [marks, setMarks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignRes, subRes, marksRes] = await Promise.all([
        axios.get(`${API}/assignments`),
        axios.get(`${API}/submissions/my`),
        axios.get(`${API}/marks/my`)
      ]);
      
      const avg = marksRes.data.length > 0
        ? marksRes.data.reduce((sum, m) => sum + m.percentage, 0) / marksRes.data.length
        : 0;

      setStats({
        assignments: assignRes.data.length,
        submissions: subRes.data.length,
        exams: subRes.data.filter(s => s.status === 'graded').length,
        avgMarks: Math.round(avg)
      });
      setMarks(marksRes.data);
      setSubmissions(subRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const doughnutData = {
    labels: ['Submitted', 'Pending', 'Graded'],
    datasets: [{
      data: [
        submissions.filter(s => s.status === 'submitted').length,
        stats.assignments - stats.submissions,
        submissions.filter(s => s.status === 'graded').length
      ],
      backgroundColor: ['#667eea', '#ed8936', '#48bb78'],
      borderWidth: 0
    }]
  };

  const barData = {
    labels: marks.slice(0, 6).map(m => m.subject.substring(0, 10)),
    datasets: [{
      label: 'Percentage',
      data: marks.slice(0, 6).map(m => m.percentage),
      backgroundColor: 'rgba(102, 126, 234, 0.6)',
      borderColor: '#667eea',
      borderWidth: 1,
      borderRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#a0aec0' } } },
    scales: {
      x: { ticks: { color: '#718096' }, grid: { color: 'rgba(102, 126, 234, 0.08)' } },
      y: { ticks: { color: '#718096' }, grid: { color: 'rgba(102, 126, 234, 0.08)' } }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content" style={{ paddingTop: '90px' }}>
        <Navbar onMenuToggle={(state) => setIsSidebarOpen(state)} />
        
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's what's happening with your studies today.</p>
        </motion.div>

        <div className="stats-grid">
          {[
            { icon: <FiFileText />, color: 'purple', label: 'Assignments', value: stats.assignments },
            { icon: <FiCheckCircle />, color: 'green', label: 'Submitted', value: stats.submissions },
            { icon: <FiAward />, color: 'orange', label: 'Graded', value: stats.exams },
            { icon: <FiTrendingUp />, color: 'pink', label: 'Avg Score', value: stats.avgMarks, suffix: '%' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 0 40px rgba(102, 126, 234, 0.3)' }}
            >
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              <div className="stat-info">
                <h3><CountUp end={stat.value} duration={2} />{stat.suffix || ''}</h3>
                <p>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="content-grid" style={{ marginBottom: '25px' }}>
          <motion.div
            className="chart-container"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Assignment Status</h3>
            <div style={{ maxWidth: '250px', margin: '0 auto' }}>
              <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: { color: '#a0aec0' } } } }} />
            </div>
          </motion.div>

          <motion.div
            className="chart-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Subject-wise Performance</h3>
            <Bar data={barData} options={chartOptions} />
          </motion.div>
        </div>

        {/* Recent Marks */}
        {marks.length > 0 && (
          <motion.div
            className="table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="table-header">
              <h3>Recent Marks</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.slice(0, 5).map((mark, i) => (
                  <motion.tr
                    key={mark._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{mark.subject}</td>
                    <td><span className="badge badge-info">{mark.examType}</span></td>
                    <td>{mark.marksObtained}/{mark.totalMarks}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>{mark.percentage?.toFixed(1)}%</span>
                        <div className="progress-bar" style={{ width: '80px' }}>
                          <div
                            className={`progress-fill ${mark.percentage >= 80 ? 'excellent' : mark.percentage >= 60 ? 'good' : mark.percentage >= 40 ? 'average' : 'poor'}`}
                            style={{ width: `${mark.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${mark.grade === 'A+' || mark.grade === 'A' ? 'badge-success' : mark.grade === 'F' ? 'badge-danger' : 'badge-warning'}`}>
                        {mark.grade}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;