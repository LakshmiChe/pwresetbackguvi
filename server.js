require("dotenv").config();
const cors = require('cors');
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// app.use(cors({ origin: "*" }));

app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-netlify-frontend.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If you need to allow cookies or authentication headers
  })
);

app.options("*", cors());


// // Allow requests from your frontend origin during development
// app.use(cors({
//   origin: 'http://localhost:5173',  // your React app URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   credentials: true,  // if you use cookies/auth headers
// }));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
