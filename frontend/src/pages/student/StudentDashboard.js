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
import { API_BASE_URL } from '../../config';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = API_BASE_URL;

const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignments: 0, submissions: 0, exams: 0, avgMarks: 0
  });
  const [examResults, setExamResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignRes, subRes, resultsRes] = await Promise.all([
        axios.get(`${API}/assignments`),
        axios.get(`${API}/submissions/my`),
        axios.get(`${API}/exams/results/my`)
      ]);

      const gradedResults = resultsRes.data.filter(result => result.status === 'graded');
      
      const avg = gradedResults.length > 0
        ? gradedResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / gradedResults.length
        : 0;

      setStats({
        assignments: assignRes.data.length,
        submissions: subRes.data.length,
        exams: gradedResults.length,
        avgMarks: Math.round(avg)
      });
      setExamResults(gradedResults);
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
    labels: examResults.slice(0, 6).map(result => (result.exam?.subject || result.exam?.title || 'Exam').substring(0, 10)),
    datasets: [{
      label: 'Percentage',
      data: examResults.slice(0, 6).map(result => result.percentage || 0),
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

        {/* Recent Exam Marks */}
        {examResults.length > 0 && (
          <motion.div
            className="table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="table-header">
              <h3>Recent Exam Marks</h3>
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
                {examResults.slice(0, 5).map((result, i) => {
                  const percentage = result.percentage || 0;
                  const grade = getGrade(percentage);
                  return (
                  <motion.tr
                    key={result._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{result.exam?.subject || '-'}</td>
                    <td><span className="badge badge-info">{result.exam?.examType || 'exam'}</span></td>
                    <td>{result.score}/{result.totalMarks}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>{percentage.toFixed(1)}%</span>
                        <div className="progress-bar" style={{ width: '80px' }}>
                          <div
                            className={`progress-fill ${percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : percentage >= 40 ? 'average' : 'poor'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${grade === 'A+' || grade === 'A' ? 'badge-success' : grade === 'F' ? 'badge-danger' : 'badge-warning'}`}>
                        {grade}
                      </span>
                    </td>
                  </motion.tr>
                );})}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
