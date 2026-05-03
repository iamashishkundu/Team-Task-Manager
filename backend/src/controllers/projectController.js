const { validationResult } = require("express-validator");
const prisma = require("../prisma");

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

async function getProjects(req, res) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        _count: { select: { members: true, tasks: true } },
        tasks: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load projects" });
  }
}

async function createProject(req, res) {
  if (!handleValidation(req, res)) return;

  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "ADMIN"
          }
        }
      }
    });

    return res.status(201).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create project" });
  }
}

async function getProjectById(req, res) {
  try {
    const projectId = req.params.id;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        createdBy: true,
        members: {
          include: { user: true }
        },
        tasks: {
          include: { assignedTo: true, createdBy: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load project" });
  }
}

async function updateProject(req, res) {
  if (!handleValidation(req, res)) return;

  try {
    const projectId = req.params.id;
    const { name, description } = req.body;

    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name, description }
    });

    return res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update project" });
  }
}

async function deleteProject(req, res) {
  try {
    const projectId = req.params.id;

    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await prisma.task.deleteMany({ where: { projectId } });
    await prisma.projectMember.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });

    return res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete project" });
  }
}

async function addMember(req, res) {
  if (!handleValidation(req, res)) return;

  try {
    const projectId = req.params.id;
    const { email, role } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existing = await prisma.projectMember.findFirst({
      where: { projectId, userId: user.id }
    });

    if (existing) {
      return res.status(422).json({ success: false, message: "User already in project" });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: role || "MEMBER"
      },
      include: { user: true }
    });

    return res.status(201).json({ success: true, member });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add member" });
  }
}

async function removeMember(req, res) {
  try {
    const projectId = req.params.id;
    const userId = req.params.userId;

    await prisma.projectMember.deleteMany({ where: { projectId, userId } });

    return res.json({ success: true, message: "Member removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to remove member" });
  }
}

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
