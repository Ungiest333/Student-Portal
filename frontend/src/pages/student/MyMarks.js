import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FiAward, FiTrendingUp, FiTarget, FiStar } from 'react-icons/fi';
import CountUp from 'react-countup';
import { API_BASE_URL } from '../../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

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

const MyMarks = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      const { data } = await axios.get(`${API}/exams/results/my`);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const gradedResults = results.filter(result => result.status === 'graded');

  const avgPercentage = gradedResults.length > 0
    ? gradedResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / gradedResults.length : 0;

  const highestMarks = gradedResults.length > 0
    ? Math.max(...gradedResults.map(result => result.percentage || 0)) : 0;

  const gradeDistribution = gradedResults.reduce((acc, result) => {
    const grade = getGrade(result.percentage || 0);
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  const barData = {
    labels: gradedResults.map(result => `${result.exam?.subject?.substring(0, 8) || 'Exam'}-${result.exam?.examType || 'exam'}`),
    datasets: [{
      label: 'Percentage',
      data: gradedResults.map(result => result.percentage),
      backgroundColor: gradedResults.map(result =>
        result.percentage >= 80 ? 'rgba(72, 187, 120, 0.6)' :
        result.percentage >= 60 ? 'rgba(102, 126, 234, 0.6)' :
        result.percentage >= 40 ? 'rgba(237, 137, 54, 0.6)' : 'rgba(252, 129, 129, 0.6)'
      ),
      borderRadius: 8
    }]
  };

  const doughnutData = {
    labels: Object.keys(gradeDistribution),
    datasets: [{
      data: Object.values(gradeDistribution),
      backgroundColor: ['#48bb78', '#667eea', '#38a169', '#ed8936', '#ecc94b', '#fc8181', '#f56565'],
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
          <h1>🏆 My Marks</h1>
          <p>Track your academic performance</p>
        </motion.div>

        <div className="stats-grid">
          {[ 
            { icon: <FiAward />, color: 'purple', label: 'Graded Exams', value: gradedResults.length },
            { icon: <FiTrendingUp />, color: 'green', label: 'Average %', value: Math.round(avgPercentage), suffix: '%' },
            { icon: <FiTarget />, color: 'orange', label: 'Highest %', value: Math.round(highestMarks), suffix: '%' },
            { icon: <FiStar />, color: 'pink', label: 'Best Grade', value: 0, text: Object.keys(gradeDistribution).sort()[0] || 'N/A' }
          ].map((stat, i) => (
            <motion.div
              key={i} className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.text || <><CountUp end={stat.value} duration={2} />{stat.suffix || ''}</>}</h3>
                <p>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="content-grid" style={{ marginBottom: '25px' }}>
          <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3>Performance Overview</h3>
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#718096', maxRotation: 45 }, grid: { color: 'rgba(102,126,234,0.08)' } },
                y: { ticks: { color: '#718096' }, grid: { color: 'rgba(102,126,234,0.08)' }, max: 100 }
              }
            }} />
          </motion.div>

          <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3>Grade Distribution</h3>
            <div style={{ maxWidth: '250px', margin: '0 auto' }}>
              <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: { color: '#a0aec0' } } } }} />
            </div>
          </motion.div>
        </div>

        <motion.div className="table-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="table-header">
            <h3>Detailed Marks</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Remarks</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, i) => {
                const graded = result.status === 'graded';
                const percentage = result.percentage || 0;
                const grade = graded ? getGrade(percentage) : 'Pending';
                return (
                <motion.tr
                  key={result._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                >
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{result.exam?.subject || '-'}</td>
                  <td><span className="badge badge-info">{result.exam?.examType || 'exam'}</span></td>
                  <td>{graded ? `${result.score}/${result.totalMarks}` : 'Waiting for marks'}</td>
                  <td>
                    {graded ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{percentage.toFixed(1)}%</span>
                      <div className="progress-bar" style={{ width: '60px' }}>
                        <div className={`progress-fill ${percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : percentage >= 40 ? 'average' : 'poor'}`}
                          style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`badge ${grade === 'A+' || grade === 'A' ? 'badge-success' : grade === 'F' ? 'badge-danger' : grade === 'Pending' ? 'badge-info' : 'badge-warning'}`}>
                      {grade}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{result.feedback || '-'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(result.gradedAt || result.completedAt || result.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              );})}
            </tbody>
          </table>
          {results.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No Marks Yet</h3>
              <p>Your marks will appear here once teachers grade your work</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyMarks;
