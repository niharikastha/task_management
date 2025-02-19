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
    message: 'Hello',
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
