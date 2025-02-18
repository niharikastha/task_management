const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticate = require("../middleware/authenticate");

router.post("/", authenticate, taskController.createTask);
router.get("/", authenticate, taskController.getAllTasks);
router.get("/:id", authenticate, taskController.getTaskById);
router.put("/:id", authenticate, taskController.updateTask);
router.delete("/:id", authenticate, taskController.deleteTask);
router.get("/user/:id", authenticate, taskController.findByUser);

module.exports = router;
