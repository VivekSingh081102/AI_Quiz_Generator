// ========================================
// AI Quiz - Main Application JavaScript
// ========================================

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://ai-quiz-backend-32aa.onrender.com';

// State Management
const state = {
    currentScreen: 'upload',
    selectedFile: null,
    quiz: [],
    userAnswers: {},
    currentQuestion: 0,
    timerInterval: null,
    startTime: null,
    elapsedTime: 0
};

// DOM Elements
const screens = {
    upload: document.getElementById('uploadScreen'),
    config: document.getElementById('configScreen'),
    quiz: document.getElementById('quizScreen'),
    results: document.getElementById('resultsScreen')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    addSVGGradient();
    wakeUpBackend();
});

// Function to wake up the Render backend (Cold Start)
async function wakeUpBackend() {
    try {
        console.log('Pinging backend to wake it up...');
        await fetch(`${API_BASE}/`);
        console.log('Backend is awake!');
    } catch (e) {
        console.log('Backend might be sleeping or unreachable', e);
    }
}

// Add SVG Gradient for score ring
function addSVGGradient() {
    const svg = document.querySelector('.score-ring');
    if (svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#6366f1"/>
                <stop offset="100%" style="stop-color:#a855f7"/>
            </linearGradient>
        `;
        svg.insertBefore(defs, svg.firstChild);
        document.getElementById('scoreRing').setAttribute('stroke', 'url(#scoreGradient)');
    }
}

// Event Listeners
function initializeEventListeners() {
    // Navigation
    document.getElementById('startBtn')?.addEventListener('click', scrollToUpload);
    document.getElementById('startBtnMobile')?.addEventListener('click', scrollToUpload);
    document.getElementById('mobileMenuBtn')?.addEventListener('click', toggleMobileMenu);

    // Nav links for Features and How it Works
    document.querySelectorAll('a[href="#features"]').forEach(link => {
        link.addEventListener('click', (e) => navigateToSection(e, 'features'));
    });
    document.querySelectorAll('a[href="#how-it-works"]').forEach(link => {
        link.addEventListener('click', (e) => navigateToSection(e, 'how-it-works'));
    });

    // Upload
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    uploadZone?.addEventListener('click', () => fileInput.click());
    uploadZone?.addEventListener('dragover', handleDragOver);
    uploadZone?.addEventListener('dragleave', handleDragLeave);
    uploadZone?.addEventListener('drop', handleDrop);
    fileInput?.addEventListener('change', handleFileSelect);
    document.getElementById('removeFile')?.addEventListener('click', removeFile);
    document.getElementById('uploadBtn')?.addEventListener('click', uploadFile);

    // Config
    document.getElementById('backToUpload')?.addEventListener('click', () => showScreen('upload'));
    document.getElementById('decreaseQuestions')?.addEventListener('click', () => adjustQuestionCount(-1));
    document.getElementById('increaseQuestions')?.addEventListener('click', () => adjustQuestionCount(1));
    document.getElementById('generateQuizBtn')?.addEventListener('click', generateQuiz);

    // Quiz
    document.getElementById('prevQuestionBtn')?.addEventListener('click', prevQuestion);
    document.getElementById('nextQuestionBtn')?.addEventListener('click', nextQuestion);
    document.getElementById('submitQuizBtn')?.addEventListener('click', submitQuiz);

    // Results
    document.getElementById('retakeQuizBtn')?.addEventListener('click', retakeQuiz);
    document.getElementById('newQuizBtn')?.addEventListener('click', newQuiz);

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (!mobileMenu?.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
            mobileMenu?.classList.remove('active');
        }
    });
}

// Navigation Functions
function scrollToUpload(e) {
    e?.preventDefault();
    document.getElementById('mobileMenu')?.classList.remove('active');
    // Reset upload UI and show upload screen
    resetUploadUI();
    showScreen('upload');
    // Then scroll to upload section
    setTimeout(() => {
        const uploadSection = document.querySelector('.upload-section');
        uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function navigateToSection(e, sectionId) {
    e?.preventDefault();
    document.getElementById('mobileMenu')?.classList.remove('active');
    // Reset upload UI and show upload screen
    resetUploadUI();
    showScreen('upload');
    // Then scroll to the target section
    setTimeout(() => {
        const section = document.getElementById(sectionId);
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function resetUploadUI() {
    // Reset upload button
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.querySelector('.btn-text').textContent = 'Upload & Process';
        uploadBtn.querySelector('.btn-loader').classList.add('hidden');
        uploadBtn.disabled = true;
    }

    // Reset upload progress
    const progressContainer = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    if (progressContainer) progressContainer.classList.add('hidden');
    if (progressFill) progressFill.style.width = '0%';

    // Show upload zone, hide file preview
    document.getElementById('uploadZone')?.classList.remove('hidden');
    document.getElementById('filePreview')?.classList.add('hidden');

    // Clear file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    // Reset state
    state.selectedFile = null;
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu')?.classList.toggle('active');
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen?.classList.remove('active');
    });
    screens[screenName]?.classList.add('active');
    state.currentScreen = screenName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// File Upload Functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
        showToast('Please upload a PDF, DOCX, or TXT file', 'error');
        return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showToast('File size must be less than 50MB', 'error');
        return;
    }

    state.selectedFile = file;

    // Update UI
    document.getElementById('uploadZone').classList.add('hidden');
    document.getElementById('filePreview').classList.remove('hidden');
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('uploadBtn').disabled = false;
}

function removeFile(e) {
    e?.stopPropagation();
    state.selectedFile = null;

    document.getElementById('uploadZone').classList.remove('hidden');
    document.getElementById('filePreview').classList.add('hidden');
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('fileInput').value = '';
}

async function uploadFile() {
    if (!state.selectedFile) return;

    const uploadBtn = document.getElementById('uploadBtn');
    const progressContainer = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Show loading state
    uploadBtn.disabled = true;
    uploadBtn.querySelector('.btn-text').textContent = 'Uploading...';
    uploadBtn.querySelector('.btn-loader').classList.remove('hidden');
    progressContainer.classList.remove('hidden');

    const formData = new FormData();
    formData.append('file', state.selectedFile);

    try {
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        }, 200);

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        clearInterval(progressInterval);

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        progressFill.style.width = '100%';
        progressText.textContent = 'Upload complete!';

        showToast('Document uploaded successfully!', 'success');

        setTimeout(() => {
            showScreen('config');
        }, 1000);

    } catch (error) {
        console.error('Upload error:', error);
        showToast('Failed to upload document. Please try again.', 'error');

        progressFill.style.width = '0%';
        progressContainer.classList.add('hidden');
        uploadBtn.querySelector('.btn-text').textContent = 'Upload & Process';
        uploadBtn.querySelector('.btn-loader').classList.add('hidden');
        uploadBtn.disabled = false;
    }
}

// Config Functions
function adjustQuestionCount(delta) {
    const input = document.getElementById('questionCount');
    let value = parseInt(input.value) + delta;
    value = Math.max(1, Math.min(20, value));
    input.value = value;
}

async function generateQuiz() {
    const questionCount = parseInt(document.getElementById('questionCount').value);
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

    const generateBtn = document.getElementById('generateQuizBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Show loading
    generateBtn.disabled = true;
    generateBtn.querySelector('.btn-text').textContent = 'Generating...';
    generateBtn.querySelector('.btn-loader').classList.remove('hidden');
    loadingOverlay.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE}/quiz?n=${questionCount}&difficulty=${difficulty}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate quiz');
        }

        const data = await response.json();
        console.log("Quiz response:", data);

        // Parse quiz data
        let quizData = data.quiz;
        if (typeof quizData === 'string') {
            // Remove markdown code blocks if present
            quizData = quizData.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            try {
                quizData = JSON.parse(quizData);
            } catch (e) {
                console.error("JSON parse error:", e, quizData);
                throw new Error('Invalid quiz format');
            }
        }

        console.log("Parsed quiz:", quizData);
        state.quiz = quizData;
        state.userAnswers = {};
        state.currentQuestion = 0;

        // Reset and start timer
        state.startTime = Date.now();
        state.elapsedTime = 0;
        startTimer();

        // Initialize quiz UI
        initializeQuizUI();

        loadingOverlay.classList.add('hidden');
        showScreen('quiz');
        showToast('Quiz generated successfully!', 'success');

    } catch (error) {
        console.error('Quiz generation error:', error);
        showToast('Failed to generate quiz. Please try again.', 'error');
        loadingOverlay.classList.add('hidden');
    } finally {
        generateBtn.disabled = false;
        generateBtn.querySelector('.btn-text').textContent = 'Generate Quiz';
        generateBtn.querySelector('.btn-loader').classList.add('hidden');
    }
}

// Quiz Functions
function initializeQuizUI() {
    document.getElementById('totalQuestions').textContent = state.quiz.length;
    document.getElementById('currentQuestion').textContent = '1';
    renderQuestion();
    updateQuizProgress();
    updateNavigationButtons();
}

function renderQuestion() {
    const question = state.quiz[state.currentQuestion];
    if (!question) return;

    document.getElementById('questionNum').textContent = state.currentQuestion + 1;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('currentQuestion').textContent = state.currentQuestion + 1;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const options = question.options;
    const letters = ['A', 'B', 'C', 'D'];

    letters.forEach(letter => {
        if (options[letter]) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.dataset.letter = letter;

            if (state.userAnswers[state.currentQuestion] === letter) {
                optionDiv.classList.add('selected');
            }

            optionDiv.innerHTML = `
                <span class="option-letter">${letter}</span>
                <span class="option-text">${options[letter]}</span>
            `;

            optionDiv.addEventListener('click', () => selectOption(letter));
            optionsContainer.appendChild(optionDiv);
        }
    });
}

function selectOption(letter) {
    state.userAnswers[state.currentQuestion] = letter;

    // Update UI
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.letter === letter) {
            opt.classList.add('selected');
        }
    });

    updateNavigationButtons();
}

function updateQuizProgress() {
    const progress = ((state.currentQuestion + 1) / state.quiz.length) * 100;
    document.getElementById('quizProgressFill').style.width = `${progress}%`;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');
    const submitBtn = document.getElementById('submitQuizBtn');

    prevBtn.disabled = state.currentQuestion === 0;

    const isLastQuestion = state.currentQuestion === state.quiz.length - 1;
    const allAnswered = Object.keys(state.userAnswers).length === state.quiz.length;

    if (isLastQuestion) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        submitBtn.disabled = !allAnswered;
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

function prevQuestion() {
    if (state.currentQuestion > 0) {
        state.currentQuestion--;
        renderQuestion();
        updateQuizProgress();
        updateNavigationButtons();
    }
}

function nextQuestion() {
    if (state.currentQuestion < state.quiz.length - 1) {
        state.currentQuestion++;
        renderQuestion();
        updateQuizProgress();
        updateNavigationButtons();
    }
}

// Timer Functions
function startTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }

    state.timerInterval = setInterval(() => {
        state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.elapsedTime / 60);
    const seconds = state.elapsedTime % 60;
    document.getElementById('timerDisplay').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Submit Quiz
async function submitQuiz() {
    stopTimer();

    const submitBtn = document.getElementById('submitQuizBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    document.getElementById('loadingTitle').textContent = 'Evaluating Answers...';
    document.getElementById('loadingSubtitle').textContent = 'Our AI is checking your responses';

    submitBtn.disabled = true;
    loadingOverlay.classList.remove('hidden');

    // Format answers for API
    const answers = {};
    Object.keys(state.userAnswers).forEach(key => {
        answers[key] = state.userAnswers[key];
    });

    try {
        const response = await fetch(`${API_BASE}/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quiz: state.quiz,
                answers: answers
            })
        });

        if (!response.ok) {
            throw new Error('Failed to evaluate quiz');
        }

        const data = await response.json();

        // Parse result
        let result = data.result;
        if (typeof result === 'string') {
            result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            result = JSON.parse(result);
        }

        loadingOverlay.classList.add('hidden');
        displayResults(result);

    } catch (error) {
        console.error('Evaluation error:', error);

        // Fallback: Calculate results locally
        const localResults = calculateLocalResults();
        loadingOverlay.classList.add('hidden');
        displayResults(localResults);
    }
}

function calculateLocalResults() {
    let correct = 0;
    const details = [];

    state.quiz.forEach((question, index) => {
        const userAnswerLetter = state.userAnswers[index] || 'N/A';
        const correctAnswerLetter = question.answer;
        const isCorrect = userAnswerLetter === correctAnswerLetter;
        if (isCorrect) correct++;

        const userAnswerText = question.options[userAnswerLetter] || 'Not answered';
        const correctAnswerText = question.options[correctAnswerLetter] || 'N/A';

        details.push({
            question: question.question,
            user_answer_letter: userAnswerLetter,
            user_answer_text: userAnswerText,
            correct_answer_letter: correctAnswerLetter,
            correct_answer_text: correctAnswerText,
            correct: isCorrect,
            explanation: isCorrect
                ? `Correct! ${correctAnswerText} is the right answer.`
                : `The correct answer is ${correctAnswerLetter}: ${correctAnswerText}`
        });
    });

    return {
        score: `${correct}/${state.quiz.length}`,
        details: details
    };
}

function displayResults(result) {
    // Parse score
    const [correct, total] = result.score.split('/').map(Number);
    const percentage = (correct / total) * 100;

    // Update score display
    document.getElementById('scoreValue').textContent = correct;
    document.getElementById('scoreTotalDisplay').textContent = total;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('incorrectCount').textContent = total - correct;
    document.getElementById('timeTaken').textContent = formatTime(state.elapsedTime);

    // Update score ring animation
    const scoreRing = document.getElementById('scoreRing');
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percentage / 100) * circumference;
    setTimeout(() => {
        scoreRing.style.strokeDashoffset = offset;
    }, 100);

    // Update title based on score
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsSubtitle = document.getElementById('resultsSubtitle');

    if (percentage >= 80) {
        resultsTitle.textContent = '🎉 Excellent!';
        resultsSubtitle.textContent = 'You have mastered this material!';
    } else if (percentage >= 60) {
        resultsTitle.textContent = '👍 Great Job!';
        resultsSubtitle.textContent = 'You have a good understanding!';
    } else if (percentage >= 40) {
        resultsTitle.textContent = '📚 Keep Learning!';
        resultsSubtitle.textContent = 'Review the material and try again.';
    } else {
        resultsTitle.textContent = '💪 Don\'t Give Up!';
        resultsSubtitle.textContent = 'More practice will help you improve.';
    }

    // Render answer details
    const answersList = document.getElementById('answersList');
    answersList.innerHTML = '';

    result.details.forEach((item, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';

        // Get data from new API format or fallback to old format
        const userAnswerLetter = item.user_answer_letter || item.user_answer || state.userAnswers[index] || 'N/A';
        const userAnswerText = item.user_answer_text || getOptionText(index, userAnswerLetter);
        const correctAnswerLetter = item.correct_answer_letter || item.correct_answer || state.quiz[index]?.answer || 'N/A';
        const correctAnswerText = item.correct_answer_text || getOptionText(index, correctAnswerLetter);

        answerItem.innerHTML = `
            <div class="answer-header">
                <span class="answer-question">${index + 1}. ${item.question}</span>
                <span class="answer-status ${item.correct ? 'correct' : 'incorrect'}">
                    ${item.correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
            </div>
            <div class="answer-content">
                <div class="answer-box ${item.correct ? 'correct' : 'incorrect'}">
                    <span class="answer-box-label">Your Answer</span>
                    <span class="answer-box-value"><strong>${userAnswerLetter}:</strong> ${userAnswerText}</span>
                </div>
                <div class="answer-box correct">
                    <span class="answer-box-label">Correct Answer</span>
                    <span class="answer-box-value"><strong>${correctAnswerLetter}:</strong> ${correctAnswerText}</span>
                </div>
            </div>
            ${item.explanation ? `<div class="answer-explanation">💡 ${item.explanation}</div>` : ''}
        `;

        answersList.appendChild(answerItem);
    });

    showScreen('results');
}

// Helper function to get option text from quiz data
function getOptionText(questionIndex, letter) {
    const question = state.quiz[questionIndex];
    if (question && question.options && question.options[letter]) {
        return question.options[letter];
    }
    return 'N/A';
}

// Results Actions
function retakeQuiz() {
    state.userAnswers = {};
    state.currentQuestion = 0;
    state.startTime = Date.now();
    state.elapsedTime = 0;
    startTimer();
    initializeQuizUI();
    showScreen('quiz');
}

function newQuiz() {
    // Reset state
    state.quiz = [];
    state.userAnswers = {};
    state.currentQuestion = 0;
    stopTimer();

    // Reset UI using helper function
    resetUploadUI();
    document.getElementById('questionCount').value = 5;
    document.querySelector('input[name="difficulty"][value="medium"]').checked = true;

    // Reset score ring
    document.getElementById('scoreRing').style.strokeDashoffset = 339.292;

    showScreen('upload');
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Export for global access if needed
window.showToast = showToast;
