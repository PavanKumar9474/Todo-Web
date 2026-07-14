import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TodoForm } from '../components/TodoForm';
import { TodoItem } from '../components/TodoItem';
import { CircularProgress } from '../components/CircularProgress';
import { Calendar } from '../components/Calendar';
import {
  CheckCircle, Clock, Zap, Search,
  LayoutDashboard, CalendarDays, ListTodo, Star, TrendingUp,
  Briefcase, BookOpen, Heart, ShoppingCart, ChevronLeft, Plus,
  Home, Settings, Bell, HelpCircle, SlidersHorizontal
} from 'lucide-react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api';

/* ── helpers ── */
const toDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const todayKey = toDateKey(new Date());

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getUserName() {
  return localStorage.getItem('auth_user_name') || 'Student';
}

/* ── category config ── */
const CATEGORIES = [
  { key: 'personal', label: 'Personal', color: '#6366f1', icon: Home },
  { key: 'work', label: 'Work', color: '#f59e0b', icon: Briefcase },
  { key: 'study', label: 'Study', color: '#10b981', icon: BookOpen },
  { key: 'health', label: 'Health', color: '#ef4444', icon: Heart },
  { key: 'shopping', label: 'Shopping', color: '#8b5cf6', icon: ShoppingCart },
];

/* ── sidebar views ── */
const SIDEBAR_VIEWS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'today', label: 'Today', icon: CalendarDays },
  { key: 'upcoming', label: 'Upcoming', icon: Clock },
  { key: 'all', label: 'All Tasks', icon: ListTodo },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'important', label: 'Important', icon: Star },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp },
];

export function TodoPage() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [filter, setFilter] = useState('all');
  const [activeView, setActiveView] = useState('dashboard');
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await fetchTasks();
        setTodos(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    }
    loadTasks();
  }, []);

  /* ── CRUD ── */
  const addTodo = async (payload) => {
    const text = typeof payload === 'string' ? payload : payload.text;
    const dueDate = typeof payload === 'object' ? payload.dueDate : selectedDate;
    const category = typeof payload === 'object' ? payload.category : 'personal';
    const priority = typeof payload === 'object' ? payload.priority : 'medium';
    
    const taskPayload = {
      text,
      completed: false,
      date: selectedDate,
      dueDate: dueDate || selectedDate,
      category: category || 'personal',
      priority: priority || 'medium',
      important: false,
    };

    try {
      const createdTask = await createTask(taskPayload);
      setTodos((prev) => [createdTask, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const updated = await updateTask(id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteTask(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const updateTodo = async (id, newText) => {
    try {
      const updated = await updateTask(id, { text: newText });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to update task text:', err);
    }
  };

  const toggleImportant = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const updated = await updateTask(id, { important: !todo.important });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to toggle task importance:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_name');
    navigate('/');
  };

  /* ── computed data ── */
  const todayTodos = todos.filter((t) => (t.date || todayKey) === todayKey);
  const todayCompleted = todayTodos.filter((t) => t.completed).length;

  // Upcoming = tasks with due dates in the future
  const upcomingTodos = todos.filter((t) => {
    const due = t.dueDate || t.date || todayKey;
    return due > todayKey && !t.completed;
  });

  // Overdue
  const overdueTodos = todos.filter((t) => {
    const due = t.dueDate || t.date || todayKey;
    return due < todayKey && !t.completed;
  });

  // This week completed
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartKey = toDateKey(weekStart);
  const thisWeekCompleted = todos.filter((t) => t.completed && (t.date || todayKey) >= weekStartKey).length;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach((c) => { counts[c.key] = 0; });
    todos.forEach((t) => { const cat = t.category || 'personal'; if (counts[cat] !== undefined) counts[cat]++; });
    return counts;
  }, [todos]);

  /* ── view-based filtering ── */
  const getViewTodos = () => {
    let base = [...todos];
    switch (activeView) {
      case 'today':
        base = todayTodos;
        break;
      case 'upcoming':
        base = upcomingTodos;
        break;
      case 'completed':
        base = todos.filter((t) => t.completed);
        break;
      case 'important':
        base = todos.filter((t) => t.important);
        break;
      case 'all':
        break;
      case 'dashboard':
      default:
        base = todos.filter((t) => (t.date || todayKey) === selectedDate);
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = base.filter((t) => t.text.toLowerCase().includes(q));
    }

    // Apply status filter
    if (filter === 'active') base = base.filter((t) => !t.completed);
    if (filter === 'completed') base = base.filter((t) => t.completed);

    // Apply sort
    return base.sort((a, b) => {
      switch (sortOption) {
        case 'oldest': return new Date(a.created_at) - new Date(b.created_at);
        case 'dueAsc': return (a.dueDate || '').localeCompare(b.dueDate || '');
        case 'dueDesc': return (b.dueDate || '').localeCompare(a.dueDate || '');
        case 'alpha': return a.text.localeCompare(b.text);
        case 'priority': {
          const order = { high: 0, medium: 1, low: 2 };
          return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
        }
        case 'newest':
        default: return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  };

  const viewTodos = getViewTodos();
  const viewCompleted = viewTodos.filter((t) => t.completed).length;

  // Build tasksByDate map for calendar dots
  const tasksByDate = todos.reduce((acc, todo) => {
    const key = todo.date || todayKey;
    if (!acc[key]) acc[key] = { total: 0, completed: 0 };
    acc[key].total += 1;
    if (todo.completed) acc[key].completed += 1;
    return acc;
  }, {});

  const selectedTodos = todos.filter((t) => (t.date || todayKey) === selectedDate);
  const selectedCompleted = selectedTodos.filter((t) => t.completed).length;
  const isToday = selectedDate === todayKey;
  const displayDate = new Date(selectedDate + 'T00:00:00');
  const formattedDate = displayDate.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  /* ── view titles ── */
  const getViewTitle = () => {
    switch (activeView) {
      case 'today': return "Today's Tasks";
      case 'upcoming': return 'Upcoming Tasks';
      case 'completed': return 'Completed Tasks';
      case 'important': return 'Important Tasks';
      case 'all': return 'All Tasks';
      case 'analytics': return 'Analytics';
      case 'dashboard':
      default: return isToday ? "Today's Tasks" : formattedDate;
    }
  };

  const getViewSubtitle = () => {
    if (activeView === 'analytics') return 'Your productivity at a glance';
    if (viewTodos.length === 0) return 'No tasks found. Add one to get started!';
    return `${viewCompleted} of ${viewTodos.length} tasks completed`;
  };

  /* ── analytics view ── */
  const renderAnalytics = () => {
    const totalTasks = todos.length;
    const completedTasks = todos.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const productivityPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
      <div className="analytics-grid">
        <div className="analytics-card analytics-productivity">
          <h3 className="analytics-card-title">Productivity</h3>
          <div className="analytics-big-number">{productivityPercent}%</div>
          <p className="analytics-label">Overall Completion</p>
          <div className="analytics-bar-track">
            <div className="analytics-bar-fill" style={{ width: `${productivityPercent}%` }} />
          </div>
        </div>
        <div className="analytics-card">
          <h3 className="analytics-card-title">Overview</h3>
          <div className="analytics-stat-grid">
            <div className="analytics-stat">
              <span className="analytics-stat-value" style={{ color: 'var(--accent)' }}>{totalTasks}</span>
              <span className="analytics-stat-label">Total</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat-value" style={{ color: 'var(--success)' }}>{completedTasks}</span>
              <span className="analytics-stat-label">Done</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat-value" style={{ color: 'var(--amber)' }}>{pendingTasks}</span>
              <span className="analytics-stat-label">Pending</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat-value" style={{ color: 'var(--danger)' }}>{overdueTodos.length}</span>
              <span className="analytics-stat-label">Overdue</span>
            </div>
          </div>
        </div>
        <div className="analytics-card">
          <h3 className="analytics-card-title">This Week</h3>
          <div className="analytics-big-number" style={{ color: 'var(--success)' }}>{thisWeekCompleted}</div>
          <p className="analytics-label">Tasks Completed</p>
        </div>
        <div className="analytics-card">
          <h3 className="analytics-card-title">By Category</h3>
          <div className="analytics-category-list">
            {CATEGORIES.map((cat) => (
              <div key={cat.key} className="analytics-category-row">
                <span className="analytics-cat-dot" style={{ background: cat.color }} />
                <span className="analytics-cat-label">{cat.label}</span>
                <span className="analytics-cat-count">{categoryCounts[cat.key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-root">
      {/* Top Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="nav-brand">
            <Zap size={22} className="nav-icon" />
            <span>TaskFlow</span>
          </div>
        </div>
        <div className="nav-center">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks, projects, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-shortcut">⌘ K</span>
          </div>
        </div>
        <div className="nav-right">
          <button className="nav-action-btn" aria-label="Notifications"><Bell size={18} /></button>
          <div className="nav-avatar" onClick={handleLogout} title="Click to logout">
            <span>{getUserName().charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </nav>

      <div className="dashboard-body">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Add New Task Button */}
          <button className="sidebar-add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            {!sidebarCollapsed && <span>Add New Task</span>}
          </button>

          {/* Navigation */}
          <div className="sidebar-section">
            {SIDEBAR_VIEWS.map((v) => {
              const Icon = v.icon;
              const count = v.key === 'today' ? todayTodos.length
                : v.key === 'upcoming' ? upcomingTodos.length
                : v.key === 'completed' ? todos.filter(t => t.completed).length
                : v.key === 'important' ? todos.filter(t => t.important).length
                : v.key === 'all' ? todos.length
                : null;
              return (
                <button
                  key={v.key}
                  className={`sidebar-item ${activeView === v.key ? 'active' : ''}`}
                  onClick={() => { setActiveView(v.key); setFilter('all'); }}
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="sidebar-item-label">{v.label}</span>
                      {count !== null && <span className="sidebar-badge">{count}</span>}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Projects / Categories */}
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              {!sidebarCollapsed && <span>PROJECTS</span>}
              <button className="sidebar-section-action" title="Add Project"><Plus size={14} /></button>
            </div>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  className="sidebar-item"
                  onClick={() => { /* future category filter */ }}
                >
                  <Icon size={18} style={{ color: cat.color, minWidth: '18px' }} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="sidebar-item-label">{cat.label}</span>
                      <span className="sidebar-badge">{categoryCounts[cat.key]}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tags */}
          {!sidebarCollapsed && (
            <div className="sidebar-section">
              <div className="sidebar-section-header">
                <span>TAGS</span>
                <button className="sidebar-section-action" title="Add Tag"><Plus size={14} /></button>
              </div>
              <div className="sidebar-tags">
                {[
                  { label: 'Urgent', color: '#ef4444' },
                  { label: 'Meeting', color: '#6366f1' },
                  { label: 'Study', color: '#10b981' },
                  { label: 'Home', color: '#f59e0b' },
                  { label: 'Work', color: '#3b82f6' },
                ].map((tag) => (
                  <span key={tag.label} className="sidebar-tag" style={{ background: tag.color + '22', color: tag.color, borderColor: tag.color + '44' }}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom section */}
          <div className="sidebar-bottom">
            <button className="sidebar-item"><Settings size={18} />{!sidebarCollapsed && <span className="sidebar-item-label">Settings</span>}</button>
            <button className="sidebar-item"><HelpCircle size={18} />{!sidebarCollapsed && <span className="sidebar-item-label">Help</span>}</button>
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{getUserName().charAt(0).toUpperCase()}</div>
              {!sidebarCollapsed && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{getUserName()}</span>
                  <span className="sidebar-user-email">student@example.com</span>
                </div>
              )}
              {!sidebarCollapsed && <button className="sidebar-user-menu" aria-label="Menu"><ChevronLeft size={16} style={{ transform: 'rotate(270deg)' }} /></button>}
            </div>

            <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <ChevronLeft size={18} style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          {/* Greeting Banner */}
          {activeView === 'dashboard' && (
            <div className="greeting-banner">
              <div className="greeting-banner-text">
                <h1 className="greeting-title">{getGreeting()}, {getUserName()} 👋</h1>
                <p className="greeting-subtitle">Let's make today productive.</p>
              </div>
            </div>
          )}

          {/* Stats Cards Row */}
          {activeView === 'dashboard' && (
            <div className="stats-cards-row">
              <div className="stat-card-new">
                <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <CheckCircle size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{todayTodos.length}</span>
                  <span className="stat-card-label">Tasks Today</span>
                  <span className="stat-card-sub">{todayCompleted} completed</span>
                </div>
              </div>
              <div className="stat-card-new">
                <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                  <CalendarDays size={22} style={{ color: '#3b82f6' }} />
                </div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{upcomingTodos.length}</span>
                  <span className="stat-card-label">Upcoming</span>
                  <span className="stat-card-sub">Next 7 days</span>
                </div>
              </div>
              <div className="stat-card-new">
                <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <CheckCircle size={22} style={{ color: '#10b981' }} />
                </div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{thisWeekCompleted}</span>
                  <span className="stat-card-label">Completed</span>
                  <span className="stat-card-sub">This week</span>
                </div>
              </div>
              <div className="stat-card-new">
                <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <Star size={22} style={{ color: '#f59e0b' }} />
                </div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{todos.filter(t => t.important).length}</span>
                  <span className="stat-card-label">Important</span>
                  <span className="stat-card-sub">High priority</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area with optional right panel */}
          <div className="main-content-grid">
            {/* Task List Column */}
            <div className="task-list-column">
              {/* Header */}
              <div className="task-list-header">
                <div>
                  <h2 className="task-list-title">{getViewTitle()}</h2>
                  <p className="task-list-subtitle">{getViewSubtitle()}</p>
                </div>
                <div className="task-list-actions">
                  {!isToday && activeView === 'dashboard' && (
                    <button className="today-btn" onClick={() => setSelectedDate(todayKey)}>
                      Go to Today
                    </button>
                  )}
                </div>
              </div>

              {/* Filters + Sort Bar */}
              <div className="filter-sort-bar">
                <div className="filter-pills">
                  {['all', 'active', 'completed'].map((f) => (
                    <button
                      key={f}
                      className={`filter-pill ${filter === f ? 'active' : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {f === 'all' ? `All (${viewTodos.length})` : f === 'active' ? `Pending (${viewTodos.filter(t => !t.completed).length})` : `Completed (${viewTodos.filter(t => t.completed).length})`}
                    </button>
                  ))}
                </div>
                <div className="sort-controls">
                  <SlidersHorizontal size={14} />
                  <select
                    className="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="dueAsc">Due Date ↑</option>
                    <option value="dueDesc">Due Date ↓</option>
                    <option value="alpha">Alphabetical</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar (for non-today in dashboard view) */}
              {activeView === 'dashboard' && !isToday && selectedTodos.length > 0 && (
                <div className="selected-progress-bar">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${(selectedCompleted / selectedTodos.length) * 100}%` }} />
                  </div>
                  <span className="progress-bar-label">{Math.round((selectedCompleted / selectedTodos.length) * 100)}%</span>
                </div>
              )}

              {/* Analytics View */}
              {activeView === 'analytics' ? renderAnalytics() : (
                <div className="main-todo-card">
                  {/* Inline add task */}
                  <TodoForm onAdd={addTodo} selectedDate={selectedDate} categories={CATEGORIES} />

                  {/* Task List */}
                  <div className="todo-list">
                    {viewTodos.length === 0 ? (
                      <div className="empty-state">
                        <ListTodo size={48} />
                        <p>No tasks found. Time to relax or add a new one!</p>
                      </div>
                    ) : (
                      viewTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onToggle={toggleTodo}
                          onDelete={deleteTodo}
                          onUpdate={updateTodo}
                          onToggleImportant={toggleImportant}
                          categories={CATEGORIES}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Add New Task floating button */}
              {viewTodos.length > 0 && activeView !== 'analytics' && (
                <button className="fab-add" onClick={() => setShowAddModal(true)}>
                  <Plus size={22} /> Add New Task
                </button>
              )}
            </div>

            {/* Right Panel (Calendar + Progress + Upcoming) – only on dashboard */}
            {activeView === 'dashboard' && (
              <div className="right-panel">
                {/* Calendar */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <h3>Calendar</h3>
                    <button className="panel-link" onClick={() => {}}>View full calendar</button>
                  </div>
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    tasksByDate={tasksByDate}
                  />
                </div>

                {/* Productivity */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <h3>Productivity</h3>
                    <span className="panel-badge">This Week</span>
                  </div>
                  <CircularProgress total={todayTodos.length} completed={todayCompleted} />
                  <div className="productivity-legend">
                    <div className="legend-item"><span className="legend-dot-new" style={{ background: 'var(--success)' }} /> Completed <strong>{todayCompleted}</strong></div>
                    <div className="legend-item"><span className="legend-dot-new" style={{ background: 'var(--accent)' }} /> In Progress <strong>{todayTodos.filter(t => !t.completed).length}</strong></div>
                    <div className="legend-item"><span className="legend-dot-new" style={{ background: 'var(--amber)' }} /> Pending <strong>{upcomingTodos.length}</strong></div>
                    <div className="legend-item"><span className="legend-dot-new" style={{ background: 'var(--danger)' }} /> Overdue <strong>{overdueTodos.length}</strong></div>
                  </div>
                </div>

                {/* Upcoming */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <h3>Upcoming</h3>
                    <button className="panel-link" onClick={() => setActiveView('upcoming')}>View all</button>
                  </div>
                  <div className="upcoming-list">
                    {upcomingTodos.slice(0, 4).map((t) => {
                      const cat = CATEGORIES.find((c) => c.key === (t.category || 'personal'));
                      return (
                        <div key={t.id} className="upcoming-item">
                          <span className="upcoming-dot" style={{ background: cat?.color || 'var(--accent)' }} />
                          <div className="upcoming-info">
                            <span className="upcoming-text">{t.text}</span>
                            <span className="upcoming-date">
                              {new Date(t.dueDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {upcomingTodos.length === 0 && <p className="upcoming-empty">No upcoming tasks</p>}
                  </div>
                </div>

                {/* Quick Add */}
                <div className="panel-card quick-add-card">
                  <h3>Quick Add</h3>
                  <TodoForm onAdd={addTodo} selectedDate={selectedDate} categories={CATEGORIES} compact />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add New Task</h2>
            <TodoForm onAdd={addTodo} selectedDate={selectedDate} categories={CATEGORIES} expanded />
            <button className="modal-close" onClick={() => setShowAddModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
