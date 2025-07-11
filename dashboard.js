document.addEventListener('DOMContentLoaded', function() {
  // --- DATA & STATE MANAGEMENT ---
  let roadmapStepsData = [
    { id: 1, title: "HTML & CSS Fundamentals", description: "Learn core web development concepts and build basic layouts", status: 'completed' },
    { id: 2, title: "JavaScript Basics", description: "Master variables, functions, and DOM manipulation", status: 'completed' },
    { id: 3, title: "Responsive Design", description: "Learn Flexbox, Grid, and media queries", status: 'completed' },
    { id: 4, title: "Git & GitHub", description: "Version control and collaboration essentials", status: 'completed' },
    { id: 5, title: "React Fundamentals", description: "Components, props, state, and hooks", status: 'current' },
    { id: 6, title: "Advanced React Patterns", description: "Context API, Redux, and performance optimization", status: 'locked' },
    { id: 7, title: "Build Portfolio Projects", description: "3 real-world projects to showcase your skills", status: 'locked' }
  ];

  let progressData = { completed: 65 };
  let weeklyGoal = "Complete React Hooks module and build a todo app with state management.";
  let interviewQuestions = [
    "Tell me about yourself.", "What are your strengths?", "What are your weaknesses?", "Why do you want this job?",
    "How do you ensure continuous improvement?"
  ];
  let currentQuestionIndex = 0;
  let chatHistory = [];
  let currentChatId = null;

  // --- DOM ELEMENT SELECTORS ---
  const selectors = {
    dashboard: document.querySelector('.main-content'),
    myRoadmapSection: document.getElementById('my-roadmap'),
    learningResourcesSection: document.getElementById('learning-resources'),
    projectsSection: document.getElementById('projects'),
    aiChatSection: document.getElementById('ai-chat'),
    roadmapContainer: document.getElementById('roadmapSteps'),
    addSkillToggleBtn: document.getElementById('addSkillToggleBtn'),
    addSkillFormContainer: document.getElementById('addSkillFormContainer'),
    cancelAddSkill: document.getElementById('cancelAddSkill'),
    submitAddSkill: document.getElementById('submitAddSkill'),
    skillTitleInput: document.getElementById('skillTitle'),
    skillDescriptionInput: document.getElementById('skillDescription'),
    weeklyGoalText: document.getElementById('weeklyGoalText'),
    weeklyGoalInput: document.getElementById('weeklyGoalInput'),
    addWeeklyGoalBtn: document.getElementById('addWeeklyGoal'),
    clearWeeklyGoalBtn: document.getElementById('clearWeeklyGoal'),
    interviewQuestion: document.getElementById('interviewQuestion'),
    interviewAnswer: document.getElementById('interviewAnswer'),
    nextQuestionBtn: document.getElementById('nextQuestion'),
    myRoadmapLink: document.querySelector('a[href="#my-roadmap"]'),
    backToDashboardBtn: document.getElementById('backToDashboard'),
    learningResourcesLink: document.querySelector('a[href="#learning-resources"]'),
    backToDashboardResourcesBtn: document.getElementById('backToDashboardResources'),
    projectsLink: document.querySelector('a[href="#projects"]'),
    backToDashboardProjectsBtn: document.getElementById('backToDashboardProjects'),
    backToDashboardAIBtn: document.getElementById('backToDashboardAI'),
    userProfile: document.getElementById('userProfile'),
    profileModal: document.getElementById('profileModal'),
    profileForm: document.getElementById('profileForm'),
    profileNameInput: document.getElementById('profileName'),
    profileCareerPathInput: document.getElementById('profileCareerPath'),
    welcomeTitle: document.getElementById('welcomeTitle'),
    userName: document.getElementById('userName'),
    userCareerPath: document.getElementById('userCareerPath'),
    userAvatar: document.getElementById('userAvatar'),
    settingsLink: document.querySelector('a[href="#settings"]'),
    settingsModal: document.getElementById('settingsModal'),
    settingsForm: document.getElementById('settingsForm'),
    settingsNameInput: document.getElementById('settingsName'),
    settingsEmailInput: document.getElementById('settingsEmail'),
    currentPasswordInput: document.getElementById('currentPassword'),
    newPasswordInput: document.getElementById('newPassword'),
    confirmPasswordInput: document.getElementById('confirmPassword'),
    generateRoadmapBtn: document.getElementById('generateRoadmapBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    aiInput: document.getElementById('aiInput'),
    aiSend: document.getElementById('aiSend'),
    aiMessages: document.getElementById('aiMessages'),
    chatHistoryList: document.getElementById('chatHistoryList'),
    exportPDFBtn: document.querySelector('.step-btn.primary i.fa-download')?.parentElement,
    interviewList: document.getElementById('interviewList'),
    themeToggle: document.getElementById('themeToggle'),
    themeToggleRoadmap: document.getElementById('themeToggleRoadmap'),
    themeToggleResources: document.getElementById('themeToggleResources'),
    themeToggleProjects: document.getElementById('themeToggleProjects'),
    themeToggleAI: document.getElementById('themeToggleAI'),
    editProfileBtn: document.getElementById('editProfileBtn'),
    profileModalClose: document.getElementById('profileModalClose'),
    profileCancel: document.getElementById('profileCancel'),
    settingsModalClose: document.getElementById('settingsModalClose'),
    settingsCancel: document.getElementById('settingsCancel')
  };

  // Check for missing DOM elements
  for (const [key, value] of Object.entries(selectors)) {
    if (!value) console.error(`DOM element ${key} not found`);
  }

  // --- API CONFIG ---
  const GEMINI_API_KEY = 'AIzaSyA07AArQtYT6YmwUrXkmKxMsdfUD8SFB3k';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  // --- RENDERING FUNCTIONS ---
  function renderRoadmap() {
    if (!selectors.roadmapContainer) return;
    selectors.roadmapContainer.innerHTML = '';
    roadmapStepsData.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'roadmap-step';
      stepEl.dataset.id = step.id;

      let dotClass = step.status === 'completed' ? 'completed' : step.status === 'current' ? 'current' : '';
      let connectorClass = step.status === 'completed' ? 'completed' : '';
      let actionsHtml = step.status === 'completed' ? `
        <button class="step-btn secondary"><i class="fas fa-book"></i> Resources</button>
        <button class="step-btn secondary mark-complete-btn" style="background: var(--secondary); color: var(--dark); border: none;" disabled>
          <i class="fas fa-check-circle"></i> Completed
        </button>
        <button class="remove-skill-btn" data-id="${step.id}">Remove</button>
      ` : step.status === 'current' ? `
        <button class="step-btn primary"><i class="fas fa-play"></i> Start Learning</button>
        <button class="step-btn secondary"><i class="fas fa-book"></i> Resources</button>
        <button class="step-btn secondary mark-complete-btn"><i class="fas fa-check"></i> Mark Complete</button>
        <button class="remove-skill-btn" data-id="${step.id}">Remove</button>
      ` : `
        <button class="step-btn secondary" disabled><i class="fas fa-lock"></i> Locked</button>
        <button class="remove-skill-btn" data-id="${step.id}">Remove</button>
      `;

      const showConnector = index < roadmapStepsData.length - 1;

      stepEl.innerHTML = `
        <div class="step-indicator">
          <div class="step-dot ${dotClass}"></div>
          ${showConnector ? `<div class="step-connector ${connectorClass}"></div>` : ''}
        </div>
        <div class="step-content">
          <h4 class="step-title">${step.title}</h4>
          <p class="step-description">${step.description}</p>
          <div class="step-actions">${actionsHtml}</div>
        </div>
      `;

      selectors.roadmapContainer.appendChild(stepEl);
    });

    attachRoadmapEventListeners();
  }

  function renderInterviewQuestions() {
    if (!selectors.interviewList) return;
    selectors.interviewList.innerHTML = '';
    interviewQuestions.slice(0, 100).forEach(question => {
      const item = document.createElement('div');
      item.className = 'interview-item';
      item.textContent = question;
      selectors.interviewList.appendChild(item);
    });
  }

  function renderChatHistory() {
    if (!selectors.chatHistoryList) return;
    selectors.chatHistoryList.innerHTML = '';
    chatHistory.forEach((chat, index) => {
      const item = document.createElement('div');
      item.className = `chat-history-item ${currentChatId === chat.id ? 'active' : ''}`;
      item.textContent = chat.title || `Chat ${index + 1}`;
      item.dataset.chatId = chat.id;
      item.addEventListener('click', () => loadChat(chat.id));
      selectors.chatHistoryList.appendChild(item);
    });
  }

  function attachRoadmapEventListeners() {
    document.querySelectorAll('.mark-complete-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', handleMarkComplete);
    });
    document.querySelectorAll('.remove-skill-btn').forEach(btn => {
      btn.addEventListener('click', handleRemoveSkill);
    });
  }

  // --- TOAST NOTIFICATION ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- API CALL FUNCTION ---
  async function callGeminiAPI(prompt) {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('API Error:', error);
      showToast('Failed to connect to AI service.', 'error');
      return 'Sorry, I couldn’t process your request. Please try again.';
    }
  }

  // --- EVENT HANDLERS ---
  function handleMarkComplete(event) {
    const stepId = parseInt(event.target.closest('.roadmap-step').dataset.id);
    const currentStepIndex = roadmapStepsData.findIndex(s => s.id === stepId);

    if (currentStepIndex > -1 && roadmapStepsData[currentStepIndex].status === 'current') {
      roadmapStepsData[currentStepIndex].status = 'completed';
      if (currentStepIndex + 1 < roadmapStepsData.length) {
        roadmapStepsData[currentStepIndex + 1].status = 'current';
        const nextStepEl = selectors.roadmapContainer.querySelector(`[data-id="${roadmapStepsData[currentStepIndex + 1].id}"]`);
        if (nextStepEl) {
          nextStepEl.classList.add('newly-unlocked');
          setTimeout(() => nextStepEl.classList.remove('newly-unlocked'), 500);
        }
      }
      renderRoadmap();
      updateProgressStats();
      showToast('Step marked as completed!');
    }
  }

  function handleRemoveSkill(event) {
    const stepId = parseInt(event.target.dataset.id);
    const stepIndex = roadmapStepsData.findIndex(s => s.id === stepId);
    if (stepIndex > -1) {
      roadmapStepsData.splice(stepIndex, 1);
      renderRoadmap();
      updateProgressStats();
      showToast('Skill removed from roadmap.');
    }
  }

  function updateProgressStats() {
    const completedSteps = roadmapStepsData.filter(step => step.status === 'completed').length;
    const totalSteps = roadmapStepsData.length;
    const newProgress = Math.round((completedSteps / totalSteps) * 100) || 0;

    progressData.completed = totalSteps > 0 ? newProgress : 0;
    if (selectors.progressPercent && selectors.progressFill) {
      selectors.progressPercent.textContent = `${newProgress}%`;
      selectors.progressFill.style.width = `${newProgress}%`;
    }
  }

  // --- WEEKLY GOAL FUNCTIONALITY ---
  if (selectors.addWeeklyGoalBtn) {
    selectors.addWeeklyGoalBtn.addEventListener('click', () => {
      const newGoal = selectors.weeklyGoalInput?.value.trim();
      if (newGoal) {
        weeklyGoal = newGoal;
        selectors.weeklyGoalText.textContent = weeklyGoal;
        selectors.weeklyGoalInput.value = '';
        showToast('Weekly goal updated!');
      }
    });
  }

  if (selectors.clearWeeklyGoalBtn) {
    selectors.clearWeeklyGoalBtn.addEventListener('click', () => {
      weeklyGoal = "";
      selectors.weeklyGoalText.textContent = "No weekly goal set.";
      selectors.weeklyGoalInput.value = '';
      showToast('Weekly goal cleared.');
    });
  }

  // --- INTERVIEW PREP FUNCTIONALITY ---
  function showNextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % interviewQuestions.length;
    if (selectors.interviewQuestion) {
      selectors.interviewQuestion.textContent = interviewQuestions[currentQuestionIndex];
      selectors.interviewAnswer.style.display = 'none';
    }
  }

  if (selectors.nextQuestionBtn) {
    selectors.nextQuestionBtn.addEventListener('click', showNextQuestion);
  }

  if (selectors.interviewQuestion) {
    selectors.interviewQuestion.addEventListener('click', () => {
      selectors.interviewAnswer.style.display = selectors.interviewAnswer.style.display === 'block' ? 'none' : 'block';
    });
  }

  // --- ADD SKILL FUNCTIONALITY ---
  if (selectors.addSkillToggleBtn) {
    selectors.addSkillToggleBtn.addEventListener('click', () => {
      selectors.addSkillFormContainer.style.display = 'block';
      selectors.addSkillToggleBtn.style.display = 'none';
    });
  }

  if (selectors.cancelAddSkill) {
    selectors.cancelAddSkill.addEventListener('click', () => {
      selectors.addSkillFormContainer.style.display = 'none';
      selectors.addSkillToggleBtn.style.display = 'flex';
      selectors.skillTitleInput.value = '';
      selectors.skillDescriptionInput.value = '';
    });
  }

  if (selectors.submitAddSkill) {
    selectors.submitAddSkill.addEventListener('click', () => {
      const title = selectors.skillTitleInput.value.trim();
      const description = selectors.skillDescriptionInput.value.trim();

      if (title && description) {
        const newSkill = {
          id: Date.now(),
          title,
          description,
          status: 'locked'
        };
        roadmapStepsData.splice(roadmapStepsData.length - 1, 0, newSkill);
        renderRoadmap();
        selectors.skillTitleInput.value = '';
        selectors.skillDescriptionInput.value = '';
        selectors.addSkillFormContainer.style.display = 'none';
        selectors.addSkillToggleBtn.style.display = 'flex';
        updateProgressStats();
        showToast('New skill added to roadmap!');
      }
    });
  }

  // --- THEME TOGGLE ---
  const themeToggles = [
    selectors.themeToggle,
    selectors.themeToggleRoadmap,
    selectors.themeToggleResources,
    selectors.themeToggleProjects,
    selectors.themeToggleAI
  ].filter(Boolean);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('theme', theme);
    });
  });

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') document.body.classList.add('light-mode');

  // --- PROFILE MENU ---
  if (selectors.userProfile && selectors.profileMenu) {
    selectors.userProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      selectors.profileMenu.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      selectors.profileMenu.classList.remove('active');
    });
  }

  // --- MODAL FUNCTIONALITY ---
  if (selectors.editProfileBtn) {
    selectors.editProfileBtn.addEventListener('click', () => {
      selectors.profileMenu.classList.remove('active');
      selectors.profileModal.classList.add('active');
      selectors.profileNameInput.value = selectors.userName.textContent;
      selectors.profileCareerPathInput.value = selectors.userCareerPath.textContent;
    });
  }

  if (selectors.profileModalClose) {
    selectors.profileModalClose.addEventListener('click', () => {
      selectors.profileModal.classList.remove('active');
    });
  }

  if (selectors.profileCancel) {
    selectors.profileCancel.addEventListener('click', () => {
      selectors.profileModal.classList.remove('active');
    });
  }

  if (selectors.profileForm) {
    selectors.profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = selectors.profileNameInput.value.trim();
      const newCareerPath = selectors.profileCareerPathInput.value.trim();

      if (newName && newCareerPath) {
        selectors.userName.textContent = newName;
        selectors.userCareerPath.textContent = newCareerPath;
        selectors.welcomeTitle.textContent = `Welcome Back, ${newName.split(' ')[0]}!`;
        const initials = newName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
        selectors.userAvatar.textContent = initials;
        localStorage.setItem('userName', newName);
        localStorage.setItem('userCareerPath', newCareerPath);
        selectors.profileModal.classList.remove('active');
        showToast('Profile updated successfully!');
      }
    });
  }

  // --- SETTINGS MODAL ---
  if (selectors.settingsLink) {
    selectors.settingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      selectors.settingsModal.classList.add('active');
      selectors.settingsNameInput.value = selectors.userName.textContent;
      selectors.settingsEmailInput.value = localStorage.getItem('userEmail') || 'john.doe@example.com';
    });
  }

  if (selectors.settingsModalClose) {
    selectors.settingsModalClose.addEventListener('click', () => {
      selectors.settingsModal.classList.remove('active');
    });
  }

  if (selectors.settingsCancel) {
    selectors.settingsCancel.addEventListener('click', () => {
      selectors.settingsModal.classList.remove('active');
    });
  }

  if (selectors.settingsForm) {
    selectors.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = selectors.settingsNameInput.value.trim();
      const newEmail = selectors.settingsEmailInput.value.trim();
      const currentPassword = selectors.currentPasswordInput.value;
      const newPassword = selectors.newPasswordInput.value;
      const confirmPassword = selectors.confirmPasswordInput.value;

      if (newName && newEmail && currentPassword && newPassword && confirmPassword) {
        if (newPassword === confirmPassword) {
          selectors.userName.textContent = newName;
          selectors.welcomeTitle.textContent = `Welcome Back, ${newName.split(' ')[0]}!`;
          const initials = newName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
          selectors.userAvatar.textContent = initials;
          localStorage.setItem('userName', newName);
          localStorage.setItem('userEmail', newEmail);
          selectors.settingsModal.classList.remove('active');
          selectors.settingsForm.reset();
          showToast('Settings updated successfully!');
        } else {
          showToast('New passwords do not match!', 'error');
        }
      }
    });
  }

  // --- NAVIGATION ---
  function updateActiveNav(link) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (link) link.classList.add('active');
  }

  function showSection(section) {
    selectors.dashboard.style.display = 'none';
    selectors.myRoadmapSection.style.display = 'none';
    selectors.learningResourcesSection.style.display = 'none';
    selectors.projectsSection.style.display = 'none';
    selectors.aiChatSection.style.display = 'none';
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
  }

  if (selectors.myRoadmapLink) {
    selectors.myRoadmapLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(selectors.myRoadmapSection);
      renderRoadmap();
      updateActiveNav(selectors.myRoadmapLink);
    });
  }

  if (selectors.backToDashboardBtn) {
    selectors.backToDashboardBtn.addEventListener('click', () => {
      showSection(selectors.dashboard);
      updateActiveNav(document.querySelector('a[href="#"]'));
    });
  }

  if (selectors.learningResourcesLink) {
    selectors.learningResourcesLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(selectors.learningResourcesSection);
      updateActiveNav(selectors.learningResourcesLink);
    });
  }

  if (selectors.backToDashboardResourcesBtn) {
    selectors.backToDashboardResourcesBtn.addEventListener('click', () => {
      showSection(selectors.dashboard);
      updateActiveNav(document.querySelector('a[href="#"]'));
    });
  }

  if (selectors.projectsLink) {
    selectors.projectsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(selectors.projectsSection);
      updateActiveNav(selectors.projectsLink);
    });
  }

  if (selectors.backToDashboardProjectsBtn) {
    selectors.backToDashboardProjectsBtn.addEventListener('click', () => {
      showSection(selectors.dashboard);
      updateActiveNav(document.querySelector('a[href="#"]'));
    });
  }

  if (selectors.generateRoadmapBtn) {
    selectors.generateRoadmapBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(selectors.aiChatSection);
      updateActiveNav(selectors.generateRoadmapBtn);
      if (!currentChatId) startNewChat();
    });
  }

  if (selectors.backToDashboardAIBtn) {
    selectors.backToDashboardAIBtn.addEventListener('click', () => {
      showSection(selectors.dashboard);
      updateActiveNav(document.querySelector('a[href="#"]'));
    });
  }

  // --- AI CHAT FUNCTIONALITY ---
  function addAIMessage(text, isUser = false, chatId = currentChatId) {
    if (!chatId) return;
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;

    chat.messages.push({ text, isUser });
    const message = document.createElement('div');
    message.className = `ai-message ${isUser ? 'user' : 'bot'}`;
    message.textContent = text;
    selectors.aiMessages.appendChild(message);
    selectors.aiMessages.scrollTop = selectors.aiMessages.scrollHeight;
  }

  function startNewChat() {
    currentChatId = Date.now();
    const chatTitle = `Chat ${chatHistory.length + 1}`;
    chatHistory.push({ id: currentChatId, title: chatTitle, messages: [] });
    selectors.aiMessages.innerHTML = '';
    addAIMessage(`Hi ${selectors.userName.textContent.split(' ')[0]}! I'm your AI career assistant. How can I help you with your ${selectors.userCareerPath.textContent} journey today? Type your question or request a roadmap (e.g., "Generate a roadmap for Frontend Developer, 6 months").`, false, currentChatId);
    renderChatHistory();
    selectors.aiInput.value = '';
    selectors.aiInput.focus();
  }

  function loadChat(chatId) {
    currentChatId = chatId;
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;

    selectors.aiMessages.innerHTML = '';
    chat.messages.forEach(msg => {
      const message = document.createElement('div');
      message.className = `ai-message ${msg.isUser ? 'user' : 'bot'}`;
      message.textContent = msg.text;
      selectors.aiMessages.appendChild(message);
    });
    selectors.aiMessages.scrollTop = selectors.aiMessages.scrollHeight;
    renderChatHistory();
  }

  if (selectors.newChatBtn) {
    selectors.newChatBtn.addEventListener('click', startNewChat);
  }

  if (selectors.aiSend) {
    selectors.aiSend.addEventListener('click', async () => {
      const userInput = selectors.aiInput.value.trim();
      if (!userInput) return;

      const chat = chatHistory.find(c => c.id === currentChatId);
      if (!chat.title || chat.title.startsWith('Chat ')) {
        chat.title = userInput.slice(0, 30);
      }
      addAIMessage(userInput, true);

      const match = userInput.match(/(.+),\s*(\d+)\s*months?/i);
      let response;

      if (match) {
        const careerPath = match[1].trim();
        const timeline = match[2];
        const prompt = `Generate a career roadmap with a list of skills and milestones for a ${careerPath} over a timeline of ${timeline} months. Provide only the skills and milestones in a structured JSON format, focusing on actionable steps tailored to the given timeline.`;
        
        try {
          const roadmapText = await callGeminiAPI(prompt);
          let roadmapData;
          try {
            roadmapData = JSON.parse(roadmapText);
          } catch (e) {
            throw new Error('Invalid JSON response from API');
          }
          addAIMessage('Here’s your personalized roadmap:');
          roadmapData.forEach(item => {
            addAIMessage(`${item.skill || item.milestone}: ${item.description}`);
          });

          roadmapStepsData = roadmapData.map((item, index) => ({
            id: Date.now() + index,
            title: item.skill || item.milestone,
            description: item.description || 'Learn and practice this skill/milestone',
            status: index === 0 ? 'current' : 'locked'
          }));

          renderRoadmap();
          updateProgressStats();
          showToast('Roadmap generated successfully!');
        } catch (error) {
          addAIMessage('Sorry, I couldn’t generate the roadmap. Please try again.');
          showToast('Failed to generate roadmap.', 'error');
        }
      } else {
        const prompt = `You are a career assistant helping a ${selectors.userCareerPath.textContent} developer. Respond to: ${userInput}`;
        response = await callGeminiAPI(prompt);
        addAIMessage(response);
      }

      selectors.aiInput.value = '';
      renderChatHistory();
    });
  }

  if (selectors.aiInput) {
    selectors.aiInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') selectors.aiSend.click();
    });
  }

  // --- EXPORT PDF ---
  if (selectors.exportPDFBtn) {
    selectors.exportPDFBtn.addEventListener('click', () => {
      if (!window.jspdf) {
        showToast('PDF library not loaded. Please try again.', 'error');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('SkillBridge Progress Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Name: ${selectors.userName.textContent}`, 20, 30);
      doc.text(`Career Path: ${selectors.userCareerPath.textContent}`, 20, 40);
      doc.text(`Progress: ${progressData.completed}%`, 20, 50);
      doc.text(`Weekly Goal: ${weeklyGoal || 'None'}`, 20, 60);
      doc.setFontSize(14);
      doc.text('Roadmap Progress:', 20, 80);
      let y = 90;
      roadmapStepsData.forEach(step => {
        doc.text(`${step.title}: ${step.status}`, 20, y);
        y += 10;
      });
      doc.save('SkillBridge_Progress_Report.pdf');
      showToast('Progress report downloaded!');
    });
  }

  // --- INITIALIZATION ---
  const savedName = localStorage.getItem('userName');
  const savedCareerPath = localStorage.getItem('userCareerPath');
  const savedEmail = localStorage.getItem('userEmail');
  if (savedName) selectors.userName.textContent = savedName;
  if (savedCareerPath) selectors.userCareerPath.textContent = savedCareerPath;
  if (savedEmail) selectors.settingsEmailInput.value = savedEmail;
  selectors.welcomeTitle.textContent = `Welcome Back, ${selectors.userName.textContent.split(' ')[0]}!`;
  const initials = selectors.userName.textContent.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  selectors.userAvatar.textContent = initials;

  selectors.weeklyGoalText.textContent = weeklyGoal || 'No weekly goal set.';
  updateProgressStats();
  showNextQuestion();
  renderInterviewQuestions();
  renderRoadmap();

  console.log('SkillBridge Dashboard Initialized');
});