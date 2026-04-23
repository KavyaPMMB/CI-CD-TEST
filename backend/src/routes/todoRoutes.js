import { Router } from "express";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  reorderTodos,
} from "../controllers/todoController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);
router.get("/", getTodos);
router.post("/", createTodo);
router.put("/reorder", reorderTodos);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
