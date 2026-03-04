const signupScreen = document.getElementById("signup-screen");
const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const signupForm = document.getElementById("signup-form");
const playBtn = document.getElementById("play-btn");
const answerForm = document.getElementById("answer-form");
const playAgainBtn = document.getElementById("play-again-btn");

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

const TOTAL_SET_TIME = 30;

const questionSets = [
  [
    { prompt: "A train travels 120 km in 2 hours. What is its average speed in km/h?", answers: ["60", "60 km/h", "60km/h"] },
    { prompt: "Which organ in the human body is primarily responsible for filtering blood?", answers: ["kidney", "kidneys"] },
    { prompt: "What is the square root of 225?", answers: ["15", "fifteen"] }
  ],
  [
    { prompt: "In which year did World War II end?", answers: ["1945"] },
    { prompt: "What is the chemical symbol for sodium?", answers: ["na"] },
    { prompt: "If 3x + 5 = 20, what is x?", answers: ["5", "five"] }
  ],
  [
    { prompt: "Which layer of Earth lies between the crust and the core?", answers: ["mantle", "the mantle"] },
    { prompt: "Who wrote the play 'Julius Caesar'?", answers: ["william shakespeare", "shakespeare"] },
    { prompt: "What is 18% of 250?", answers: ["45", "forty five", "forty-five"] }
  ],
  [
    { prompt: "Which country is known as the Land of the Rising Sun?", answers: ["japan"] },
    { prompt: "What is the value of pi rounded to two decimal places?", answers: ["3.14"] },
    { prompt: "Which gas is most abundant in Earth's atmosphere?", answers: ["nitrogen"] }
  ],
  [
    { prompt: "Who developed the theory of relativity?", answers: ["albert einstein", "einstein"] },
    { prompt: "What is the largest prime number less than 20?", answers: ["19", "nineteen"] },
    { prompt: "What does CPU stand for in computers?", answers: ["central processing unit"] }
  ]
];

let currentQuestionIndex = 0;
let currentSetIndex = null;
let remainingTime = TOTAL_SET_TIME;
let timerInterval = null;
let answers = [];
let currentPlayer = "Player";

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

function getUsedSetIndexes() {
  const raw = localStorage.getItem("used-set-indexes");
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

function saveUsedSetIndexes(indexes) {
  localStorage.setItem("used-set-indexes", JSON.stringify(indexes));
}

function getAvailableSetIndexes() {
  const used = getUsedSetIndexes();
  return questionSets
    .map((_, index) => index)
    .filter((index) => !used.includes(index));
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

function updateLeaderboard(name, score, timeTaken) {
  const board = getLeaderboard();
  board.push({ name, score, timeTaken });

  board.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.timeTaken - b.timeTaken;
  });

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
    item.textContent = `${entry.name} — Score ${entry.score}/3, Time ${entry.timeTaken}s`;
    leaderboardList.appendChild(item);
  });
}

function updateHomeSummary() {
  const available = getAvailableSetIndexes().length;
  bestScore.textContent = `Your best score: ${getPlayerBest(currentPlayer)}/3 | Remaining sets: ${available}`;

  if (available === 0) {
    playBtn.disabled = true;
    playBtn.textContent = "No sets left";
  } else {
    playBtn.disabled = false;
    playBtn.textContent = "Play game";
  }
}

function getCurrentSet() {
  return questionSets[currentSetIndex];
}

function pickNewSetForUser() {
  const available = getAvailableSetIndexes();
  if (available.length === 0) {
    return null;
  }

  return available[0];
}

function startGame() {
  const chosenSet = pickNewSetForUser();
  if (chosenSet === null) {
    alert("All question sets are already completed by users. No new set is available.");
    updateHomeSummary();
    return;
  }

  currentSetIndex = chosenSet;
  currentQuestionIndex = 0;
  remainingTime = TOTAL_SET_TIME;
  answers = [];

  setTitle.textContent = `Moderate Set ${currentSetIndex + 1}`;
  timeLeft.textContent = remainingTime;

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    remainingTime -= 1;
    timeLeft.textContent = remainingTime;

    if (remainingTime <= 0) {
      endGame(true);
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

function calculateScore() {
  return getCurrentSet().reduce((score, question, index) => {
    return score + (isCorrect(question, answers[index] || "") ? 1 : 0);
  }, 0);
}

function markCurrentSetAsUsed() {
  const used = getUsedSetIndexes();
  if (!used.includes(currentSetIndex)) {
    used.push(currentSetIndex);
    saveUsedSetIndexes(used);
  }
}

function endGame(timeUp = false) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const setQuestions = getCurrentSet();
  const score = calculateScore();
  const timeTaken = TOTAL_SET_TIME - remainingTime;

  markCurrentSetAsUsed();
  updateLeaderboard(currentPlayer, score, timeTaken);
  renderLeaderboard();

  const best = getPlayerBest(currentPlayer);
  if (score > best) {
    setPlayerBest(currentPlayer, score);
  }

  resultTitle.textContent = timeUp ? "Set ended (Time up)" : "Set completed";
  resultMessage.textContent = "Please sign up again for another user to get a different set.";
  scoreSummary.textContent = `Score: ${score}/${setQuestions.length} | Time taken: ${timeTaken}s`;

  answersList.innerHTML = "";
  setQuestions.forEach((question, index) => {
    const userAnswer = answers[index] || "No answer";
    const item = document.createElement("li");
    item.textContent = isCorrect(question, userAnswer)
      ? `${question.prompt} — Your answer: ${userAnswer}. ✅ Correct`
      : `${question.prompt} — Your answer: ${userAnswer}. ❌ Correct answer: ${question.answers[0]}`;
    answersList.appendChild(item);
  });

  showScreen(resultScreen);
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
    endGame(false);
  } else {
    renderQuestion();
  }
});

playAgainBtn.addEventListener("click", () => {
  signupForm.reset();
  currentPlayer = "Player";
  showScreen(signupScreen);
});
