import { useEffect } from 'react'
import ThreeBackground from './components/ThreeBackground'
import QuizButton from './components/QuizButton'
import QuizGame from './components/QuizGame'
import './App.css'

function App() {
  useEffect(() => {
    // Initialize quiz game instance
    window.quizGame = new QuizGame();
  }, []);

  const handleQuizClick = () => {
    window.quizGame.start();
  };

  return (
    <div className="app-container">
      <ThreeBackground />
      
      

      <QuizButton onClick={handleQuizClick} />
    </div>
  )
}

export default App
