import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiRobot2Fill } from 'react-icons/ri';
import './ChatBot.css';

// Botpress Shareable URL từ dashboard (ẩn Share và Branding)
const BOTPRESS_URL = "https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2026/01/10/13/20260110133945-AFAT58KI.json&hideWidget=true&showPoweredBy=false";

export default function ChatBot() {
    const [isWebchatOpen, setIsWebchatOpen] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [hasShownGreeting, setHasShownGreeting] = useState(false);

    // Hiện greeting bubble sau 3 giây
    useEffect(() => {
        if (!hasShownGreeting) {
            const timer = setTimeout(() => {
                setShowGreeting(true);
                setHasShownGreeting(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasShownGreeting]);

    // Ẩn greeting khi mở chat
    useEffect(() => {
        if (isWebchatOpen) {
            setShowGreeting(false);
        }
    }, [isWebchatOpen]);

    const toggleWebchat = () => {
        setIsWebchatOpen((prev) => !prev);
        setShowGreeting(false);
    };

    return (
        <div className="chatbot-container">
            {/* Greeting Bubble */}
            <AnimatePresence>
                {showGreeting && !isWebchatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="greeting-bubble"
                        onClick={toggleWebchat}
                    >
                        <div className="greeting-content">
                            <span className="greeting-wave">👋</span>
                            <p>Xin chào! Tôi có thể hỗ trợ cho bạn gì không?</p>
                        </div>
                        <div className="greeting-arrow"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom FAB Button - Modern Robot Icon */}
            <motion.button
                className="chatbot-fab"
                onClick={toggleWebchat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    boxShadow: isWebchatOpen
                        ? "0 4px 20px rgba(100, 149, 237, 0.4)"
                        : ["0 4px 20px rgba(100, 149, 237, 0.3)", "0 8px 30px rgba(100, 149, 237, 0.5)", "0 4px 20px rgba(100, 149, 237, 0.3)"]
                }}
                transition={{
                    boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
            >
                <div className="fab-inner">
                    {isWebchatOpen ? (
                        <motion.span
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 180 }}
                            className="close-icon"
                        >
                            ✕
                        </motion.span>
                    ) : (
                        <motion.div
                            className="robot-icon"
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <RiRobot2Fill size={32} />
                        </motion.div>
                    )}
                </div>

                {/* Ripple effect */}
                {!isWebchatOpen && (
                    <>
                        <span className="ripple ripple-1"></span>
                        <span className="ripple ripple-2"></span>
                    </>
                )}
            </motion.button>

            {/* Webchat Container with iframe */}
            <AnimatePresence>
                {isWebchatOpen && (
                    <motion.div
                        className="webchat-wrapper"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <button className="webchat-close-btn" onClick={toggleWebchat}>
                            ✕
                        </button>
                        <iframe
                            src={BOTPRESS_URL}
                            title="Chatbot Tư tưởng HCM"
                            className="webchat-iframe"
                            allow="microphone"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
