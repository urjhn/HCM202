import Navbar from './components/Navbar'
import ContentSection from './components/ContentSection'
import TimelineSection from './components/TimelineSection'
import QuizButton from './components/QuizButton'
import QuizGame from './components/QuizGame'

function App() {
  const handleOpenQuiz = async () => {
    try {
      const quizGame = new QuizGame()
      window.quizGame = quizGame
      await quizGame.start()
    } catch {
      // User cancelled or dismissed the quiz
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <ContentSection />
      <TimelineSection />
      <QuizButton onClick={handleOpenQuiz} />
    </div>
  )
}

export default App
