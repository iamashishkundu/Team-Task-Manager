const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be 8+ chars")
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  authController.login
);

router.get("/me", auth, authController.me);
router.post("/logout", auth, authController.logout);

module.exports = router;
