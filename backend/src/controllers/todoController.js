const Todo = require('../models/Todo');

// GET /api/todos
// BUG: ownership filter missing - returns EVERY user's todos
const getTodos = async (req, res, next) => {
  try {
    // Should be: Todo.find({ userId: req.user.id })
    const todos = await Todo.find({});
    res.json(todos);
  } catch (error) {
    next(error);
  }
};

// GET /api/todos/:id
const getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    // BUG: no ownership check - any logged-in user can read another user's todo.
    // An invalid ObjectId (e.g. "abc") throws a CastError which bubbles up to the
    // global handler and leaks a stack trace.
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// POST /api/todos
const createTodo = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // BUG: mass assignment - spreading req.body AFTER the defaults lets a client
    // override userId (steal ownership), completed, dueDate, etc.
    const todo = await Todo.create({
      title,
      description: description || '',
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

// PUT /api/todos/:id
const updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // BUG: no ownership check - users can edit other users' todos.
    // BUG: description updates are silently ignored.
    if (req.body.title) todo.title = req.body.title;

    // BUG: ignores the requested value and ALWAYS toggles
    todo.completed = !todo.completed;

    // BUG: updatedAt is never refreshed
    const updated = await todo.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/todos/:id
const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // BUG: no ownership check - users can delete other users' todos.
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo removed' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/todos/:id/toggle
const toggleTodo = async (req, res, next) => {
  try {
    // BUG: find-then-save is not atomic - two concurrent toggles can race.
    // BUG: no ownership check.
    const todo = await Todo.findById(req.params.id);
    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
};
