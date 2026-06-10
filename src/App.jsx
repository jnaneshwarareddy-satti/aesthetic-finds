import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import RedirectPage from './pages/RedirectPage';
import Bio from './pages/Bio';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/bio" element={<Bio />} />
          <Route path="/link/:id" element={<RedirectPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
