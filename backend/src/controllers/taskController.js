const Task = require("../models/task");

const taskController = {
    createTask: async (req, res) => {
        try {
            const { title, description, status, dueDate, priority } = req.body;

            const requiredAttributes = ['title'];
            for (let attributeName of requiredAttributes) {
                if (!req.body[attributeName]) {
                    return res.status(400).json({
                        success: false,
                        message: `Required attribute ${attributeName} is missing.`,
                    });
                }
            }

            if (status && !["backlog", "todo", "completed"].includes(status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid status value." 
                });
            }

            if (priority && !["low", "medium", "high"].includes(priority)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid priority value." 
                });
            }

            const assignedTo = req.user.id;
            const newTask = new Task({ title, description, status, dueDate, assignedTo, priority });
            await newTask.save();

            return res.status(201).json({ 
                success: true, 
                message: "Task created successfully.", 
                data: newTask 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "Server error.", 
                error: error.message
            });
        }
    },

    getAllTasks: async (req, res) => {
        try {
            const tasks = await Task.find().populate("assignedTo", "name email");
            return res.status(200).json({ success: true, message: "Tasks retrieved successfully.", data: tasks });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error.", error: error.message });
        }
    },

    getTaskById: async (req, res) => {
        try {
            const task = await Task.findById(req.params.id).populate("assignedTo", "name email");

            if (!task) {
                return res.status(404).json({ success: false, message: "Task not found." });
            }

            return res.status(200).json({ success: true, message: "Task retrieved successfully.", data: task });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error.", error: error.message });
        }
    },

    updateTask: async (req, res) => {
        try {
            const { title, description, status, dueDate, priority } = req.body;

            if (status && !["pending", "completed"].includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status value." });
            }

            if (priority && !["low", "medium", "high"].includes(priority)) {
                return res.status(400).json({ success: false, message: "Invalid priority value." });
            }
            const assignedTo = req.user.id;
            const updatedTask = await Task.findByIdAndUpdate(
                req.params.id,
                { title, description, status, dueDate, assignedTo, priority },
                { new: true, runValidators: true }
            );

            if (!updatedTask) {
                return res.status(404).json({ success: false, message: "Task not found." });
            }

            return res.status(200).json({ success: true, message: "Task updated successfully.", data: updatedTask });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error.", error: error.message });
        }
    },

    deleteTask: async (req, res) => {
        try {
            const deletedTask = await Task.findByIdAndDelete(req.params.id);

            if (!deletedTask) {
                return res.status(404).json({ success: false, message: "Task not found." });
            }

            return res.status(200).json({ success: true, message: "Task deleted successfully." });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error.", error: error.message });
        }
    },
};

module.exports = taskController;
