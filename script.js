const signupScreen = document.getElementById("signup-screen");
const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const signupForm = document.getElementById("signup-form");
const playBtn = document.getElementById("play-btn");
const answerForm = document.getElementById("answer-form");
const playAgainBtn = document.getElementById("play-again-btn");
const nextSetBtn = document.getElementById("next-set-btn");

const playerName = document.getElementById("player-name");
const bestScore = document.getElementById("best-score");
const setTitle = document.getElementById("set-title");
const questionCounter = document.getElementById("question-counter");
const questionText = document.getElementById("question-text");
const answerInput = document.getElementById("answer-input");
const timeLeft = document.getElementById("time-left");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const scoreSummary = document.getElementById("score-summary");
const answersList = document.getElementById("answers-list");
const leaderboardList = document.getElementById("leaderboard-list");

const questionSets = [
  [
    { prompt: "What is 5 + 7?", answers: ["12", "twelve"] },
    { prompt: "Name the capital city of France.", answers: ["paris"] },
    { prompt: "What color do you get when you mix red and white?", answers: ["pink"] }
  ],
  [
    { prompt: "What is 9 - 4?", answers: ["5", "five"] },
    { prompt: "Which planet is called the Red Planet?", answers: ["mars"] },
    { prompt: "How many days are there in a week?", answers: ["7", "seven"] }
  ],
  [
    { prompt: "What is 6 x 3?", answers: ["18", "eighteen"] },
    { prompt: "What is the largest ocean on Earth?", answers: ["pacific", "pacific ocean"] },
    { prompt: "Which gas do plants absorb from air?", answers: ["carbon dioxide", "co2"] }
  ],
  [
    { prompt: "What is 15 / 3?", answers: ["5", "five"] },
    { prompt: "Which country has city Tokyo?", answers: ["japan"] },
    { prompt: "How many letters are there in English alphabet?", answers: ["26", "twenty six", "twenty-six"] }
  ],
  [
    { prompt: "What is 11 + 13?", answers: ["24", "twenty four", "twenty-four"] },
    { prompt: "Which is the fastest land animal?", answers: ["cheetah"] },
    { prompt: "Water freezes at what temperature in Celsius?", answers: ["0", "zero"] }
  ]
];

let activeSetIndex = 0;
let currentQuestionIndex = 0;
let remainingTime = 30;
let timerInterval = null;
let answers = [];
let currentPlayer = "Player";
let totalScore = 0;

function showScreen(screenElement) {
  [signupScreen, homeScreen, gameScreen, resultScreen].forEach((screen) => {
    screen.classList.add("hidden");
  });
  screenElement.classList.remove("hidden");
}

function normalize(text) {
  return text.trim().toLowerCase();
}

function getPlayerBest(name) {
  const score = localStorage.getItem(`best-score:${name}`);
  return score ? Number(score) : 0;
}

function setPlayerBest(name, score) {
  localStorage.setItem(`best-score:${name}`, String(score));
}

function updateHomeSummary() {
  bestScore.textContent = `Your best score: ${getPlayerBest(currentPlayer)}/${questionSets.length * 3}`;
}

function getLeaderboard() {
  const raw = localStorage.getItem("leaderboard");
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(board) {
  localStorage.setItem("leaderboard", JSON.stringify(board));
}

function updateLeaderboard(name, score) {
  const board = getLeaderboard();
  const existing = board.find((entry) => entry.name === name);

  if (existing) {
    existing.score = Math.max(existing.score, score);
  } else {
    board.push({ name, score });
  }

  board.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  saveLeaderboard(board.slice(0, 10));
}

function renderLeaderboard() {
  const board = getLeaderboard();
  leaderboardList.innerHTML = "";

  if (board.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No scores yet.";
    leaderboardList.appendChild(item);
    return;
  }

  board.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.name} — ${entry.score}/${questionSets.length * 3}`;
    leaderboardList.appendChild(item);
  });
}

function getCurrentSet() {
  return questionSets[activeSetIndex];
}

function startSet() {
  currentQuestionIndex = 0;
  remainingTime = 30;
  answers = [];

  setTitle.textContent = `Set ${activeSetIndex + 1} of ${questionSets.length}`;
  timeLeft.textContent = remainingTime;

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    remainingTime -= 1;
    timeLeft.textContent = remainingTime;

    if (remainingTime <= 0) {
      endSet(true);
    }
  }, 1000);

  renderQuestion();
  showScreen(gameScreen);
}

function renderQuestion() {
  const currentSet = getCurrentSet();
  questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${currentSet.length}`;
  questionText.textContent = currentSet[currentQuestionIndex].prompt;
  answerInput.value = "";
  answerInput.focus();
}

function isCorrect(question, answer) {
  return question.answers.includes(normalize(answer));
}

function calculateSetScore() {
  return getCurrentSet().reduce((score, question, index) => {
    return score + (isCorrect(question, answers[index] || "") ? 1 : 0);
  }, 0);
}

function endSet(timeUp = false) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const setQuestions = getCurrentSet();
  const setScore = calculateSetScore();
  totalScore += setScore;

  resultTitle.textContent = timeUp
    ? `Set ${activeSetIndex + 1} ended (Time up)`
    : `Set ${activeSetIndex + 1} completed`;

  resultMessage.textContent = timeUp
    ? "30 seconds completed. This set ended automatically."
    : "You submitted all answers for this set.";

  scoreSummary.textContent = `Set score: ${setScore}/${setQuestions.length} | Total score: ${totalScore}/${questionSets.length * 3}`;

  answersList.innerHTML = "";
  setQuestions.forEach((question, index) => {
    const userAnswer = answers[index] || "No answer";
    const item = document.createElement("li");
    item.textContent = isCorrect(question, userAnswer)
      ? `${question.prompt} — Your answer: ${userAnswer}. ✅ Correct`
      : `${question.prompt} — Your answer: ${userAnswer}. ❌ Correct answer: ${question.answers[0]}`;
    answersList.appendChild(item);
  });

  updateLeaderboard(currentPlayer, totalScore);
  renderLeaderboard();

  if (activeSetIndex < questionSets.length - 1) {
    nextSetBtn.classList.remove("hidden");
    playAgainBtn.classList.add("hidden");
  } else {
    nextSetBtn.classList.add("hidden");
    playAgainBtn.classList.remove("hidden");

    const best = getPlayerBest(currentPlayer);
    if (totalScore > best) {
      setPlayerBest(currentPlayer, totalScore);
    }
    updateHomeSummary();
  }

  showScreen(resultScreen);
}

function startGame() {
  totalScore = 0;
  activeSetIndex = 0;
  startSet();
}

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(signupForm);
  const name = data.get("name").toString().trim();

  currentPlayer = name || "Player";
  playerName.textContent = currentPlayer;
  updateHomeSummary();
  showScreen(homeScreen);
});

playBtn.addEventListener("click", () => {
  startGame();
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (remainingTime <= 0) {
    return;
  }

  answers[currentQuestionIndex] = answerInput.value.trim();
  currentQuestionIndex += 1;

  if (currentQuestionIndex >= getCurrentSet().length) {
    endSet(false);
  } else {
    renderQuestion();
  }
});

nextSetBtn.addEventListener("click", () => {
  activeSetIndex += 1;
  startSet();
});

playAgainBtn.addEventListener("click", () => {
  showScreen(homeScreen);
});
