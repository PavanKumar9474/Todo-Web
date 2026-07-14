import { TodoItem } from './TodoItem';
import { ListTodo } from 'lucide-react';

export function TodoList({ todos, onToggle, onDelete, onUpdate }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <ListTodo size={48} />
        <p>No tasks found. Time to relax or add a new one!</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
