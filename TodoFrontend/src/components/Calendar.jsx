import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function Calendar({ selectedDate, onDateSelect, tasksByDate }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const goToPrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const toKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (day) => {
    const key = toKey(year, month, day);
    return key === selectedDate;
  };

  const hasTasks = (day) => {
    const key = toKey(year, month, day);
    return tasksByDate[key] && tasksByDate[key].total > 0;
  };

  const getTaskDot = (day) => {
    const key = toKey(year, month, day);
    const data = tasksByDate[key];
    if (!data || data.total === 0) return null;
    if (data.completed === data.total) return 'dot-completed';
    return 'dot-pending';
  };

  const handleDayClick = (day) => {
    onDateSelect(toKey(year, month, day));
  };

  // Build calendar grid
  const cells = [];
  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false, overflow: 'prev' });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  // Next month overflow to fill 6 rows
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, overflow: 'next' });
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="cal-nav-btn" onClick={goToPrevMonth} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <span className="calendar-month-label">
          {MONTHS[month]} {year}
        </span>
        <button className="cal-nav-btn" onClick={goToNextMonth} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-grid-header">
        {DAYS.map((d) => (
          <div key={d} className="cal-day-name">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((cell, idx) => (
          <button
            key={idx}
            className={[
              'cal-cell',
              !cell.currentMonth ? 'cal-cell-muted' : '',
              cell.currentMonth && isToday(cell.day) ? 'cal-cell-today' : '',
              cell.currentMonth && isSelected(cell.day) ? 'cal-cell-selected' : '',
              cell.currentMonth && hasTasks(cell.day) ? 'cal-cell-has-tasks' : '',
            ].join(' ')}
            onClick={() => cell.currentMonth && handleDayClick(cell.day)}
            disabled={!cell.currentMonth}
          >
            {cell.day}
            {cell.currentMonth && (
              <span className={`cal-dot ${getTaskDot(cell.day) || ''}`} />
            )}
          </button>
        ))}
      </div>

      <div className="calendar-legend">
        <span><span className="legend-dot dot-pending"></span> In Progress</span>
        <span><span className="legend-dot dot-completed"></span> All Done</span>
      </div>
    </div>
  );
}
