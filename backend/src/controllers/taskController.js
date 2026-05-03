const { validationResult } = require("express-validator");
const prisma = require("../prisma");

const priorityOrder = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
};

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    });
    return false;
  }
  return true;
}

async function getProjectTasks(req, res) {
  try {
    const projectId = req.params.projectId;

    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.user.id }
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: "Project membership required" });
    }

    const { status, assignedTo, priority, sort } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        status: status || undefined,
        assignedToId: assignedTo || undefined,
        priority: priority || undefined
      },
      include: { assignedTo: true, createdBy: true },
      orderBy: sort === "createdAt" ? { createdAt: "desc" } : { dueDate: "asc" }
    });

    if (sort === "priority") {
      tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load tasks" });
  }
}

async function createTask(req, res) {
  if (!handleValidation(req, res)) return;

  try {
    const projectId = req.params.projectId;
    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedToId: assignedTo || null,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        createdById: req.user.id
      },
      include: { assignedTo: true, createdBy: true }
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create task" });
  }
}

async function updateTask(req, res) {
  if (!handleValidation(req, res)) return;

  try {
    const taskId = req.params.id;
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const membership = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: req.user.id }
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: "Project membership required" });
    }

    const isAdmin = membership.role === "ADMIN";
    const isAssignee = task.assignedToId === req.user.id;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "Only assigned members can update their task"
      });
    }

    const data = {};

    if (isAdmin) {
      const { title, description, status, priority, dueDate, assignedTo } = req.body;
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (status !== undefined) data.status = status;
      if (priority !== undefined) data.priority = priority;
      if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
      if (assignedTo !== undefined) data.assignedToId = assignedTo || null;
    } else {
      const { status } = req.body;
      if (status !== undefined) data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return res.status(422).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
      include: { assignedTo: true, createdBy: true }
    });

    return res.json({ success: true, task: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update task" });
  }
}

async function deleteTask(req, res) {
  try {
    const taskId = req.params.id;
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const membership = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: req.user.id }
    });

    if (!membership || membership.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    await prisma.task.delete({ where: { id: taskId } });
    return res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete task" });
  }
}

async function getMyTasks(req, res) {
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: req.user.id },
      include: { project: true, assignedTo: true },
      orderBy: { dueDate: "asc" }
    });

    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load tasks" });
  }
}

async function getTaskById(req, res) {
  try {
    const taskId = req.params.id;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { members: true }
        },
        assignedTo: true,
        createdBy: true
      }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const membership = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: req.user.id }
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: "Project membership required" });
    }

    return res.json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load task" });
  }
}

module.exports = {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
  getTaskById
};
