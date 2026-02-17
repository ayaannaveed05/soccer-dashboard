import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Teams from './pages/Teams'
import Predict from './pages/Predict'
import Login from './pages/Login'
import Register from './pages/Register'
import Favourites from './pages/Favourites'
import Standings from './pages/Standings'
import HowItWorks from './pages/HowItWorks'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}