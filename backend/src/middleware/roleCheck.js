const prisma = require("../prisma");

function getProjectId(req) {
  return req.params.projectId || req.params.id;
}

async function requireProjectAdmin(req, res, next) {
  try {
    const projectId = getProjectId(req);
    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project id missing" });
    }

    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.user.id }
    });

    if (!membership || membership.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to verify role" });
  }
}

async function requireProjectMember(req, res, next) {
  try {
    const projectId = getProjectId(req);
    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project id missing" });
    }

    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.user.id }
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: "Project membership required" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to verify role" });
  }
}

module.exports = {
  requireProjectAdmin,
  requireProjectMember
};
