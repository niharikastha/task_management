const express = require("express");
const { signup, login, forgotPassword } = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
