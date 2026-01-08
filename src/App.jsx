import { useEffect, useState } from 'react'
import ThreeBackground from './components/ThreeBackground'
import QuizButton from './components/QuizButton'
import QuizGame from './components/QuizGame'
import './App.css'
import ContentSection from './components/ContentSection'


function App() {
  const [showThree, setShowThree] = useState(false);

  useEffect(() => {
    // Initialize quiz game instance
    window.quizGame = new QuizGame();
  }, []);

  const handleQuizClick = () => {
    window.quizGame.start();
  };

  return (
    <div className="App">
      {/* Nội dung chính của web */}
      <ContentSection />
      <QuizButton onClick={handleQuizClick} />

      {/* Nút 3D Experience - Circular Design */}
      <div 
        onClick={() => setShowThree(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          zIndex: 999,
          transition: 'all 0.3s ease',
          border: '3px solid #fff'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }}
      >
        <span style={{ 
          color: 'white', 
          fontSize: '32px'
        }}>✨</span>
        <span style={{
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          marginTop: '4px',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>3D</span>
      </div>

      {/* Hiển thị ThreeBackground khi state là true */}
      {showThree && (
        <ThreeBackground onClose={() => setShowThree(false)} />
      )}
    </div>
  );
}

export default App
