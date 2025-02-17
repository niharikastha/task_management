const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validator = require("validator");
const User = require("../models/user");

const userControlller = {

    signup: async (req, res) => {
        try {
            const { name, email, password, confirmPassword } = req.body;
    
            let requiredAttributes = ['name', 'email', 'password', 'confirmPassword'];
            for (let attributeName of requiredAttributes) {
                if (!req.body[attributeName]) {
                    return res.status(400).json({
                        success: false,
                        message: `Required attribute ${attributeName} is missing.`,
                    });
                }
            }
    
            if (!validator.isEmail(email)) {
                return res.status(400).json({ success: false, message: "Invalid email format." });
            }
    
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
                });
            }
    
            if (password !== confirmPassword) {
                return res.status(400).json({ success: false, message: "Passwords do not match." });
            }
    
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists." });
            }
    
            const newUser = new User({ name, email, password });
    
            const hashedPassword = await bcrypt.hash(password, 10);
            newUser.password = hashedPassword;
    
            const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
            await newUser.save();
    
            return res.status(201).json({
                success: true,
                message: "User registered successfully.",
                data: {
                    name: newUser.name,
                    email: newUser.email,
                    token: `Bearer ${token}`,
                },
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error.", error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
    
            const requiredAttributes = ['email', 'password'];
            for (let attributeName of requiredAttributes) {
                if (!req.body[attributeName]) {
                    return res.status(400).json({
                        success: false,
                        message: `Required attribute ${attributeName} is missing.`,
                    });
                }
            }
    
            if (!validator.isEmail(email)) {
                return res.status(400).json({ success: false, message: "Invalid email format." });
            }
    
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(400).json({ success: false, message: "User not found." });
            }
    
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Invalid credentials." });
            }
    
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
            return res.status(200).json({
                success: true,
                message: "Login successful.",
                data: {
                    name: user.name,
                    email: user.email,
                    token: `Bearer ${token}`,
                },
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error.", error: error.message });
        }
    },
    

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            if (!validator.isEmail(email)) {
                return res.status(400).json({ success: false, message: "Invalid email format." });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success: false, message: "User not found." });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "OTP for Password Reset",
                text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
            };

            user.otp = otp;
            user.otpExpiry = Date.now() + 10 * 60 * 1000;
            await user.save();

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ success: false, message: "Error sending OTP email." });
                }
                return res.status(200).json({ success: true, message: "OTP sent successfully." });
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error.", error: error.message });
        }
    }
}

module.exports = userControlller;
