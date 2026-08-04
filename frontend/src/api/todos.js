import api from './client';

export const getTodos = async () => {
  const res = await api.get('/todos');
  return res.data;
};

export const createTodo = async (todo) => {
  const res = await api.post('/todos', todo);
  return res.data;
};

// updateTodo is exported but NEVER used anywhere in the UI (incomplete feature)
export const updateTodo = async (id, updates) => {
  const res = await api.put(`/todos/${id}`, updates);
  return res.data;
};

export const deleteTodo = async (id) => {
  const res = await api.delete(`/todos/${id}`);
  return res.data;
};

export const toggleTodo = async (id) => {
  const res = await api.patch(`/todos/${id}/toggle`);
  return res.data;
};
