const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/", upload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `/uploads/resumes/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

module.exports = router;
