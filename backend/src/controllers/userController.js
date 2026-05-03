const prisma = require("../prisma");

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}

async function listUsers(req, res) {
  try {
    const search = req.query.search || "";

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return res.json({
      success: true,
      users: users.map(sanitizeUser)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load users" });
  }
}

module.exports = {
  listUsers
};
