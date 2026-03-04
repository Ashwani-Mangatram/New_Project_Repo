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
const questionCounter = document.getElementById("question-counter");
const questionText = document.getElementById("question-text");
const answerInput = document.getElementById("answer-input");
const timeLeft = document.getElementById("time-left");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const scoreSummary = document.getElementById("score-summary");
const answersList = document.getElementById("answers-list");

const questions = [
  {
    prompt: "What is 5 + 7?",
    answers: ["12", "twelve"]
  },
  {
    prompt: "Name the capital city of France.",
    answers: ["paris"]
  },
  {
    prompt: "What color do you get when you mix red and white?",
    answers: ["pink"]
  }
];

let currentQuestionIndex = 0;
let remainingTime = 30;
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

function getBestScore(name) {
  const stored = localStorage.getItem(`best-score:${name}`);
  return stored ? Number(stored) : 0;
}

function setBestScore(name, score) {
  localStorage.setItem(`best-score:${name}`, String(score));
}

function updateHomeSummary() {
  const highest = getBestScore(currentPlayer);
  bestScore.textContent = `Your best score: ${highest}/${questions.length}`;
}

function startGame() {
  currentQuestionIndex = 0;
  remainingTime = 30;
  answers = [];
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
  questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  questionText.textContent = questions[currentQuestionIndex].prompt;
  answerInput.value = "";
  answerInput.focus();
}

function isCorrect(question, answer) {
  const cleaned = normalize(answer);
  return question.answers.includes(cleaned);
}

function calculateScore() {
  return questions.reduce((score, question, index) => {
    const answer = answers[index] || "";
    return score + (isCorrect(question, answer) ? 1 : 0);
  }, 0);
}

function endGame(timeUp = false) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const score = calculateScore();
  const previousBest = getBestScore(currentPlayer);
  if (score > previousBest) {
    setBestScore(currentPlayer, score);
  }

  if (timeUp) {
    resultTitle.textContent = "Time is up!";
    resultMessage.textContent = "The game ended automatically after 30 seconds.";
  } else {
    resultTitle.textContent = "Game Completed!";
    resultMessage.textContent = "You answered all 3 questions in time.";
  }

  scoreSummary.textContent = `Score: ${score}/${questions.length}`;

  answersList.innerHTML = "";
  questions.forEach((question, index) => {
    const listItem = document.createElement("li");
    const userAnswer = answers[index] ? answers[index] : "No answer";
    const correctLabel = isCorrect(question, userAnswer)
      ? "✅ Correct"
      : `❌ Correct answer: ${question.answers[0]}`;
    listItem.textContent = `${question.prompt} — Your answer: ${userAnswer}. ${correctLabel}`;
    answersList.appendChild(listItem);
  });

  updateHomeSummary();
  showScreen(resultScreen);
}

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const name = formData.get("name").toString().trim();

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

  if (currentQuestionIndex >= questions.length) {
    endGame(false);
  } else {
    renderQuestion();
  }
});

playAgainBtn.addEventListener("click", () => {
  showScreen(homeScreen);
});
