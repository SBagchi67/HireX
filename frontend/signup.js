document.addEventListener('DOMContentLoaded', function() {
  const togglePassword = document.querySelector('.toggle-password');
  const passwordInput = document.getElementById('password');
  
  togglePassword.addEventListener('click', function() {
    // Toggle the type attribute
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle the eye icon
    this.classList.toggle('password-visible');
    
    // Update ARIA label for accessibility
    const label = type === 'password' ? 'Show password' : 'Hide password';
    this.setAttribute('aria-label', label);
  });
});





document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Get form elements
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const messageEl = document.getElementById("signupMessage");
  
  // Get form values
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const accessibility = document.getElementById("accessibility").value;
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");
  messageEl.textContent = "";
  
  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role, accessibility }),
    });

    const data = await response.json();

    if (response.ok) {
      messageEl.textContent = "✅ Account created successfully!";
      messageEl.style.color = "var(--accent-color)";
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect immediately
      window.location.href = role === "jobseeker" ? "dashboard.html" : "employer.html";
    } else {
      messageEl.textContent = `❌ ${data.message || "Signup failed"}`;
      messageEl.style.color = "#e53e3e";
    }
  } catch (error) {
    console.error("Signup error:", error);
    messageEl.textContent = "❌ Network error. Please try again.";
    messageEl.style.color = "#e53e3e";
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
});