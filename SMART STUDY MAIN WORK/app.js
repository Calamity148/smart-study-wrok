// Study Guide PWA - Main Application
;(() => {
    // Application State
    let currentUser = null
    let currentRoute = "auth"
    const currentQuiz = null
    const currentQuestionIndex = 0
    const quizAnswers = []
  
    // Quiz Seed Data
    const QUIZ_SEED = [
      {
        id: 1,
        question: "What does the <meta viewport> tag control in HTML?",
        options: [
          "The page's SEO ranking",
          "How the page is displayed on mobile devices",
          "The page's loading speed",
          "The page's color scheme",
        ],
        correct: 1,
        explanation:
          "The viewport meta tag controls how a web page is displayed on mobile devices by setting the visible area of the page.",
      },
      {
        id: 2,
        question: "Which CSS property sets element spacing outside the border?",
        options: ["padding", "margin", "border-spacing", "gap"],
        correct: 1,
        explanation: "Margin sets the space outside an element's border, while padding sets space inside the border.",
      },
      {
        id: 3,
        question: "What does the === operator check compared to == in JavaScript?",
        options: ["Only value equality", "Only type equality", "Both value and type equality", "Neither value nor type"],
        correct: 2,
        explanation:
          "The === operator checks for strict equality (both value and type), while == performs type coercion.",
      },
      {
        id: 4,
        question: "What is localStorage's persistence model?",
        options: [
          "Data persists until browser restart",
          "Data persists until tab is closed",
          "Data persists until manually cleared",
          "Data persists for 24 hours only",
        ],
        correct: 2,
        explanation: "localStorage data persists until it's manually cleared by the user or the application.",
      },
      {
        id: 5,
        question: "What is the primary purpose of a service worker in PWAs?",
        options: [
          "To style the application",
          "To handle offline functionality and caching",
          "To manage user authentication",
          "To optimize images",
        ],
        correct: 1,
        explanation: "Service workers enable offline functionality by intercepting network requests and managing cache.",
      },
      {
        id: 6,
        question: "Why should passwords be hashed instead of stored as plain text?",
        options: [
          "To save storage space",
          "To improve login performance",
          "To protect user data if database is compromised",
          "To enable password recovery",
        ],
        correct: 2,
        explanation:
          "Hashing passwords protects user data even if the database is compromised, as the original passwords cannot be easily recovered.",
      },
      {
        id: 7,
        question: "What does the 'git clone' command do?",
        options: [
          "Creates a new branch",
          "Downloads a copy of a remote repository",
          "Merges two branches",
          "Deletes a repository",
        ],
        correct: 1,
        explanation: "git clone downloads a complete copy of a remote repository to your local machine.",
      },
      {
        id: 8,
        question: "What does HTTP status code 404 mean?",
        options: ["Server error", "Unauthorized access", "Resource not found", "Request timeout"],
        correct: 2,
        explanation: "HTTP 404 indicates that the requested resource could not be found on the server.",
      },
      {
        id: 9,
        question: "What does Array.prototype.map() return?",
        options: [
          "The original array modified",
          "A new array with transformed elements",
          "The first matching element",
          "A boolean value",
        ],
        correct: 1,
        explanation: "Array.map() returns a new array with each element transformed by the provided function.",
      },
      {
        id: 10,
        question: "What is the purpose of ARIA attributes in web accessibility?",
        options: [
          "To improve SEO rankings",
          "To provide semantic information for assistive technologies",
          "To enhance visual styling",
          "To optimize page loading",
        ],
        correct: 1,
        explanation:
          "ARIA attributes provide semantic information that helps assistive technologies understand and navigate web content.",
      },
    ]
  
    // Storage Module
    const Storage = {
      get(key) {
        try {
          const item = localStorage.getItem(key)
          return item ? JSON.parse(item) : null
        } catch (error) {
          console.error("Storage get error:", error)
          return null
        }
      },
  
      set(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value))
          return true
        } catch (error) {
          console.error("Storage set error:", error)
          return false
        }
      },
  
      remove(key) {
        try {
          localStorage.removeItem(key)
          return true
        } catch (error) {
          console.error("Storage remove error:", error)
          return false
        }
      },
  
      clear() {
        try {
          localStorage.clear()
          return true
        } catch (error) {
          console.error("Storage clear error:", error)
          return false
        }
      },
    }
  
    // Session Module
    const Session = {
      get() {
        try {
          const session = sessionStorage.getItem("currentUser")
          return session ? JSON.parse(session) : null
        } catch (error) {
          console.error("Session get error:", error)
          return null
        }
      },
  
      set(user) {
        try {
          sessionStorage.setItem("currentUser", JSON.stringify(user))
          return true
        } catch (error) {
          console.error("Session set error:", error)
          return false
        }
      },
  
      clear() {
        try {
          sessionStorage.removeItem("currentUser")
          return true
        } catch (error) {
          console.error("Session clear error:", error)
          return false
        }
      },
    }
  
    // Crypto Module
    const Crypto = {
      async hash(text) {
        try {
          const encoder = new TextEncoder()
          const data = encoder.encode(text)
          const hashBuffer = await crypto.subtle.digest("SHA-256", data)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
        } catch (error) {
          console.error("Crypto hash error:", error)
          throw new Error("Failed to hash password")
        }
      },
    }
  
    // Data Module
    const Data = {
      init() {
        // Initialize data structures if they don't exist
        if (!Storage.get("users")) {
          Storage.set("users", [])
        }
        if (!Storage.get("notes")) {
          Storage.set("notes", [])
        }
        if (!Storage.get("quizQuestions")) {
          Storage.set("quizQuestions", QUIZ_SEED)
        }
        if (!Storage.get("quizResults")) {
          Storage.set("quizResults", [])
        }
        if (!Storage.get("nextIds")) {
          Storage.set("nextIds", {
            user: 1,
            note: 1,
            question: QUIZ_SEED.length + 1,
            result: 1,
          })
        }
      },
  
      getNextId(type) {
        const nextIds = Storage.get("nextIds") || {}
        const id = nextIds[type] || 1
        nextIds[type] = id + 1
        Storage.set("nextIds", nextIds)
        return id
      },
  
      // Users
      getUsers() {
        return Storage.get("users") || []
      },
  
      getUserByUsername(username) {
        const users = this.getUsers()
        return users.find((user) => user.username === username)
      },
  
      getUserById(id) {
        const users = this.getUsers()
        return users.find((user) => user.id === id)
      },
  
      createUser(userData) {
        const users = this.getUsers()
        const newUser = {
          id: this.getNextId("user"),
          ...userData,
          createdAt: new Date().toISOString(),
        }
        users.push(newUser)
        Storage.set("users", users)
        return newUser
      },
  
      updateUser(id, updates) {
        const users = this.getUsers()
        const index = users.findIndex((user) => user.id === id)
        if (index !== -1) {
          users[index] = { ...users[index], ...updates }
          Storage.set("users", users)
          return users[index]
        }
        return null
      },
  
      deleteUser(id) {
        const users = this.getUsers()
        const filteredUsers = users.filter((user) => user.id !== id)
        Storage.set("users", filteredUsers)
  
        // Cascade delete user's notes and results
        this.deleteNotesByUserId(id)
        this.deleteResultsByUserId(id)
      },
  
      // Notes
      getNotes() {
        return Storage.get("notes") || []
      },
  
      getNotesByUserId(userId) {
        const notes = this.getNotes()
        return notes.filter((note) => note.userId === userId)
      },
  
      createNote(noteData) {
        const notes = this.getNotes()
        const newNote = {
          id: this.getNextId("note"),
          ...noteData,
          updatedAt: new Date().toISOString(),
        }
        notes.push(newNote)
        Storage.set("notes", notes)
        return newNote
      },
  
      updateNote(id, updates) {
        const notes = this.getNotes()
        const index = notes.findIndex((note) => note.id === id)
        if (index !== -1) {
          notes[index] = {
            ...notes[index],
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          Storage.set("notes", notes)
          return notes[index]
        }
        return null
      },
  
      deleteNote(id) {
        const notes = this.getNotes()
        const filteredNotes = notes.filter((note) => note.id !== id)
        Storage.set("notes", filteredNotes)
      },
  
      deleteNotesByUserId(userId) {
        const notes = this.getNotes()
        const filteredNotes = notes.filter((note) => note.userId !== userId)
        Storage.set("notes", filteredNotes)
      },
  
      // Quiz Questions
      getQuizQuestions() {
        return Storage.get("quizQuestions") || []
      },
  
      createQuizQuestion(questionData) {
        const questions = this.getQuizQuestions()
        const newQuestion = {
          id: this.getNextId("question"),
          ...questionData,
        }
        questions.push(newQuestion)
        Storage.set("quizQuestions", questions)
        return newQuestion
      },
  
      updateQuizQuestion(id, updates) {
        const questions = this.getQuizQuestions()
        const index = questions.findIndex((q) => q.id === id)
        if (index !== -1) {
          questions[index] = { ...questions[index], ...updates }
          Storage.set("quizQuestions", questions)
          return questions[index]
        }
        return null
      },
  
      deleteQuizQuestion(id) {
        const questions = this.getQuizQuestions()
        const filteredQuestions = questions.filter((q) => q.id !== id)
        Storage.set("quizQuestions", filteredQuestions)
      },
  
      // Quiz Results
      getQuizResults() {
        return Storage.get("quizResults") || []
      },
  
      getResultsByUserId(userId) {
        const results = this.getQuizResults()
        return results.filter((result) => result.userId === userId)
      },
  
      createQuizResult(resultData) {
        const results = this.getQuizResults()
        const newResult = {
          id: this.getNextId("result"),
          ...resultData,
          takenAt: new Date().toISOString(),
        }
        results.push(newResult)
        Storage.set("quizResults", results)
        return newResult
      },
  
      deleteResultsByUserId(userId) {
        const results = this.getQuizResults()
        const filteredResults = results.filter((result) => result.userId !== userId)
        Storage.set("quizResults", filteredResults)
      },
    }
  
    // Auth Module
    const Auth = {
      async login(username, password) {
        try {
          const user = Data.getUserByUsername(username)
          if (!user) {
            throw new Error("Invalid username or password")
          }
  
          const hashedPassword = await Crypto.hash(password)
          if (user.passwordHash !== hashedPassword) {
            throw new Error("Invalid username or password")
          }
  
          currentUser = user
          Session.set(user)
          return user
        } catch (error) {
          throw error
        }
      },
  
      async signup(username, password) {
        try {
          // Validate username
          if (!username || username.length < 3) {
            throw new Error("Username must be at least 3 characters")
          }
  
          // Check if username exists
          if (Data.getUserByUsername(username)) {
            throw new Error("Username already exists")
          }
  
          // Validate password
          if (!password || password.length < 6) {
            throw new Error("Password must be at least 6 characters")
          }
  
          const hashedPassword = await Crypto.hash(password)
          const user = Data.createUser({
            username,
            passwordHash: hashedPassword,
          })
  
          currentUser = user
          Session.set(user)
          return user
        } catch (error) {
          throw error
        }
      },
  
      logout() {
        currentUser = null
        Session.clear()
      },
  
      getCurrentUser() {
        if (!currentUser) {
          currentUser = Session.get()
        }
        return currentUser
      },
  
      async changePassword(oldPassword, newPassword) {
        try {
          if (!currentUser) {
            throw new Error("Not authenticated")
          }
  
          const oldHash = await Crypto.hash(oldPassword)
          if (currentUser.passwordHash !== oldHash) {
            throw new Error("Current password is incorrect")
          }
  
          if (newPassword.length < 6) {
            throw new Error("New password must be at least 6 characters")
          }
  
          const newHash = await Crypto.hash(newPassword)
          const updatedUser = Data.updateUser(currentUser.id, {
            passwordHash: newHash,
          })
  
          currentUser = updatedUser
          Session.set(updatedUser)
          return updatedUser
        } catch (error) {
          throw error
        }
      },
    }
  
    // UI Module
    const UI = {
      showView(viewId) {
        // Hide all views
        document.querySelectorAll(".view").forEach((view) => {
          view.style.display = "none"
        })
  
        // Show target view
        const targetView = document.getElementById(viewId)
        if (targetView) {
          targetView.style.display = "block"
        }
  
        // Update navigation
        this.updateNavigation(viewId)
      },
  
      updateNavigation(activeRoute) {
        const navButtons = document.querySelectorAll(".nav-btn")
        navButtons.forEach((btn) => {
          btn.classList.remove("active")
          if (btn.dataset.route === activeRoute) {
            btn.classList.add("active")
          }
        })
      },
  
      showToast(message, type = "info") {
        const toast = document.getElementById("toast")
        toast.textContent = message
        toast.className = `toast ${type}`
        toast.classList.add("show")
  
        setTimeout(() => {
          toast.classList.remove("show")
        }, 3000)
      },
  
      showModal(title, content) {
        const modal = document.getElementById("modal")
        const modalTitle = document.getElementById("modal-title")
        const modalBody = document.getElementById("modal-body")
  
        modalTitle.textContent = title
        modalBody.innerHTML = content
        modal.classList.add("show")
      },
  
      hideModal() {
        const modal = document.getElementById("modal")
        modal.classList.remove("show")
      },
  
      escapeHtml(text) {
        const div = document.createElement("div")
        div.textContent = text
        return div.innerHTML
      },
  
      formatDate(dateString) {
        const date = new Date(dateString)
        return (
          date.toLocaleDateString() +
          " " +
          date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        )
      },
    }
  
    // Router Module
    const Router = {
      init() {
        window.addEventListener("hashchange", this.handleRoute.bind(this))
        this.handleRoute()
      },
  
      handleRoute() {
        const hash = window.location.hash.slice(1) || "/"
        const route = hash.split("/")[1] || "auth"
  
        // Check authentication
        const user = Auth.getCurrentUser()
        if (!user && route !== "auth") {
          this.navigate("auth")
          return
        }
  
        if (user && route === "auth") {
          this.navigate("dashboard")
          return
        }
  
        currentRoute = route
        this.renderRoute(route)
      },
  
      navigate(route) {
        window.location.hash = `#/${route}`
      },
  
      renderRoute(route) {
        const user = Auth.getCurrentUser()
  
        // Show/hide UI elements based on auth state
        const logoutBtn = document.getElementById("logout-btn")
        const bottomNav = document.getElementById("bottom-nav")
  
        if (user) {
          logoutBtn.style.display = "block"
          bottomNav.style.display = "flex"
        } else {
          logoutBtn.style.display = "none"
          bottomNav.style.display = "none"
        }
  
        switch (route) {
          case "auth":
            UI.showView("auth-view")
            break
          case "dashboard":
            UI.showView("dashboard-view")
            Dashboard.render()
            break
          case "notes":
            UI.showView("notes-view")
            Notes.render()
            break
          case "quiz":
            UI.showView("quiz-view")
            Quiz.render()
            break
          case "profile":
            UI.showView("profile-view")
            Profile.render()
            break
          default:
            this.navigate("dashboard")
        }
      },
    }
  
    // Dashboard Module
    const Dashboard = {
      render() {
        const user = Auth.getCurrentUser()
        if (!user) return
  
        // Update welcome text
        const welcomeText = document.getElementById("welcome-text")
        welcomeText.textContent = `Welcome back, ${user.username}!`
  
        // Update stats
        const userNotes = Data.getNotesByUserId(user.id)
        const notesCount = document.getElementById("notes-count")
        notesCount.textContent = userNotes.length
  
        // Get last quiz score
        const userResults = Data.getResultsByUserId(user.id)
        const lastScore = document.getElementById("last-score")
        if (userResults.length > 0) {
          const lastResult = userResults[userResults.length - 1]
          lastScore.textContent = `${lastResult.score}/${lastResult.total}`
        } else {
          lastScore.textContent = "-"
        }
      },
    }
  
    // Notes Module
    const Notes = {
      currentNotes: [],
      searchTerm: "",
  
      render() {
        const user = Auth.getCurrentUser()
        if (!user) return
  
        this.currentNotes = Data.getNotesByUserId(user.id)
        this.renderNotesList()
      },
  
      renderNotesList() {
        const notesList = document.getElementById("notes-list")
        let filteredNotes = this.currentNotes
  
        // Apply search filter
        if (this.searchTerm) {
          filteredNotes = this.currentNotes.filter(
            (note) =>
              note.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              note.content.toLowerCase().includes(this.searchTerm.toLowerCase()),
          )
        }
  
        if (filteredNotes.length === 0) {
          notesList.innerHTML = `
                      <div class="empty-state">
                          <p>${this.searchTerm ? "No notes match your search." : "No notes yet. Create your first note!"}</p>
                      </div>
                  `
          return
        }
  
        notesList.innerHTML = filteredNotes
          .map(
            (note) => `
                  <div class="note-card">
                      <div class="note-header">
                          <h3 class="note-title">${UI.escapeHtml(note.title)}</h3>
                          <div class="note-actions">
                              <button class="note-btn" onclick="Notes.editNote(${note.id})" aria-label="Edit note">Edit</button>
                              <button class="note-btn" onclick="Notes.deleteNote(${note.id})" aria-label="Delete note">Delete</button>
                          </div>
                      </div>
                      <div class="note-content">${UI.escapeHtml(note.content.substring(0, 200))}${note.content.length > 200 ? "..." : ""}</div>
                      <div class="note-meta">Updated: ${UI.formatDate(note.updatedAt)}</div>
                  </div>
              `,
          )
          .join("")
      },
  
      showNoteModal(note = null) {
        const isEdit = !!note
        const title = isEdit ? "Edit Note" : "Add Note"
  
        const content = `
                  <form id="note-form">
                      <div class="form-group">
                          <label for="note-title">Title</label>
                          <input type="text" id="note-title" value="${isEdit ? UI.escapeHtml(note.title) : ""}" required>
                      </div>
                      <div class="form-group">
                          <label for="note-content">Content</label>
                          <textarea id="note-content" rows="10" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: var(--border-radius); font-family: inherit; resize: vertical;">${isEdit ? UI.escapeHtml(note.content) : ""}</textarea>
                      </div>
                      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                          <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                          <button type="submit" class="btn btn-primary">${isEdit ? "Update" : "Create"}</button>
                      </div>
                  </form>
              `
  
        UI.showModal(title, content)
  
        // Handle form submission
        document.getElementById("note-form").addEventListener("submit", (e) => {
          e.preventDefault()
          const titleInput = document.getElementById("note-title")
          const contentInput = document.getElementById("note-content")
  
          if (!titleInput.value.trim()) {
            UI.showToast("Title is required", "error")
            return
          }
  
          const noteData = {
            title: titleInput.value.trim(),
            content: contentInput.value.trim(),
            userId: Auth.getCurrentUser().id,
          }
  
          try {
            if (isEdit) {
              Data.updateNote(note.id, noteData)
              UI.showToast("Note updated successfully", "success")
            } else {
              Data.createNote(noteData)
              UI.showToast("Note created successfully", "success")
            }
  
            UI.hideModal()
            this.render()
          } catch (error) {
            UI.showToast("Failed to save note", "error")
          }
        })
      },
  
      editNote(id) {
        const note = this.currentNotes.find((n) => n.id === id)
        if (note) {
          this.showNoteModal(note)
        }
      },
  
      deleteNote(id) {
        if (confirm("Are you sure you want to delete this note?")) {
          Data.deleteNote(id)
          UI.showToast("Note deleted successfully", "success")
          this.render()
        }
      },
  
      handleSearch(term) {
        this.searchTerm = term
        this.renderNotesList()
      },
    }
  
    // Quiz Module
    const Quiz = {
      currentTab: "take",
      questions: [],
      currentQuiz: null,
      currentQuestionIndex: 0,
      answers: [],
  
      render() {
        this.questions = Data.getQuizQuestions()
        this.renderTab()
      },
  
      switchTab(tab) {
        this.currentTab = tab
  
        // Update tab buttons
        document.querySelectorAll("#quiz-view .tab-btn").forEach((btn) => {
          btn.classList.remove("active")
          if (btn.dataset.tab === tab) {
            btn.classList.add("active")
          }
        })
  
        this.renderTab()
      },
  
      renderTab() {
        const takeContent = document.getElementById("take-quiz-content")
        const adminContent = document.getElementById("admin-quiz-content")
  
        if (this.currentTab === "take") {
          takeContent.style.display = "block"
          adminContent.style.display = "none"
          this.renderTakeQuiz()
        } else {
          takeContent.style.display = "none"
          adminContent.style.display = "block"
          this.renderAdminQuiz()
        }
      },
  
      renderTakeQuiz() {
        const quizStart = document.getElementById("quiz-start")
        const quizActive = document.getElementById("quiz-active")
        const quizResults = document.getElementById("quiz-results")
  
        if (!this.currentQuiz) {
          quizStart.style.display = "block"
          quizActive.style.display = "none"
          quizResults.style.display = "none"
        } else if (this.currentQuiz.completed) {
          quizStart.style.display = "none"
          quizActive.style.display = "none"
          quizResults.style.display = "block"
          this.renderResults()
        } else {
          quizStart.style.display = "none"
          quizActive.style.display = "block"
          quizResults.style.display = "none"
          this.renderQuestion()
        }
      },
  
      startQuiz() {
        if (this.questions.length === 0) {
          UI.showToast("No questions available", "error")
          return
        }
  
        // Shuffle questions
        const shuffledQuestions = [...this.questions].sort(() => Math.random() - 0.5)
  
        this.currentQuiz = {
          questions: shuffledQuestions.slice(0, 10), // Take first 10
          completed: false,
        }
        this.currentQuestionIndex = 0
        this.answers = new Array(this.currentQuiz.questions.length).fill(null)
  
        // Add beforeunload listener
        window.addEventListener("beforeunload", this.handleBeforeUnload)
  
        this.renderTakeQuiz()
      },
  
      handleBeforeUnload(e) {
        if (Quiz.currentQuiz && !Quiz.currentQuiz.completed) {
          e.preventDefault()
          e.returnValue = "You have an active quiz. Are you sure you want to leave?"
          return e.returnValue
        }
      },
  
      renderQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex]
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100
  
        // Update progress
        document.getElementById("progress-fill").style.width = `${progress}%`
        document.getElementById("question-counter").textContent =
          `${this.currentQuestionIndex + 1} / ${this.currentQuiz.questions.length}`
  
        // Update question
        document.getElementById("question-text").textContent = question.question
  
        // Update options
        const optionsContainer = document.getElementById("options-container")
        optionsContainer.innerHTML = question.options
          .map(
            (option, index) => `
                  <button class="option ${this.answers[this.currentQuestionIndex] === index ? "selected" : ""}" 
                          onclick="Quiz.selectOption(${index})">
                      ${UI.escapeHtml(option)}
                  </button>
              `,
          )
          .join("")
  
        // Update navigation
        const prevBtn = document.getElementById("prev-btn")
        const nextBtn = document.getElementById("next-btn")
        const submitBtn = document.getElementById("submit-quiz-btn")
  
        prevBtn.disabled = this.currentQuestionIndex === 0
  
        const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1
        const hasAnswer = this.answers[this.currentQuestionIndex] !== null
  
        if (isLastQuestion) {
          nextBtn.style.display = "none"
          submitBtn.style.display = hasAnswer ? "block" : "none"
        } else {
          nextBtn.style.display = "block"
          nextBtn.disabled = !hasAnswer
          submitBtn.style.display = "none"
        }
      },
  
      selectOption(optionIndex) {
        this.answers[this.currentQuestionIndex] = optionIndex
        this.renderQuestion()
      },
  
      previousQuestion() {
        if (this.currentQuestionIndex > 0) {
          this.currentQuestionIndex--
          this.renderQuestion()
        }
      },
  
      nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
          this.currentQuestionIndex++
          this.renderQuestion()
        }
      },
  
      submitQuiz() {
        // Calculate score
        let score = 0
        this.currentQuiz.questions.forEach((question, index) => {
          if (this.answers[index] === question.correct) {
            score++
          }
        })
  
        // Save result
        const user = Auth.getCurrentUser()
        Data.createQuizResult({
          userId: user.id,
          score: score,
          total: this.currentQuiz.questions.length,
          answers: this.answers.map((answer, index) => ({
            questionId: this.currentQuiz.questions[index].id,
            selectedOption: answer,
            correct: answer === this.currentQuiz.questions[index].correct,
          })),
        })
  
        this.currentQuiz.completed = true
        this.currentQuiz.score = score
  
        // Remove beforeunload listener
        window.removeEventListener("beforeunload", this.handleBeforeUnload)
  
        this.renderTakeQuiz()
      },
  
      renderResults() {
        document.getElementById("final-score").textContent = this.currentQuiz.score
        document.getElementById("total-questions").textContent = this.currentQuiz.questions.length
  
        const reviewContainer = document.getElementById("results-review")
        reviewContainer.innerHTML = this.currentQuiz.questions
          .map((question, index) => {
            const userAnswer = this.answers[index]
            const isCorrect = userAnswer === question.correct
  
            return `
                      <div class="review-item">
                          <div class="review-question">${UI.escapeHtml(question.question)}</div>
                          <div class="review-answer ${isCorrect ? "correct" : "incorrect"}">
                              Your answer: ${userAnswer !== null ? UI.escapeHtml(question.options[userAnswer]) : "No answer"}
                          </div>
                          ${
                            !isCorrect
                              ? `
                              <div class="review-answer correct">
                                  Correct answer: ${UI.escapeHtml(question.options[question.correct])}
                              </div>
                          `
                              : ""
                          }
                          <div class="review-explanation">${UI.escapeHtml(question.explanation)}</div>
                      </div>
                  `
          })
          .join("")
      },
  
      retakeQuiz() {
        this.currentQuiz = null
        this.renderTakeQuiz()
      },
  
      renderAdminQuiz() {
        const questionsList = document.getElementById("questions-list")
  
        if (this.questions.length === 0) {
          questionsList.innerHTML = `
                      <div class="empty-state">
                          <p>No questions yet. Add your first question!</p>
                      </div>
                  `
          return
        }
  
        questionsList.innerHTML = this.questions
          .map(
            (question) => `
                  <div class="question-card">
                      <div class="question-card-header">
                          <div class="question-card-title">${UI.escapeHtml(question.question)}</div>
                          <div class="question-card-actions">
                              <button class="note-btn" onclick="Quiz.editQuestion(${question.id})">Edit</button>
                              <button class="note-btn" onclick="Quiz.deleteQuestion(${question.id})">Delete</button>
                          </div>
                      </div>
                      <div class="question-options">
                          ${question.options
                            .map(
                              (option, index) => `
                              <div class="question-option ${index === question.correct ? "correct" : "incorrect"}">
                                  ${UI.escapeHtml(option)}
                              </div>
                          `,
                            )
                            .join("")}
                      </div>
                  </div>
              `,
          )
          .join("")
      },
  
      showQuestionModal(question = null) {
        const isEdit = !!question
        const title = isEdit ? "Edit Question" : "Add Question"
  
        const content = `
                  <form id="question-form">
                      <div class="form-group">
                          <label for="question-text">Question</label>
                          <textarea id="question-text" rows="3" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: var(--border-radius); font-family: inherit; resize: vertical;" required>${isEdit ? UI.escapeHtml(question.question) : ""}</textarea>
                      </div>
                      <div class="form-group">
                          <label>Options</label>
                          ${[0, 1, 2, 3]
                            .map(
                              (i) => `
                              <div style="margin-bottom: 0.5rem;">
                                  <input type="text" id="option-${i}" placeholder="Option ${i + 1}" 
                                         value="${isEdit ? UI.escapeHtml(question.options[i] || "") : ""}" 
                                         style="width: calc(100% - 30px); padding: 0.5rem; border: 2px solid var(--border-color); border-radius: var(--border-radius);" required>
                                  <input type="radio" name="correct" value="${i}" 
                                         ${isEdit && question.correct === i ? "checked" : ""} 
                                         style="margin-left: 0.5rem;" required>
                              </div>
                          `,
                            )
                            .join("")}
                          <small>Select the correct option</small>
                      </div>
                      <div class="form-group">
                          <label for="question-explanation">Explanation</label>
                          <textarea id="question-explanation" rows="2" 
                                    style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: var(--border-radius); font-family: inherit; resize: vertical;" 
                                    required>${isEdit ? UI.escapeHtml(question.explanation) : ""}</textarea>
                      </div>
                      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                          <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                          <button type="submit" class="btn btn-primary">${isEdit ? "Update" : "Create"}</button>
                      </div>
                  </form>
              `
  
        UI.showModal(title, content)
  
        // Handle form submission
        document.getElementById("question-form").addEventListener("submit", (e) => {
          e.preventDefault()
  
          const questionText = document.getElementById("question-text").value.trim()
          const options = [0, 1, 2, 3].map((i) => document.getElementById(`option-${i}`).value.trim())
          const correct = Number.parseInt(document.querySelector('input[name="correct"]:checked').value)
          const explanation = document.getElementById("question-explanation").value.trim()
  
          // Validation
          if (!questionText) {
            UI.showToast("Question is required", "error")
            return
          }
  
          if (options.some((opt) => !opt)) {
            UI.showToast("All options are required", "error")
            return
          }
  
          if (!explanation) {
            UI.showToast("Explanation is required", "error")
            return
          }
  
          const questionData = {
            question: questionText,
            options: options,
            correct: correct,
            explanation: explanation,
          }
  
          try {
            if (isEdit) {
              Data.updateQuizQuestion(question.id, questionData)
              UI.showToast("Question updated successfully", "success")
            } else {
              Data.createQuizQuestion(questionData)
              UI.showToast("Question created successfully", "success")
            }
  
            UI.hideModal()
            this.render()
          } catch (error) {
            UI.showToast("Failed to save question", "error")
          }
        })
      },
  
      editQuestion(id) {
        const question = this.questions.find((q) => q.id === id)
        if (question) {
          this.showQuestionModal(question)
        }
      },
  
      deleteQuestion(id) {
        if (confirm("Are you sure you want to delete this question?")) {
          Data.deleteQuizQuestion(id)
          UI.showToast("Question deleted successfully", "success")
          this.render()
        }
      },
    }
  
    // Profile Module
    const Profile = {
      render() {
        const user = Auth.getCurrentUser()
        if (!user) return
  
        document.getElementById("profile-username").textContent = user.username
        document.getElementById("profile-joined").textContent = UI.formatDate(user.createdAt)
      },
  
      showChangePasswordModal() {
        const content = `
                  <form id="change-password-form">
                      <div class="form-group">
                          <label for="current-password">Current Password</label>
                          <input type="password" id="current-password" required>
                      </div>
                      <div class="form-group">
                          <label for="new-password">New Password</label>
                          <input type="password" id="new-password" minlength="6" required>
                          <small>Minimum 6 characters</small>
                      </div>
                      <div class="form-group">
                          <label for="confirm-password">Confirm New Password</label>
                          <input type="password" id="confirm-password" required>
                      </div>
                      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                          <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                          <button type="submit" class="btn btn-primary">Change Password</button>
                      </div>
                  </form>
              `
  
        UI.showModal("Change Password", content)
  
        document.getElementById("change-password-form").addEventListener("submit", async (e) => {
          e.preventDefault()
  
          const currentPassword = document.getElementById("current-password").value
          const newPassword = document.getElementById("new-password").value
          const confirmPassword = document.getElementById("confirm-password").value
  
          if (newPassword !== confirmPassword) {
            UI.showToast("New passwords do not match", "error")
            return
          }
  
          try {
            await Auth.changePassword(currentPassword, newPassword)
            UI.showToast("Password changed successfully", "success")
            UI.hideModal()
          } catch (error) {
            UI.showToast(error.message, "error")
          }
        })
      },
  
      deleteAccount() {
        const content = `
                  <div style="text-align: center;">
                      <h4 style="color: var(--danger-color); margin-bottom: 1rem;">Delete Account</h4>
                      <p style="margin-bottom: 1.5rem;">This action cannot be undone. All your notes and quiz results will be permanently deleted.</p>
                      <div style="display: flex; gap: 1rem; justify-content: center;">
                          <button class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                          <button class="btn btn-danger" onclick="Profile.confirmDeleteAccount()">Delete Account</button>
                      </div>
                  </div>
              `
  
        UI.showModal("Confirm Account Deletion", content)
      },
  
      confirmDeleteAccount() {
        const user = Auth.getCurrentUser()
        if (user) {
          Data.deleteUser(user.id)
          Auth.logout()
          UI.hideModal()
          UI.showToast("Account deleted successfully", "success")
          Router.navigate("auth")
        }
      },
    }
  
    // Event Listeners
    function initEventListeners() {
      // Auth tabs
      document.getElementById("login-tab").addEventListener("click", () => {
        document.getElementById("login-form").style.display = "block"
        document.getElementById("signup-form").style.display = "none"
        document.getElementById("login-tab").classList.add("active")
        document.getElementById("signup-tab").classList.remove("active")
      })
  
      document.getElementById("signup-tab").addEventListener("click", () => {
        document.getElementById("login-form").style.display = "none"
        document.getElementById("signup-form").style.display = "block"
        document.getElementById("login-tab").classList.remove("active")
        document.getElementById("signup-tab").classList.add("active")
      })
  
      // Auth forms
      document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault()
        const username = document.getElementById("login-username").value
        const password = document.getElementById("login-password").value
  
        try {
          await Auth.login(username, password)
          UI.showToast("Login successful", "success")
          Router.navigate("dashboard")
        } catch (error) {
          UI.showToast(error.message, "error")
        }
      })
  
      document.getElementById("signup-form").addEventListener("submit", async (e) => {
        e.preventDefault()
        const username = document.getElementById("signup-username").value
        const password = document.getElementById("signup-password").value
        const confirm = document.getElementById("signup-confirm").value
  
        if (password !== confirm) {
          UI.showToast("Passwords do not match", "error")
          return
        }
  
        try {
          await Auth.signup(username, password)
          UI.showToast("Account created successfully", "success")
          Router.navigate("dashboard")
        } catch (error) {
          UI.showToast(error.message, "error")
        }
      })
  
      // Logout
      document.getElementById("logout-btn").addEventListener("click", () => {
        Auth.logout()
        UI.showToast("Logged out successfully", "success")
        Router.navigate("auth")
      })
  
      // Navigation
      document.querySelectorAll(".nav-btn, .action-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const route = btn.dataset.route
          if (route) {
            Router.navigate(route)
          }
        })
      })
  
      // Notes
      document.getElementById("add-note-btn").addEventListener("click", () => {
        Notes.showNoteModal()
      })
  
      document.getElementById("notes-search").addEventListener("input", (e) => {
        Notes.handleSearch(e.target.value)
      })
  
      // Quiz tabs
      document.getElementById("take-quiz-tab").addEventListener("click", () => {
        Quiz.switchTab("take")
      })
  
      document.getElementById("admin-quiz-tab").addEventListener("click", () => {
        Quiz.switchTab("admin")
      })
  
      // Quiz actions
      document.getElementById("start-quiz-btn").addEventListener("click", () => {
        Quiz.startQuiz()
      })
  
      document.getElementById("prev-btn").addEventListener("click", () => {
        Quiz.previousQuestion()
      })
  
      document.getElementById("next-btn").addEventListener("click", () => {
        Quiz.nextQuestion()
      })
  
      document.getElementById("submit-quiz-btn").addEventListener("click", () => {
        Quiz.submitQuiz()
      })
  
      document.getElementById("retake-quiz-btn").addEventListener("click", () => {
        Quiz.retakeQuiz()
      })
  
      document.getElementById("add-question-btn").addEventListener("click", () => {
        Quiz.showQuestionModal()
      })
  
      // Profile
      document.getElementById("change-password-btn").addEventListener("click", () => {
        Profile.showChangePasswordModal()
      })
  
      document.getElementById("delete-account-btn").addEventListener("click", () => {
        Profile.deleteAccount()
      })
  
      // Modal
      document.getElementById("modal-close").addEventListener("click", () => {
        UI.hideModal()
      })
  
      document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") {
          UI.hideModal()
        }
      })
    }
  
    // Service Worker Registration
    function registerServiceWorker() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("./sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration)
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
          })
      }
    }
  
    // Initialize App
    function init() {
      Data.init()
      initEventListeners()
      Router.init()
      registerServiceWorker()
  
      console.log("Study Guide PWA initialized")
    }
  
    // Make functions globally available
    window.Notes = Notes
    window.Quiz = Quiz
    window.Profile = Profile
  
    // Start the app
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init)
    } else {
      init()
    }
  })()
  