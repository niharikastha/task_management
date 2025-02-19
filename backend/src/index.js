const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
const corsOptions = {
  origin: process.env.APP_URL,
  credentials: true
};

app.use(cors(corsOptions));

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/", userRoutes);  
app.use("/tasks", taskRoutes);

const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.json({
      message: 'Hello',
    });
  });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
