import logo from './logo.svg';
import './App.css';
import NavBar from './Components/layout/NavBar';
import Signup from './Components/pages/Signup';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './Components/pages/Login';
import GitHubAnalysis from './Components/pages/Github';
import Projects from './Components/pages/Projects';
import ProjectDetails from './Components/pages/ProjectDetails';

// Create a separate component that uses useLocation
function AppContent() {
  // useLocation can be used here because it's inside Router
  const { pathname } = window.location; // Alternative without useLocation
  
  return (
    <div className="App">
      {/* Only show NavBar on authenticated pages */}
      {pathname !== "/login" && pathname !== "/signup" && <NavBar />}
      
      <Routes>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/githubanalysis" element={<GitHubAnalysis />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/" element={<Navigate to="/login" />} />
        
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;