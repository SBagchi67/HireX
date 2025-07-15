document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const messageElement = document.getElementById("loginMessage");
  const submitBtn = form.querySelector('button[type="submit"]');

  messageElement.textContent = "";
  messageElement.className = "message";

  if (!email || !password) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    const contentType = res.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error("Expected JSON but got: " + text.slice(0, 50));
    }

    const data = await res.json();
    debugger
  
    
    localStorage.setItem("userId",data.user._id)

    if (!res.ok) {
      throw new Error(data.message || `Login failed with status ${res.status}`);
    }

    showMessage("✅ Login successful! Redirecting...", "success");

    localStorage.setItem("user", JSON.stringify({
      id: data.user._id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name
    }));

    setTimeout(() => {
      window.location.href = data.user.role === "jobseeker"
        ? "dashboard.html"
        : "employer.html";
    }, 1500);

  } catch (err) {
    console.error("Login error:", err);
    showMessage(`❌ ${err.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
});

function showMessage(text, type) {
  const messageElement = document.getElementById("loginMessage");
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
}
