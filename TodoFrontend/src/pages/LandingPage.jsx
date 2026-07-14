import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, Calendar, BarChart2, Shield, Star, ArrowRight, Sparkles } from 'lucide-react';
import '../landing.css';

const FEATURES = [
  {
    icon: <CheckCircle size={28} />,
    title: 'Smart Task Management',
    desc: 'Create, edit, and complete tasks with ease. Organize your day with a clean, intuitive interface.',
    color: '#10b981',
  },
  {
    icon: <Calendar size={28} />,
    title: 'Built-in Calendar',
    desc: 'View and manage tasks by any date. Color-coded dots show your workload at a glance.',
    color: '#6366f1',
  },
  {
    icon: <BarChart2 size={28} />,
    title: 'Progress Tracking',
    desc: 'Animated circular progress rings and daily stats keep you motivated and on track.',
    color: '#f59e0b',
  },
  {
    icon: <Shield size={28} />,
    title: 'Secure & Private',
    desc: 'Your data is yours. Everything is securely saved in your browser, ready for a backend upgrade.',
    color: '#8b5cf6',
  },
];

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Engineering Student', text: 'TaskFlow completely changed how I manage my assignments. The calendar view is a game-changer!', rating: 5 },
  { name: 'Arjun K.', role: 'MBA Student', text: 'The progress ring is so satisfying to fill up. I actually look forward to completing tasks now.', rating: 5 },
  { name: 'Neha M.', role: 'High School Student', text: 'Clean, fast, and beautiful. My whole study schedule is organized in one place.', rating: 5 },
];

const STEPS = [
  { step: '01', title: 'Create Account', desc: 'Sign up in seconds with your name, email, and password.' },
  { step: '02', title: 'Add Your Tasks', desc: 'Add your daily tasks and assign them to specific dates.' },
  { step: '03', title: 'Track & Complete', desc: 'Watch your progress ring fill up as you crush your goals!' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('auth_token') !== null;

  const handleCTA = () => {
    if (isLoggedIn) navigate('/dashboard');
    else navigate('/auth');
  };

  return (
    <div className="landing-root">

      {/* ── NAVBAR ─────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <Zap size={22} className="brand-icon" />
          <span>TaskFlow</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#testimonials">Reviews</a>
        </div>
        <div className="landing-nav-actions">
          {isLoggedIn ? (
            <button className="cta-btn-sm" onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
          ) : (
            <>
              <button className="ghost-btn" onClick={() => navigate('/auth')}>Log In</button>
              <button className="cta-btn-sm" onClick={() => navigate('/auth')}>Sign Up Free</button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ───────────────────────── */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>Built for Students, Loved by Everyone</span>
        </div>
        <h1 className="hero-title">
          Your Tasks.<br />
          <span className="hero-gradient">Your Progress.</span><br />
          Your Success.
        </h1>
        <p className="hero-subtitle">
          TaskFlow is a beautiful student dashboard that helps you manage daily tasks, 
          track your progress with stunning visuals, and never miss a deadline again.
        </p>
        <div className="hero-actions">
          <button className="cta-btn-primary" onClick={handleCTA}>
            Get Started — It's Free
            <ArrowRight size={18} />
          </button>
          <a href="#features" className="cta-btn-secondary">See Features</a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><strong>100%</strong><span>Free</span></div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><strong>0 sec</strong><span>Setup time</span></div>
          <div className="hero-stat-divider" />
          <div className="hero-stat"><strong>∞</strong><span>Tasks</span></div>
        </div>

        {/* Mock UI Preview */}
        <div className="hero-preview">
          <div className="preview-card">
            <div className="preview-header">
              <div className="preview-dot red" /><div className="preview-dot amber" /><div className="preview-dot green" />
              <span className="preview-title">TaskFlow Dashboard</span>
            </div>
            <div className="preview-body">
              <div className="preview-sidebar">
                <div className="preview-ring">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="10"/>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#6366f1" strokeWidth="10"
                      strokeLinecap="round" strokeDasharray="201" strokeDashoffset="50"
                      transform="rotate(-90 40 40)" style={{filter:'drop-shadow(0 0 6px #6366f188)'}}/>
                  </svg>
                  <div className="preview-ring-text">75%</div>
                </div>
                <div className="preview-cal-mini">
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(d => (
                    <div key={d} className={`preview-cal-cell ${d===14?'preview-cal-selected':''} ${[3,7,11].includes(d)?'preview-cal-dot':''}`}>{d}</div>
                  ))}
                </div>
              </div>
              <div className="preview-tasks">
                {[
                  {text: 'Math Assignment', done: true},
                  {text: 'Read Chapter 5', done: true},
                  {text: 'Physics Lab Report', done: false},
                  {text: 'Group Project Meeting', done: false},
                ].map((t, i) => (
                  <div key={i} className={`preview-task ${t.done ? 'preview-task-done' : ''}`}>
                    <div className={`preview-check ${t.done ? 'preview-check-done' : ''}`}>{t.done && '✓'}</div>
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Floating badges */}
          <div className="float-badge float-badge-1">🎯 3 tasks done today!</div>
          <div className="float-badge float-badge-2">📅 Calendar synced</div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────── */}
      <section id="features" className="features-section">
        <div className="section-label">Features</div>
        <h2 className="section-title">Everything you need to stay on top</h2>
        <p className="section-sub">Built with students in mind — powerful features wrapped in a beautiful interface.</p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{ color: f.color, background: `${f.color}18` }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────── */}
      <section id="how-it-works" className="steps-section">
        <div className="section-label">How it Works</div>
        <h2 className="section-title">Get started in 3 simple steps</h2>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < STEPS.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────── */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-label">Reviews</div>
        <h2 className="section-title">Loved by students everywhere</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({length: t.rating}).map((_, si) => (
                  <Star key={si} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name[0]}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────── */}
      <section className="cta-section">
        <div className="cta-content">
          <Zap size={36} className="cta-icon" />
          <h2>Ready to take control of your day?</h2>
          <p>Join thousands of students already using TaskFlow. Free forever.</p>
          <button className="cta-btn-primary cta-large" onClick={handleCTA}>
            Start Organizing Now
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <Zap size={18} />
          <span>TaskFlow</span>
        </div>
        <p>Built with ❤️ for students. © 2026 TaskFlow.</p>
      </footer>

    </div>
  );
}
