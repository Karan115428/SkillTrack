// SkillTrack starter: front-end demo only. Data is stored in this browser using localStorage.
const $ = (selector) => document.querySelector(selector);

function readProfile() {
  try { return JSON.parse(localStorage.getItem("skilltrackProfile")) || {}; }
  catch { return {}; }
}
function saveProfile(profile) {
  localStorage.setItem("skilltrackProfile", JSON.stringify(profile));
}
function initials(name = "") {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("") || "KL";
}

// Demo login: accepts any valid email and a password of at least 4 characters.
const loginForm = $("#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = $("#email").value.trim();
    const password = $("#password").value;
    const message = $("#loginMessage");
    if (!email || password.length < 4) {
      message.textContent = "Enter a valid email and a password with at least 4 characters.";
      return;
    }
    localStorage.setItem("skilltrackSignedIn", "true");
    const profile = readProfile();
    if (!profile.email) saveProfile({ ...profile, email, fullName: profile.fullName || email.split("@")[0] });
    window.location.href = "dashboard.html";
  });
}

// Dashboard information
if ($("#dashboardName")) {
  const profile = readProfile();
  $("#dashboardName").textContent = profile.fullName || "Learner";
  const completed = Number(localStorage.getItem("skilltrackCompleted") || 0);
  $("#completedCount").textContent = completed;
}

// Search/filter role cards
if ($("#roleSearch")) {
  const search = $("#roleSearch");
  const cards = [...document.querySelectorAll(".role-card")];
  const updateRoles = () => {
    const term = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matches = card.dataset.role.includes(term);
      card.hidden = !matches;
      if (matches) visible++;
    });
    $("#roleCount").textContent = `${visible} role${visible === 1 ? "" : "s"}`;
    $("#noRoles").hidden = visible !== 0;
  };
  search.addEventListener("input", updateRoles);
}

// Profile form
const profileForm = $("#profileForm");
if (profileForm) {
  const profile = readProfile();
  $("#fullName").value = profile.fullName || "";
  $("#profileEmail").value = profile.email || "";
  $("#targetRole").value = profile.targetRole || "Frontend Developer";
  $("#learningGoal").value = profile.learningGoal || "";
  $("#profileInitials").textContent = initials(profile.fullName || "");
  $("#fullName").addEventListener("input", () => {
    $("#profileInitials").textContent = initials($("#fullName").value);
  });
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfile({
      fullName: $("#fullName").value.trim(),
      email: $("#profileEmail").value.trim(),
      targetRole: $("#targetRole").value,
      learningGoal: $("#learningGoal").value.trim()
    });
    $("#profileMessage").textContent = "Profile saved in this browser.";
  });
}

// Small role-based multiple-choice assessment
const assessmentForm = $("#assessmentForm");
if (assessmentForm) {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || "Frontend Developer";
  $("#assessmentTitle").textContent = role;
  const questionSets = {
    "Frontend Developer": [
      { q: "What is the main purpose of HTML?", options: ["To structure page content", "To manage database records", "To host a server"], correct: 0, skill: "HTML structure" },
      { q: "Which CSS property changes text color?", options: ["font-style", "color", "text-align"], correct: 1, skill: "CSS fundamentals" },
      { q: "Which keyword declares a block-scoped variable in JavaScript?", options: ["let", "print", "style"], correct: 0, skill: "JavaScript basics" }
    ],
    "Backend Developer": [
      { q: "What is a common purpose of an API?", options: ["Connect software systems", "Style a web page", "Compress images only"], correct: 0, skill: "API concepts" },
      { q: "Which environment runs JavaScript outside a browser?", options: ["Figma", "Node.js", "CSS"], correct: 1, skill: "Node.js basics" },
      { q: "Why validate data on the server?", options: ["For security and data integrity", "To change font size", "To improve page colors"], correct: 0, skill: "Server-side validation" }
    ],
    "Full Stack Developer": [
      { q: "What does a frontend usually handle?", options: ["User interface", "Only database backups", "Operating system drivers"], correct: 0, skill: "Frontend fundamentals" },
      { q: "What is the role of a backend API?", options: ["Exchange data and process requests", "Choose page colors", "Create CSS animations only"], correct: 0, skill: "API development" },
      { q: "What is a database used for?", options: ["Store and organize data", "Render icons", "Style buttons"], correct: 0, skill: "Database concepts" }
    ],
    "Java Developer": [
      { q: "Which keyword is used to create a class in Java?", options: ["class", "define", "object"], correct: 0, skill: "Java syntax" },
      { q: "Which concept allows one class to inherit another class?", options: ["Inheritance", "Iteration", "Compilation"], correct: 0, skill: "Object-oriented programming" },
      { q: "Which structure stores multiple values of the same declared type?", options: ["Array", "if statement", "method call"], correct: 0, skill: "Arrays and data structures" }
    ]
  };
  const questions = questionSets[role] || questionSets["Frontend Developer"];
  let current = 0;
  const answers = new Array(questions.length).fill(null);

  function renderQuestion() {
    const item = questions[current];
    $("#questionLabel").textContent = `Question ${current + 1} of ${questions.length}`;
    $("#progressPercent").textContent = `${Math.round(((current + 1) / questions.length) * 100)}%`;
    $("#progressBar").style.width = `${((current + 1) / questions.length) * 100}%`;
    $("#questionArea").innerHTML = `
      <p class="question-number">QUESTION ${String(current + 1).padStart(2, "0")}</p>
      <h2 class="question-title">${item.q}</h2>
      <div class="answer-list">${item.options.map((option, index) => `
        <label class="answer-option"><input type="radio" name="answer" value="${index}" ${answers[current] === index ? "checked" : ""}>
        <span>${option}</span></label>`).join("")}</div>`;
    $("#prevQuestion").disabled = current === 0;
    $("#nextQuestion").hidden = current === questions.length - 1;
    $("#submitAssessment").hidden = current !== questions.length - 1;
    $("#quizMessage").textContent = "";
  }
  $("#questionArea").addEventListener("change", event => {
    if (event.target.name === "answer") answers[current] = Number(event.target.value);
  });
  $("#prevQuestion").addEventListener("click", () => { if (current > 0) { current--; renderQuestion(); } });
  $("#nextQuestion").addEventListener("click", () => {
    if (answers[current] === null) { $("#quizMessage").textContent = "Choose an answer before continuing."; return; }
    if (current < questions.length - 1) { current++; renderQuestion(); }
  });
  assessmentForm.addEventListener("submit", event => {
    event.preventDefault();
    if (answers[current] === null) { $("#quizMessage").textContent = "Choose an answer before submitting."; return; }
    if (answers.some(answer => answer === null)) { $("#quizMessage").textContent = "Please answer every question first."; return; }
    const score = answers.reduce((total, answer, index) => total + (answer === questions[index].correct ? 1 : 0), 0);
    const percent = Math.round(score / questions.length * 100);
    localStorage.setItem("skilltrackCompleted", String(Number(localStorage.getItem("skilltrackCompleted") || 0) + 1));
    const weakSkills = questions.filter((question, index) => answers[index] !== question.correct).map(question => question.skill);
    $("#resultPanel").hidden = false;
    $("#resultPanel").innerHTML = `
      <p class="eyebrow">ASSESSMENT COMPLETE</p><h2>Your practice result</h2>
      <div class="result-score">${percent}%</div><p>You answered <strong>${score} of ${questions.length}</strong> questions correctly for ${role}.</p>
      <h3>Suggested next steps</h3>
      ${weakSkills.length ? `<p class="subtext">Spend some time revising these areas:</p><ul class="recommendation-list">${weakSkills.map(skill => `<li>${skill}</li>`).join("")}</ul>` : `<p class="subtext">Great work. Try a more advanced quiz or build a small project to reinforce these skills.</p>`}
      <a class="btn btn-primary" href="roles.html">Explore another role →</a>
      <a class="btn btn-outline" href="dashboard.html">Back to dashboard</a>`;
    assessmentForm.hidden = true;
    $("#resultPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  renderQuestion();
}
