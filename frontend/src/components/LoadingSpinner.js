import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="loading-container">
    <motion.div
      className="loading-spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{ color: 'var(--text-secondary)' }}
    >
      Loading...
    </motion.p>
  </div>
);

export default LoadingSpinner;