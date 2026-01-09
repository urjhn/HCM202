import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ThreeBackgroundButton.css'

const ThreeBackgroundButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="three-bg-button-container"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.6,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      <motion.div
        className="three-bg-button-inner"
        animate={{
          boxShadow: isHovered
            ? '0 8px 20px rgba(229, 57, 53, 0.6)'
            : '0 4px 12px rgba(229, 57, 53, 0.4)',
        }}
      >
        <motion.div
          className="three-bg-icon"
          animate={{
            rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l9 5-9 5-9-5 9-5zm9 7v8l-9 5v-8l9-5zm-18 0l9 5v8l-9-5V9z"
              fill="currentColor"
            />
          </svg>
        </motion.div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="three-bg-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              3D
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="three-bg-ripple"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="three-bg-ripple"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </motion.div>
  )
}

export default ThreeBackgroundButton
