document.addEventListener("DOMContentLoaded", async () => {
  console.log("📦 Dashboard loaded");

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user) {
    alert("No user found. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  // Use the user data directly from localStorage
  const nameEl = document.querySelector(".user-name");
  const completionBar = document.querySelector(".meter-bar");
  const completionText = document.querySelector(".completion-text");

  try {
    // 👤 1. Display real name
    nameEl.textContent = user.name;

    // 📊 2. Calculate profile completion
    let completedFields = 0;
    const totalFields = 4;

    if (user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.role) completedFields++;
    if (user.accessibility && user.accessibility !== "") completedFields++;
    
    const percent = Math.floor((completedFields / totalFields) * 100);

    // 🟦 3. Update meter
    completionBar.style.width = `${percent}%`;
    completionText.textContent = `Profile ${percent}% complete`;
  } catch (err) {
    console.error("Dashboard error:", err);
    nameEl.textContent = "Guest";
    completionText.textContent = "Error loading profile";
  }
});