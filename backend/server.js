// ===== 1. Imports =====
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===== 2. Load environment variables =====
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ===== 3. Init Express =====
const app = express();

// ===== 4. Middleware Setup =====

// ✅ CORS Setup
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));

// ✅ JSON Parser
app.use(express.json());

// ===== 5. Multer Setup for Resume Uploads =====
const uploadDir = path.join(__dirname, 'public/uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const extname = path.extname(file.originalname).toLowerCase();
  cb(null, allowedTypes.includes(extname));
};

const upload = multer({ storage, fileFilter });

// ===== 6. File Upload API =====
app.post("/api/upload-resume", upload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const url = `/uploads/resumes/${req.file.filename}`;
  res.json({ success: true, url });
});

// ===== 7. Static Folder for Uploaded Files =====
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ===== 8. Routes Setup =====
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// ===== 9. Global Error Handler =====
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ===== 10. Test Route =====
app.get("/", (req, res) => {
  res.send("🎉 HireX Backend Running");
});

// ===== 11. Connect MongoDB and Start Server =====
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error("❌ MongoDB connection failed:", err.message);
});
