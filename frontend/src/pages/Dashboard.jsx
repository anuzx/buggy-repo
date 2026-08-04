import { useEffect, useState } from 'react';
import { getTodos, createTodo, deleteTodo, toggleTodo } from '../api/todos';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  // BUG: search state is declared but never wired to anything (dead code)
  const [search, setSearch] = useState('');

  useEffect(() => {
    // BUG: runs once on mount with an empty dependency array. After a fresh
    // login/logout or user switch the list is NEVER refetched.
    // BUG: no abort / mounted-check - if the component unmounts before the
    // promise resolves we set state on an unmounted component.
    // (StrictMode double-invokes this effect in dev too, so todos are fetched twice)
    getTodos()
      .then(setTodos)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load todos'));
  }, []);

  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;

  const handleAdd = async (e) => {
    e.preventDefault();
    // BUG: whitespace-only titles pass ("   " is truthy)
    if (!title) return;

    // BUG: optimistic entry added first...
    const optimistic = { title, completed: false, _id: `temp-${Date.now()}` };
    setTodos([...todos, optimistic]);

    try {
      const saved = await createTodo({ title });
      // BUG: ...then the server response is appended too -> DUPLICATE entry.
      // Both setTodos calls also use the stale `todos` closure, so rapid
      // adds can silently drop previous items.
      setTodos([...todos, saved]);
      setTitle('');
    } catch (err) {
      // BUG: on failure the ghost optimistic entry stays in the list forever.
      setError(err.response?.data?.message || 'Failed to create todo');
    }
  };

  const handleToggle = async (todo) => {
    // BUG: optimistic UI flip with NO rollback on error. If the request
    // fails the checkbox stays flipped and is out of sync with the server.
    setTodos((prev) =>
      prev.map((t) => (t._id === todo._id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await toggleTodo(todo._id);
    } catch (err) {
      console.error('toggle failed', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      // BUG: no rollback and no feedback - the todo just stays with no explanation
      setError('Failed to delete todo');
    }
  };

  // BUG: logs the whole user object (incl. the JWT stored in it) to the console
  console.log('current user', user);

  return (
    <div className="container">
      <header className="header">
        <h1>My Todos</h1>
        {user && <p>Logged in as {user.name}</p>}
        <button onClick={logout}>Logout</button>
      </header>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {/* BUG: button not disabled while the request is in flight -> double-submits */}
        <button type="submit">Add</button>
      </form>

      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
        <span>{completedCount} of {todos.length} completed</span>
      </div>

      <ul className="todo-list">
        {/* BUG: uses array index as React key -> broken reconciliation when
             the list is filtered/reordered (stale state, wrong element animations) */}
        {visibleTodos.map((todo, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo)}
            />
            <span className={todo.completed ? 'done' : ''}>{todo.title}</span>
            <button onClick={() => handleDelete(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>

      {visibleTodos.length === 0 && <p className="empty">No todos here yet.</p>}
    </div>
  );
}
