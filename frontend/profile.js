document.addEventListener('DOMContentLoaded', function () {
  const defaultUser = {
    name: "Alex Johnson",
    email: "alex.j@example.com",
    title: "Frontend Developer",
    location: "Kolkata, India",
    phone: "+91 98765 43210",
    linkedin: "https://linkedin.com/in/alexjohnson",
    accessibility: ["screen-reader", "high-contrast"],
    skills: ["HTML5", "CSS3", "JavaScript"],
    resume: "Alex_Johnson_Resume.pdf",
    profilePic: ""
  };

  let currentUser = JSON.parse(localStorage.getItem("user")) || defaultUser;

  // ===== Load User Data to UI =====
  function loadUserData() {
    document.getElementById("user-name").textContent = currentUser.name;
    document.getElementById("user-title").textContent = currentUser.title;
    document.getElementById("user-location").textContent = currentUser.location;
    document.getElementById("user-email").textContent = currentUser.email;
    document.getElementById("user-phone").textContent = currentUser.phone;
    document.getElementById("profile-pic").src = currentUser.profilePic || "https://via.placeholder.com/150";

    // Form fields
    document.getElementById("full-name").value = currentUser.name;
    document.getElementById("job-title").value = currentUser.title;
    document.getElementById("location").value = currentUser.location;
    document.getElementById("email").value = currentUser.email;
    document.getElementById("phone").value = currentUser.phone;
    document.getElementById("linkedin").value = currentUser.linkedin || "";

    // Accessibility
    document.querySelectorAll('[name="accessibility"]').forEach(cb => {
      cb.checked = currentUser.accessibility?.includes(cb.value);
    });

    // Resume
    document.querySelector(".resume-preview span").textContent = currentUser.resume || "No resume uploaded";

    // Skills
    renderSkills();
    updateCompletionMeter();
  }

  function renderSkills() {
    const skillTags = document.getElementById("skill-tags");
    skillTags.innerHTML = "";

    (currentUser.skills || []).forEach(skill => {
      const tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.innerHTML = `${skill} <button class="remove-skill" aria-label="Remove skill">×</button>`;

      tag.querySelector(".remove-skill").addEventListener("click", () => {
        currentUser.skills = currentUser.skills.filter(s => s !== skill);
        localStorage.setItem("user", JSON.stringify(currentUser));
        renderSkills();
        updateCompletionMeter();
      });

      skillTags.appendChild(tag);
    });
  }

  function addSkill(skill) {
    if (!skill.trim()) return;

    if (!Array.isArray(currentUser.skills)) currentUser.skills = [];

    const exists = currentUser.skills.some(s => s.toLowerCase() === skill.toLowerCase());
    if (exists) return;

    currentUser.skills.push(skill.trim());
    localStorage.setItem("user", JSON.stringify(currentUser));
    renderSkills();
    updateCompletionMeter();
    document.getElementById("new-skill").value = "";
  }

  // ===== Profile Picture Upload =====
  const profilePic = document.getElementById("profile-pic");
  const photoUpload = document.getElementById("photo-upload");
  document.getElementById("change-photo").addEventListener("click", () => photoUpload.click());

  photoUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentUser.profilePic = ev.target.result;
      profilePic.src = ev.target.result;
      localStorage.setItem("user", JSON.stringify(currentUser));
    };
    reader.readAsDataURL(file);
  });

  // ===== Resume Upload (Backend) =====
  const resumeUpload = document.getElementById("resume-upload");
  document.getElementById("replace-resume").addEventListener("click", () => resumeUpload.click());

  resumeUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload-resume", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        currentUser.resume = file.name;
        localStorage.setItem("user", JSON.stringify(currentUser));
        document.querySelector(".resume-preview span").textContent = file.name;
        alert("✅ Resume uploaded!");
      } else {
        alert("❌ Upload failed");
      }
    } catch (err) {
      alert("❌ Upload error");
    }
  });

  // ===== Add Skill =====
  document.getElementById("add-skill-btn").addEventListener("click", () => {
    const skill = document.getElementById("new-skill").value;
    addSkill(skill);
  });

  document.getElementById("new-skill").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const skill = document.getElementById("new-skill").value;
      addSkill(skill);
    }
  });

  // ===== Save Profile Form =====
  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("save-btn");
    btn.classList.add("loading");
    btn.disabled = true;

    setTimeout(() => {
      currentUser.name = document.getElementById("full-name").value;
      currentUser.title = document.getElementById("job-title").value;
      currentUser.location = document.getElementById("location").value;
      currentUser.email = document.getElementById("email").value;
      currentUser.phone = document.getElementById("phone").value;
      currentUser.linkedin = document.getElementById("linkedin").value;
      currentUser.accessibility = Array.from(document.querySelectorAll('[name="accessibility"]:checked')).map(cb => cb.value);

      localStorage.setItem("user", JSON.stringify(currentUser));
      loadUserData();

      btn.classList.remove("loading");
      btn.disabled = false;
      alert("✅ Profile updated!");
    }, 800);
  });

  // ===== Cancel Button =====
  document.getElementById("cancel-btn").addEventListener("click", () => {
    loadUserData();
  });

  // ===== Completion Meter =====
  function updateCompletionMeter() {
    const fields = [
      currentUser.name,
      currentUser.title,
      currentUser.email,
      currentUser.location,
      (currentUser.skills || []).length > 0
    ];
    const percent = Math.round(fields.filter(Boolean).length / fields.length * 100);
    document.querySelector(".meter-bar").style.width = `${percent}%`;
    document.querySelector(".completion-text").textContent = `Profile ${percent}% complete`;
  }

  loadUserData();
});
