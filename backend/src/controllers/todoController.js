import Todo from "../models/Todo.js";

export async function getTodos(_req, res) {
  try {
    const todos = await Todo.find({ user: _req.userId }).sort({ order: 1, createdAt: 1 }).lean();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch todos" });
  }
}

export async function createTodo(req, res) {
  try {
    const { title, completed } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const maxOrder = await Todo.findOne({ user: req.userId })
      .sort({ order: -1 })
      .select("order")
      .lean();
    const nextOrder = (maxOrder?.order ?? -1) + 1;
    const todo = await Todo.create({
      user: req.userId,
      title: title.trim(),
      completed: Boolean(completed),
      order: nextOrder,
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create todo" });
  }
}

export async function updateTodo(req, res) {
  try {
    const { id } = req.params;
    const { title, completed, order } = req.body;
    const updates = {};
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updates.title = title.trim();
    }
    if (completed !== undefined) updates.completed = Boolean(completed);
    if (order !== undefined) updates.order = Number(order);

    const todo = await Todo.findOneAndUpdate({ _id: id, user: req.userId }, updates, {
      new: true,
      runValidators: true,
    });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update todo" });
  }
}

export async function deleteTodo(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Todo.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: "Todo not found" });
    res.json({ id: deleted._id });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete todo" });
  }
}

export async function reorderTodos(req, res) {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ message: "orderedIds must be a non-empty array" });
    }
    const bulk = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user: req.userId },
        update: { $set: { order: index } },
      },
    }));
    await Todo.bulkWrite(bulk);
    const todos = await Todo.find({ user: req.userId }).sort({ order: 1, createdAt: 1 }).lean();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to reorder todos" });
  }
}
