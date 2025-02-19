const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: process.env.APP_URL,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/", userRoutes);  
app.use("/tasks", taskRoutes);

const connectDB = require("./config/db");
connectDB();
app.get('/', (req, res) => {
  res.json({
    message: 'Hello there !',
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something broke!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
