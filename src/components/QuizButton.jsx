import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QuizButton.css';

const QuizButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="quiz-button-container"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      <motion.div
        className="quiz-button-inner"
        animate={{
          boxShadow: isHovered
            ? "0 8px 20px rgba(229, 57, 53, 0.6)"
            : "0 4px 12px rgba(229, 57, 53, 0.4)"
        }}
      >
        <motion.div
          className="quiz-icon"
          animate={{ 
            rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.5 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
        
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="quiz-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              QUIZ
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Ripple effects */}
      <motion.div
        className="ripple"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="ripple"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.div>
  );
};

export default QuizButton;
