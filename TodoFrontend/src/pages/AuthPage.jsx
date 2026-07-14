import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { loginUser, registerUser } from '../api';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      if (!isLogin) {
        // --- REGISTER ---
        if (!formData.name) { setError('Name is required'); return; }
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }

        const data = await registerUser(formData.name, formData.email, formData.password);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user_name', data.user_name);
        navigate('/dashboard');
      } else {
        // --- LOGIN ---
        const data = await loginUser(formData.email, formData.password);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user_name', data.user_name);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Zap size={24} />
          <span>TaskFlow</span>
        </div>

        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to access your dashboard.' : 'Sign up and start organizing your studies.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {successMsg && (
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              color: 'var(--success)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              border: '1px solid rgba(16,185,129,0.2)',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {successMsg}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text" id="name" name="name"
                placeholder="John Doe"
                value={formData.name} onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email </label>
            <input
              type="email" id="email" name="email"
              placeholder="you@gmail.com"
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password" id="password" name="password"
              placeholder="••••••••"
              value={formData.password} onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Re-enter Password</label>
              <input
                type="password" id="confirmPassword" name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword} onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="toggle-btn" onClick={switchMode}>
              {isLogin ? 'Register now' : 'Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
