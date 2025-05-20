require("dotenv").config();
const cors = require('cors');
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(express.json());

// Enable CORS for all origins (modify as needed)
app.use(cors({
  origin: '*',  // Allow all origins, you can restrict to your frontend's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Auth routes
app.use("/api/auth", authRoutes);

// Add reset-password route
app.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.send(`Token received: ${token}`);
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
