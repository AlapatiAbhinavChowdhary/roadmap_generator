(() => {
  // --- 1. THEME SWITCHER LOGIC ---
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Apply saved theme on page load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
      body.classList.add('light-mode');
  }

  themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      // Save the user's preference
      if (body.classList.contains('light-mode')) {
          localStorage.setItem('theme', 'light');
      } else {
          localStorage.setItem('theme', 'dark');
      }
  });
    
  // --- 2. SETUP & PAGE ROUTING ---
  const modals = { login: document.getElementById('loginModal'), signup: document.getElementById('signupModal') };
  const pages = { landing: document.getElementById('landingPage'), contact: document.getElementById('contactPage') };
  let currentPage = 'landing';
  
  // Fill in modal content
  modals.login.innerHTML = `<div class="auth-container"><span class="close-modal">×</span><div class="auth-header"><h2>Welcome Back</h2></div><form class="auth-form"><div class="form-group"><label for="loginEmail">Email</label><input type="email" placeholder="you@example.com" required></div><div class="form-group"><label for="loginPassword">Password</label><input type="password" placeholder="Enter your password" required></div><button type="submit" class="auth-btn">Log In</button></form><div class="divider">or</div><div class="social-login"><button class="social-btn"><i class="fab fa-google"></i></button><button class="social-btn"><i class="fab fa-github"></i></button><button class="social-btn"><i class="fab fa-apple"></i></button></div><div class="auth-footer">No account? <a href="#" class="switch-modal" data-target="signup">Sign up</a></div></div>`;
  modals.signup.innerHTML = `<div class="auth-container"><span class="close-modal">×</span><div class="auth-header"><h2>Create Account</h2></div><form class="auth-form"><div class="form-group"><label for="signupName">Full Name</label><input type="text" placeholder="Your Name" required></div><div class="form-group"><label for="signupEmail">Email</label><input type="email" placeholder="you@example.com" required></div><div class="form-group"><label for="signupPassword">Password</label><input type="password" placeholder="Create a strong password" required></div><button type="submit" class="auth-btn">Create Account</button></form><div class="auth-footer">Already have an account? <a href="#" class="switch-modal" data-target="login">Log in</a></div></div>`;
  
  const switchPage = (pageId) => {
      if (!pages[pageId] || currentPage === pageId) return;
      window.scrollTo(0, 0);
      pages[currentPage].classList.remove('active');
      pages[pageId].classList.add('active');
      currentPage = pageId;
  };
  
  // Attach event listeners for page navigation links
  document.querySelectorAll('.nav-page-link, .logo').forEach(el => {
      el.addEventListener('click', (e) => {
          e.preventDefault();
          switchPage(e.currentTarget.dataset.page);
      });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a.scroll-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // --- 3. MODAL & BASIC UI LOGIC ---
  const openModal = (modalId) => modals[modalId]?.classList.add('active');
  
  document.getElementById('loginBtn')?.addEventListener('click', () => openModal('login'));
  document.getElementById('signupBtn')?.addEventListener('click', () => openModal('signup'));
  document.getElementById('getStartedBtn')?.addEventListener('click', () => openModal('signup'));
  
  document.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-modal') || e.target.classList.contains('auth-modal')) {
          e.target.closest('.auth-modal')?.classList.remove('active');
      }
      if (e.target.classList.contains('switch-modal')) {
          e.preventDefault();
          const currentModal = e.target.closest('.auth-modal');
          const targetModalId = e.target.dataset.target;
          currentModal?.classList.remove('active');
          openModal(targetModalId);
      }
  });

  document.getElementById('mainContactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Message sent! (This is a demo)');
    e.target.reset();
  });

  // --- 4. ADVANCED INTERACTIVITY ---
  const cursorDot = document.querySelector('.cursor.dot');
  const cursorCircle = document.querySelector('.cursor.circle');
  const interactiveElements = document.querySelectorAll('a, button, input');
  window.addEventListener('mousemove', e => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    cursorCircle.style.left = `${e.clientX}px`;
    cursorCircle.style.top = `${e.clientY}px`;
  });
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursorCircle.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursorCircle.classList.remove('grow'));
  });
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'));
  }, { threshold: 0.1 });
  animatedElements.forEach(el => observer.observe(el));
  const heroSection = document.querySelector('.hero');
  const energyCircle = document.getElementById('energyCircle');
  if (heroSection && !window.matchMedia("(pointer: coarse)").matches) {
    heroSection.addEventListener('mousemove', e => {
      const { clientX, clientY } = e, { offsetWidth, offsetHeight } = heroSection;
      const xPos = (clientX/offsetWidth - 0.5) * 30, yPos = (clientY/offsetHeight - 0.5) * 30;
      energyCircle.style.transform = `translate(${xPos}px, ${yPos}px) rotateX(${-yPos/2}deg) rotateY(${xPos/2}deg)`;
    });
    heroSection.addEventListener('mouseleave', () => { energyCircle.style.transform = `translate(0px, 0px) rotateX(0deg) rotateY(0deg)`; });
  }
  const stats = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        const el = entry.target, target = +el.dataset.target, isDecimal = el.dataset.decimal === 'true';
        const duration = 1500, totalFrames = Math.round(duration / (1000 / 60));
        let frame = 0;
        const counter = setInterval(() => {
          frame++;
          const progress = (frame/totalFrames), current = target * progress;
          el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();
          if(frame === totalFrames) {
            clearInterval(counter);
            el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
          }
        }, (1000/60));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.8 });
  stats.forEach(stat => counterObserver.observe(stat));

  console.log("SkillBridge Beast Mode V3 Initialized (with Theme Toggle).");
})();