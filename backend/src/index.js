const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

// const corsOptions = {
//   origin: process.env.REACT_APP_API_URL || "http://localhost:3000",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true
// };

// app.use(cors(corsOptions));
app.use(cors()); 

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
const PORT = process.env.PORT || 5000;

 app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
module.exports = app;
