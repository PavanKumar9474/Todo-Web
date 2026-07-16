const API_BASE = 'http://127.0.0.1:8000/api/';

/**
 * Helper to construct request headers including Django Token Auth.
 */
function getHeaders() {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}

/**
 * Fetch all tasks for the logged in user from the backend.
 */
export async function fetchTasks() {
  const res = await fetch(`${API_BASE}tasks/`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

/**
 * Create a new task.
 */
export async function createTask(data) {
  const res = await fetch(`${API_BASE}tasks/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

/**
 * Update an existing task (partial update).
 */
export async function updateTask(id, data) {
  const res = await fetch(`${API_BASE}tasks/${id}/`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

/**
 * Delete a task.
 */
export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}tasks/${id}/`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

/**
 * Log in a user.
 */
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.non_field_errors?.[0] || 'Login failed');
  }
  return res.json();
}

/**
 * Register a new user.
 */
export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Registration failed');
  }
  return res.json();
}

/**
 * Validate current token and return user info.
 */
export async function fetchMe() {
  const res = await fetch(`${API_BASE}me/`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Unauthorized');
  }
  return res.json();
}


