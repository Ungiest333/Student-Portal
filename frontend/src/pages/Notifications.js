import React from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle } from 'react-icons/fi';

const mockNotifications = [
  {
    id: 1, type: 'info', icon: <FiInfo />,
    title: 'New Assignment Posted',
    message: 'A new React.js assignment has been posted. Due in 3 days.',
    time: '2 hours ago', read: false,
  },
  {
    id: 2, type: 'success', icon: <FiCheckCircle />,
    title: 'Submission Graded',
    message: 'Your Node.js assignment has been graded. You scored 88/100.',
    time: '1 day ago', read: false,
  },
  {
    id: 3, type: 'warning', icon: <FiAlertCircle />,
    title: 'Exam Reminder',
    message: 'Your JavaScript exam is scheduled for tomorrow at 10:00 AM.',
    time: '2 days ago', read: true,
  },
  {
    id: 4, type: 'info', icon: <FiInfo />,
    title: 'Welcome to Universal CodeBox',
    message: 'Your account has been set up successfully. Explore your dashboard.',
    time: '5 days ago', read: true,
  },
];

const colorMap = {
  info:    { bg: 'rgba(102, 126, 234, 0.1)', border: 'rgba(102, 126, 234, 0.3)', color: '#667eea' },
  success: { bg: 'rgba(72, 199, 142, 0.1)',  border: 'rgba(72, 199, 142, 0.3)',  color: '#48c78e' },
  warning: { bg: 'rgba(255, 183, 77, 0.1)',  border: 'rgba(255, 183, 77, 0.3)',  color: '#ffb74d' },
};

const Notifications = () => {
  return (
    <div style={{ padding: '30px', maxWidth: '700px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <FiBell size={24} color="#667eea" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Notifications</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
          You have {mockNotifications.filter(n => !n.read).length} unread notifications
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mockNotifications.map((notif, i) => {
            const c = colorMap[notif.type];
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: notif.read ? 'var(--card-bg)' : c.bg,
                  border: `1px solid ${notif.read ? 'var(--border)' : c.border}`,
                  borderRadius: '14px',
                  padding: '18px 20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  position: 'relative',
                }}
              >
                {/* Unread dot */}
                {!notif.read && (
                  <div style={{
                    position: 'absolute', top: '18px', right: '18px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: c.color,
                  }} />
                )}

                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: c.bg, border: `1px solid ${c.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: c.color, fontSize: '1.1rem', flexShrink: 0,
                }}>
                  {notif.icon}
                </div>

                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{notif.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Notifications;