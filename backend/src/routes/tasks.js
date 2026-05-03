const express = require("express");
const { body } = require("express-validator");

const auth = require("../middleware/auth");
const { requireProjectAdmin } = require("../middleware/roleCheck");
const taskController = require("../controllers/taskController");

const router = express.Router();

router.get("/tasks/my-tasks", auth, taskController.getMyTasks);
router.get("/projects/:projectId/tasks", auth, taskController.getProjectTasks);
router.get("/tasks/:id", auth, taskController.getTaskById);

router.post(
  "/projects/:projectId/tasks",
  auth,
  requireProjectAdmin,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH"]),
    body("status").optional().isIn(["TODO", "IN_PROGRESS", "DONE"]),
    body("dueDate").optional().isISO8601().withMessage("Invalid date"),
    body("assignedTo").optional().isString()
  ],
  taskController.createTask
);

router.put(
  "/tasks/:id",
  auth,
  [
    body("title").optional().isString(),
    body("description").optional().isString(),
    body("status").optional().isIn(["TODO", "IN_PROGRESS", "DONE"]),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH"]),
    body("dueDate").optional().isISO8601().withMessage("Invalid date"),
    body("assignedTo").optional().isString()
  ],
  taskController.updateTask
);

router.delete("/tasks/:id", auth, taskController.deleteTask);

module.exports = router;
