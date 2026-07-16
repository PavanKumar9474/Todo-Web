import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { TodoPage } from './pages/TodoPage';
import { LandingPage } from './pages/LandingPage';
import './App.css';
import { fetchMe } from './api';


function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const currentToken = localStorage.getItem('auth_token');
      if (!currentToken) {
        setIsValid(false);
        return;
      }

      try {
        await fetchMe();
        if (!cancelled) setIsValid(true);
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user_name');
        if (!cancelled) setIsValid(false);
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, [token]);


  if (isValid === null) return null;
  if (!isValid) return <Navigate to="/auth" replace />;
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
