import express from "express";
import Task from "../models/Task.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Task
router.post("/", protect, async (req, res) => {
  const { title, description } = req.body;

  const task = new Task({
    title,
    description,
    userId: req.user._id,
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
});

// Get All Tasks for Logged-in User
router.get("/", protect, async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  res.json(tasks);
});

// Update Task
router.put("/:id", protect, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.userId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this task" });
  }

  task.title = req.body.title || task.title;
  task.description = req.body.description || task.description;
  task.status = req.body.status || task.status;

  const updatedTask = await task.save();
  res.json(updatedTask);
});

// Delete Task
router.delete("/:id", protect, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.userId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this task" });
  }

  await task.deleteOne();
  res.json({ message: "Task deleted" });
});

export default router;
