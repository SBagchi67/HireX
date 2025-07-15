console.log("Resume + Apply JS loaded");

const jobId = new URLSearchParams(window.location.search).get("id");

if (!jobId) {
  alert("❌ Job ID is missing in URL. Please return to the jobs list and try again.");
  throw new Error("Missing job ID from URL");
}

document.addEventListener("DOMContentLoaded", async () => {
  const elements = {
    jobTitle: document.getElementById("jobTitle"),
    companyName: document.getElementById("companyName"),
    jobLocation: document.getElementById("jobLocation"),
    jobType: document.getElementById("jobType"),
    jobSalary: document.getElementById("jobSalary"),
    jobDescription: document.getElementById("jobDescription"),
    requirementsList: document.getElementById("requirementsList"),
    skillsTags: document.getElementById("skillsTags")
  };

  try {
    const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
    const data = await res.json();

    if (data.success) {
      const job = data.job;

      elements.jobTitle.innerText = job.title;
      elements.companyName.innerText = job.company;
      elements.jobLocation.innerText = job.location;
      elements.jobType.innerText = job.jobType;
      elements.jobSalary.innerText = job.salary || "Not disclosed";
      elements.jobDescription.innerHTML = `<p>${job.description}</p>`;

      // ✅ Only overwrite requirements if valid array
      if (job.requirements && job.requirements.length > 0) {
        elements.requirementsList.innerHTML = job.requirements.map(r => `<li>${r}</li>`).join("");
      }

      // ✅ Only overwrite skills if valid array
      if (job.skillsRequired && job.skillsRequired.length > 0) {
        elements.skillsTags.innerHTML = job.skillsRequired.map(s => `<span class="skill-tag">${s}</span>`).join("");
      }

    } else {
      elements.jobTitle.innerText = "Job not found.";
    }
  } catch (err) {
    elements.jobTitle.innerText = "Error loading job.";
    console.error("❌ Error fetching job:", err);
  }
});

document.getElementById("resumeInput").addEventListener("change", async function (event) {
  event.preventDefault();

  const file = this.files[0];
  const resumeError = document.getElementById("resumeError");
  const resumeName = document.getElementById("resumeName");

  if (!file) return;

  const formData = new FormData();
  formData.append("resume", file);

  try {
    const res = await fetch("http://localhost:5000/api/upload-resume", {
      method: "POST",
      body: formData
    });

    const result = await res.json();

    if (result.success) {
      localStorage.setItem("resume", result.url);
      resumeName.innerText = `Uploaded: ${file.name}`;
      resumeError.innerText = "";
      document.getElementById("applyBtn").disabled = false;
    } else {
      resumeError.innerText = result.message || "Upload failed.";
    }
  } catch (err) {
    resumeError.innerText = "Error uploading resume.";
    console.error("❌ Upload error:", err);
  }
});

document.getElementById("applyBtn").addEventListener("click", async () => {
  const applicantId = localStorage.getItem("userId");
  const resume = localStorage.getItem("resume");
  const applyMsg = document.getElementById("applyMsg");

  console.log("Applying with:", { jobId, applicantId, resume });

  if (!applicantId || !resume || !jobId) {
    applyMsg.innerText = "❌ Missing job ID, user ID, or resume. Please check and try again.";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ job: jobId, applicant: applicantId, resume })
    });

    const result = await res.json();

    if (result.success) {
      applyMsg.innerText = "✅ Application submitted successfully!";
      document.getElementById("applyBtn").disabled = true;
    } else {
      applyMsg.innerText = `❌ ${result.message}`;
    }
  } catch (err) {
    const applyMsg = document.getElementById("applyMsg") || { innerText: console.warn("⚠️ applyMsg element missing") };

    console.error("❌ Application error:", err);
  }
});
