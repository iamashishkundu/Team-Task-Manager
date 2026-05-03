const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const memberEmail = "member@example.com";

  const adminPassword = await bcrypt.hash("AdminPass123", 10);
  const memberPassword = await bcrypt.hash("MemberPass123", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Admin User", password: adminPassword, role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  const member = await prisma.user.upsert({
    where: { email: memberEmail },
    update: { name: "Member User", password: memberPassword, role: "MEMBER" },
    create: {
      email: memberEmail,
      name: "Member User",
      password: memberPassword,
      role: "MEMBER"
    }
  });

  const existingProject = await prisma.project.findFirst({
    where: { name: "Seed Project", createdById: admin.id }
  });

  if (existingProject) {
    await prisma.task.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.projectMember.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.project.delete({ where: { id: existingProject.id } });
  }

  const project = await prisma.project.create({
    data: {
      name: "Seed Project",
      description: "Sample project seeded for demo",
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: member.id, role: "MEMBER" }
        ]
      }
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Plan sprint",
        description: "Outline the initial sprint tasks",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assignedToId: admin.id,
        createdById: admin.id
      },
      {
        title: "Build API",
        description: "Implement core endpoints",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assignedToId: member.id,
        createdById: admin.id
      },
      {
        title: "UI review",
        description: "Review UI polish",
        status: "DONE",
        priority: "LOW",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assignedToId: member.id,
        createdById: admin.id
      }
    ]
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
