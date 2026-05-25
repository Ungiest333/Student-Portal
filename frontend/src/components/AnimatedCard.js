import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;