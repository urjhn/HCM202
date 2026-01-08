import Navbar from './components/Navbar'
import ContentSection from './components/ContentSection'
import TimelineSection from './components/TimelineSection'

function App() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <ContentSection />
      <TimelineSection />
    </div>
  )
}

export default App
