
require('dotenv').config();
const mongoose = require("mongoose");

const connectDB = async () => {
    console.log('Mongo URI:', process.env.MONGO_URI);

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Failed", error);
        process.exit(1);
    }
};

module.exports = connectDB;
