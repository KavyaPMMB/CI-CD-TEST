import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/todos");
      setTodos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load todos");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (title) => {
    const { data } = await api.post("/todos", { title });
    setTodos((prev) => [...prev, data]);
    return data;
  };

  const updateTodo = async (id, payload) => {
    const { data } = await api.put(`/todos/${id}`, payload);
    setTodos((prev) => prev.map((t) => (t._id === id ? data : t)));
    return data;
  };

  const deleteTodo = async (id) => {
    await api.delete(`/todos/${id}`);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  const reorderTodos = async (orderedIds) => {
    const { data } = await api.put("/todos/reorder", { orderedIds });
    setTodos(Array.isArray(data) ? data : []);
    return data;
  };

  return {
    todos,
    loading,
    error,
    refetch: fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    setTodos,
  };
}
