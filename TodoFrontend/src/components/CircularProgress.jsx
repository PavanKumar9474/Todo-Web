import { useEffect, useRef } from 'react';

export function CircularProgress({ total, completed, size = 180, strokeWidth = 14 }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const circleRef = useRef(null);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = offset;
    }
  }, [offset]);

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 50) return '#6366f1'; // accent
    if (percentage >= 25) return '#f59e0b'; // amber
    return '#94a3b8'; // gray
  };

  return (
    <div className="circular-progress-wrapper">
      <svg width={size} height={size} className="circular-progress-svg">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="progress-arc"
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()}66)`,
          }}
        />
      </svg>
      <div className="circular-progress-center">
        <span className="circular-progress-percentage">{percentage}%</span>
        <span className="circular-progress-label">Complete</span>
      </div>
      <div className="circular-progress-stats">
        <span>{completed} of {total} tasks</span>
      </div>
    </div>
  );
}
