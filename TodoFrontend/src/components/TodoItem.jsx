import { useState, useRef, useEffect } from 'react';
import { Trash2, Edit2, Check, X, Star, CalendarDays } from 'lucide-react';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  low:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

export function TodoItem({ todo, onToggle, onDelete, onUpdate, onToggleImportant, categories = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (editText.trim() && editText !== todo.text) {
      onUpdate(todo.id, editText.trim());
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const cat = categories.find((c) => c.key === (todo.category || 'personal'));
  const priority = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium;
  const dueDate = todo.dueDate || todo.due_date || '';

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {!isEditing && (
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
      )}

      <div className="todo-text-container">
        {isEditing ? (
          <form onSubmit={handleSubmit} style={{ margin: 0 }}>
            <input
              ref={inputRef}
              type="text"
              className="todo-edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
            />
          </form>
        ) : (
          <>
            <span className="todo-text">{todo.text}</span>
            <div className="todo-meta">
              {cat && (
                <span className="todo-chip" style={{ background: cat.color + '18', color: cat.color, borderColor: cat.color + '33' }}>
                  {cat.label}
                </span>
              )}
              <span className="todo-chip" style={{ background: priority.bg, color: priority.color, borderColor: priority.color + '33' }}>
                {priority.label}
              </span>
              {dueDate && (
                <span className="todo-chip todo-chip--date">
                  <CalendarDays size={11} />
                  {new Date(dueDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button className="action-btn save" onClick={handleSubmit} aria-label="Save changes">
              <Check size={18} />
            </button>
            <button
              className="action-btn"
              onClick={() => { setEditText(todo.text); setIsEditing(false); }}
              aria-label="Cancel editing"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              className={`action-btn star ${todo.important ? 'active' : ''}`}
              onClick={() => onToggleImportant(todo.id)}
              aria-label="Mark task as important"
              style={{ color: todo.important ? '#f59e0b' : 'inherit' }}
            >
              <Star size={18} fill={todo.important ? '#f59e0b' : 'none'} />
            </button>
            <button
              className="action-btn edit"
              onClick={() => setIsEditing(true)}
              aria-label="Edit task"
            >
              <Edit2 size={18} />
            </button>
            <button
              className="action-btn delete"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete task"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
