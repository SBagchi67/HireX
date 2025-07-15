let currentPage = 1;
const limitPerPage = 10;

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("uploadBtn").addEventListener("click", () => {
    document.getElementById("resumeInput").click();
  });

  document.getElementById("resumeInput").addEventListener("change", handleResumeUpload);

  document.getElementById("searchBtn").addEventListener("click", () => {
    currentPage = 1;
    loadJobs();
  });

  // Live filtering
  document.getElementById("searchTitle").addEventListener("input", debounce(loadJobs, 400));
  document.getElementById("searchLocation").addEventListener("input", debounce(loadJobs, 400));
  document.getElementById("jobType").addEventListener("change", loadJobs);
  document.getElementById("skillsInput").addEventListener("input", debounce(loadJobs, 400));
  document.querySelectorAll("input[name='accessibility']").forEach(cb => cb.addEventListener("change", loadJobs));

  // Dark mode toggle
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  themeToggleBtn?.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark);
    document.querySelector(".light-icon").style.display = isDark ? "none" : "inline";
    document.querySelector(".dark-icon").style.display = isDark ? "inline" : "none";
  });

  if (localStorage.getItem("darkMode") === "true") {
    body.classList.add("dark");
    document.querySelector(".light-icon").style.display = "none";
    document.querySelector(".dark-icon").style.display = "inline";
  } else {
    document.querySelector(".light-icon").style.display = "inline";
    document.querySelector(".dark-icon").style.display = "none";
  }

  await loadJobs();
});

async function loadJobs() {
  const container = document.getElementById("jobsContainer");
  container.innerHTML = "<div class='loading'>Loading jobs...</div>";

  try {
    const title = document.getElementById("searchTitle").value.trim();
    const location = document.getElementById("searchLocation").value.trim();
    const jobType = document.getElementById("jobType").value;
    const skills = document.getElementById("skillsInput").value.trim();

    const accessibility = Array.from(
      document.querySelectorAll("input[name='accessibility']:checked")
    ).map(cb => cb.value);

    const query = new URLSearchParams();
    if (title) query.append("title", title);
    if (location) query.append("location", location);
    if (jobType) query.append("jobType", jobType);
    if (skills) query.append("skills", skills);
    if (accessibility.length) query.append("accessibility", accessibility.join(","));

    query.append("page", currentPage);
    query.append("limit", limitPerPage);

    const res = await fetch(`http://localhost:5000/api/jobs?${query.toString()}`);
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || "Failed to fetch jobs");

    renderJobs(result.jobs || []);
    renderPagination(result.totalPages);
  } catch (err) {
    console.error("Job fetch error:", err);
    container.innerHTML = `<div class="error">❌ ${err.message}</div>`;
  }
}

function renderJobs(jobs) {
  const container = document.getElementById("jobsContainer");

  if (!jobs.length) {
    container.innerHTML = "<div class='no-jobs'>No jobs found</div>";
    return;
  }

  container.innerHTML = jobs.map(job => `
    <div class="job-card">
      <div class="job-header">
        <h3>${job.title}</h3>
        <button class="bookmark-btn"><i class="far fa-bookmark"></i></button>
      </div>
      <p class="company">${job.company}</p>
      <div class="job-meta">
        <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
        <span>${job.jobType}</span>
        ${job.salary ? `<span class="salary">$${job.salary}</span>` : ''}
      </div>
      <div class="job-features">
        ${job.accessibilityFeatures?.map(f => `
          <span class="feature ${f}">
            <i class="fas fa-${getAccessibilityIcon(f)}"></i> ${formatFeatureName(f)}
          </span>
        `).join('') || ''}
      </div>
      <p class="job-desc">${job.description?.slice(0, 150)}...</p>
      <div class="job-footer">
        <span class="post-time">${formatDate(job.createdAt)}</span>
        <div class="job-actions">
          <button class="btn view-btn" onclick="window.location.href='job-details.html?id=${job._id}'">View Details</button>
          <button class="btn primary apply-btn" data-job-id="${job._id}">Apply Now</button>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll(".apply-btn").forEach(btn => {
    btn.addEventListener("click", () => applyForJob(btn.getAttribute("data-job-id")));
  });
}

function renderPagination(totalPages) {
  const paginationContainer = document.getElementById("paginationContainer");
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.innerText = "Previous";
    prevBtn.onclick = () => {
      currentPage--;
      loadJobs();
    };
    paginationContainer.appendChild(prevBtn);
  }

  const pageInfo = document.createElement("span");
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
  paginationContainer.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Next";
    nextBtn.onclick = () => {
      currentPage++;
      loadJobs();
    };
    paginationContainer.appendChild(nextBtn);
  }
}

async function handleResumeUpload(e) {
  const file = e.target.files[0];
  const statusEl = document.getElementById("resumeStatus");

  if (!file) return;

  statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

  try {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) throw new Error("Only PDF or DOC files allowed");

    if (file.size > 5 * 1024 * 1024) throw new Error("File must be under 5MB");

    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch("http://localhost:5000/api/upload-resume", {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Upload failed");

    localStorage.setItem("resumeUrl", result.url);
    statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Resume uploaded!';
  } catch (error) {
    statusEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
    console.error("Resume Upload Error:", error);
  }
}

async function applyForJob(jobId) {
  const user = JSON.parse(localStorage.getItem("user"));
  const resumeUrl = localStorage.getItem("resumeUrl");

  if (!user || !user.id) {
    alert("Please login to apply.");
    return;
  }

  if (!resumeUrl) {
    alert("Please upload your resume before applying.");
    document.getElementById('resumeUploadContainer').classList.add('resume-required');
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job: jobId,
        applicant: user.id,
        resume: `http://localhost:5000${resumeUrl}`
      })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Application failed");

    window.location.href = `job-details.html?id=${jobId}`;
  } catch (error) {
    console.error("Application Error:", error);
    alert("❌ Application failed. Try again.");
  }
}

function getAccessibilityIcon(feature) {
  const icons = {
    screen_reader: "eye",
    wheelchair: "wheelchair",
    sign_language: "sign-language"
  };
  return icons[feature] || "universal-access";
}

function formatFeatureName(feature) {
  return feature.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
