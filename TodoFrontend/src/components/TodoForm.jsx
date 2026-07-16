import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

export function TodoForm({ onAdd, selectedDate, categories = [], compact = false, expanded = false }) {
  // Ensure clicks on the + (submit) button work even if the user previously
  // typed something and the UI rerenders.
  // submit handler prevents default and calls onAdd().
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState(selectedDate || '');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [showExtra, setShowExtra] = useState(expanded);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd({ text: text.trim(), dueDate: dueDate || selectedDate, category, priority });
      setText('');
      setDueDate(selectedDate || '');
      setCategory('personal');
      setPriority('medium');
      if (!expanded) setShowExtra(false);
    }
  };

  return (
    <form className={`todo-form ${compact ? 'todo-form--compact' : ''} ${expanded ? 'todo-form--expanded' : ''}`} onSubmit={handleSubmit}>
      {/* Main row */}
      <div className="todo-form-row">
        <input
          type="text"
          className="todo-input"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {!compact && (
          <button
            type="button"
            className="todo-expand-btn"
            onClick={() => setShowExtra(!showExtra)}
            aria-label="Toggle extra options"
          >
            <ChevronDown size={16} style={{ transform: showExtra ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        )}
        <button
          type="submit"
          className="todo-submit"
          disabled={!text.trim()}
          aria-label="Add task"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Extra fields */}
      {(showExtra || compact) && (
        <div className="todo-form-extra">
          <input
            type="date"
            className="todo-due-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
          />
          {categories.length > 0 && (
            <select
              className="todo-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          )}
          <select
            className="todo-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Priority"
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      )}
    </form>
  );
}
