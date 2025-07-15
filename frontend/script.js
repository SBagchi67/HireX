// Theme toggle functionality with icon switching
const themeToggle = document.getElementById('theme-toggle');
const storedTheme = localStorage.getItem('theme') || 
                   (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

// Set initial theme and icon
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update icon
  const icon = themeToggle.querySelector('i');
  if (theme === 'dark') {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

// Initialize theme
setTheme(storedTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});

// Dashboard interactions
document.addEventListener('DOMContentLoaded', function() {
  console.log("script.js is loaded");

  // Profile completion progress
  const completion = 75; // In real case, get this from DB
  const progressBar = document.getElementById("profileProgressBar");
  const progressText = document.getElementById("profileProgressText");

  if (progressBar && progressText) {
    progressBar.style.width = `${completion}%`;
    progressText.textContent = `Profile ${completion}% complete`;
  } else {
    console.warn("Progress bar elements not found");
  }

  // Animate stats counter
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const speed = 200;
    
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const count = +counter.innerText;
      const increment = target / speed;
      
      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(animateCounters, 1);
      } else {
        counter.innerText = target;
      }
    });
  }

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        if (entry.target.classList.contains('stats-bar')) {
          animateCounters();
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });

  // Make stat cards clickable
  document.querySelectorAll('.stat-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
      const title = this.querySelector('h3').textContent;
      // Instead of alert, consider showing a modal or redirecting
      showModal(`Details for: ${title}`, 'This would show detailed statistics in a real implementation.');
    });
  });

  // Job card interactions
  document.querySelectorAll('.job-card').forEach(job => {
    job.style.cursor = 'pointer';
    job.addEventListener('click', function(e) {
      // Don't trigger if clicking on buttons or links
      if (!e.target.classList.contains('btn') && 
          !e.target.classList.contains('bookmark-btn') && 
          e.target.tagName !== 'A') {
        const jobId = this.dataset.jobId;
        // Redirect to job details page or show modal
        window.location.href = `job-details.html?id=${jobId}`;
      }
    });
  });

  // Bookmark buttons
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      const jobId = this.dataset.jobId;
      
      // Save to localStorage or send to backend
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const index = bookmarks.indexOf(jobId);
      
      if (index === -1) {
        bookmarks.push(jobId);
      } else {
        bookmarks.splice(index, 1);
      }
      
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      showToast(this.classList.contains('active') ? 'Job saved!' : 'Job removed');
    });
  });

  // Apply buttons
  document.querySelectorAll('.btn-apply').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const jobId = this.dataset.jobId;
      
      // Show loading state
      this.innerHTML = '<span class="loading-spinner"></span> Applying...';
      this.disabled = true;
      
      // Simulate API call
      setTimeout(() => {
        showModal('Application Submitted', 'Your application has been successfully submitted!');
        this.innerHTML = 'Applied <i class="fas fa-check"></i>';
      }, 1500);
    });
  });

  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }

  // Search functionality
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = this.querySelector('input[name="search"]').value;
      const location = this.querySelector('select[name="location"]').value;
      const jobType = this.querySelector('select[name="job-type"]').value;
      
      // Redirect to search results page
      window.location.href = `jobs.html?search=${encodeURIComponent(query)}&location=${location}&jobType=${jobType}`;
    });
  }
});

// Helper functions
function showModal(title, content) {
  // In a real implementation, you would use a proper modal library
  // or create your own modal component
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>${title}</h2>
      <p>${content}</p>
    </div>
  `;
  
  modal.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.body.appendChild(modal);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}