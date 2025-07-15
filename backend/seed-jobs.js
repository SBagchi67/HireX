// seed-jobs.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Job = require("./models/job"); // Adjust path if needed

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// 👤 Replace this with an existing employer user _id
const postedBy = "684738bdb0c2d9cb6a745354";

// Sample job data generator
function generateJob(i) {
  return {
    title: `Frontend Developer ${i}`,
    company: `TechCorp ${i}`,
    location: i % 2 === 0 ? "Remote" : "Bangalore, India",
    salary: i % 3 === 0 ? "$70,000 - $90,000" : "Not disclosed",
    description: `This is a sample job description for position ${i}. It includes frontend technologies and accessibility focus.`,
    requirements: [
      "HTML/CSS",
      "JavaScript",
      "React or Vue",
      "Accessibility Guidelines"
    ],
    skillsRequired: ["HTML", "CSS", "JS", "React", "WCAG"],
    accessibilityFeatures: ["screen_reader", "keyboard", "high_contrast"],
    jobType: i % 2 === 0 ? "Full-time" : "Contract",
    postedBy
  };
}

async function seedJobs() {
  try {
    // await Job.deleteMany(); // Optional: clear old jobs
    console.log("🧹 Old jobs deleted");

    const jobs = Array.from({ length: 40 }, (_, i) => generateJob(i + 1));
    await Job.insertMany(jobs);
    console.log("🚀 Dummy jobs inserted:", jobs.length);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedJobs();
