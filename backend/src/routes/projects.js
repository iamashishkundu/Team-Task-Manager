const express = require("express");
const { body } = require("express-validator");

const auth = require("../middleware/auth");
const { requireProjectAdmin } = require("../middleware/roleCheck");
const projectController = require("../controllers/projectController");

const router = express.Router();

router.get("/", auth, projectController.getProjects);

router.post(
  "/",
  auth,
  [body("name").trim().notEmpty().withMessage("Name is required")],
  projectController.createProject
);

router.get("/:id", auth, projectController.getProjectById);

router.put(
  "/:id",
  auth,
  requireProjectAdmin,
  [body("name").optional().trim().notEmpty().withMessage("Name is required")],
  projectController.updateProject
);

router.delete("/:id", auth, requireProjectAdmin, projectController.deleteProject);

router.post(
  "/:id/members",
  auth,
  requireProjectAdmin,
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("role").optional().isIn(["ADMIN", "MEMBER"]).withMessage("Invalid role")
  ],
  projectController.addMember
);

router.delete(
  "/:id/members/:userId",
  auth,
  requireProjectAdmin,
  projectController.removeMember
);

module.exports = router;
