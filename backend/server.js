const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");

const app = express();


// ========================
// ✅ CORS CONFIG (FIXED)
// ========================
const allowedOrigins = [
  "http://localhost:5173",
  "https://eatharaproject.vercel.app",
  "https://ethara-ai-project-jade.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS Blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());


// ========================
// ✅ MIDDLEWARE
// ========================
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));


// ========================
// ✅ RATE LIMITER
// ========================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Apply limiter AFTER auth routes
app.use("/api/auth", authRoutes);
app.use("/api/", limiter);


// ========================
// ✅ ROUTES
// ========================
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);


// ========================
// ✅ HEALTH CHECK
// ========================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});


// ========================
// ✅ GLOBAL ERROR HANDLER
// ========================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});



app.get('/api/test-email', async (req, res) => {
  const { sendEmail } = require('./utils/email');

  const ok = await sendEmail(
    'jaideepkr.0123@gmail.com',
    'welcome',
    'Jaydeep'
  );

  res.json({ success: ok });
});


// ========================
// ✅ MONGODB CONNECTION
// ========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = app;
