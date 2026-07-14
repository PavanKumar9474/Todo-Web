import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { TodoPage } from './pages/TodoPage';
import { LandingPage } from './pages/LandingPage';
import './App.css';

// A simple protected route wrapper
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('auth_token') !== null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
