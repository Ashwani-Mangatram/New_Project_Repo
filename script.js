const signupScreen = document.getElementById("signup-screen");
const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const signupForm = document.getElementById("signup-form");
const playBtn = document.getElementById("play-btn");
const answerForm = document.getElementById("answer-form");
const playAgainBtn = document.getElementById("play-again-btn");

const playerName = document.getElementById("player-name");
const questionCounter = document.getElementById("question-counter");
const questionText = document.getElementById("question-text");
const answerInput = document.getElementById("answer-input");
const timeLeft = document.getElementById("time-left");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const answersList = document.getElementById("answers-list");

const questions = [
  "What is 5 + 7?",
  "Name the capital city of France.",
  "What color do you get when you mix red and white?"
];

let currentQuestionIndex = 0;
let remainingTime = 30;
let timerInterval = null;
let answers = [];

function showScreen(screenElement) {
  [signupScreen, homeScreen, gameScreen, resultScreen].forEach((screen) => {
    screen.classList.add("hidden");
  });
  screenElement.classList.remove("hidden");
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
  questionText.textContent = questions[currentQuestionIndex];
  answerInput.value = "";
  answerInput.focus();
}

function endGame(timeUp = false) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (timeUp) {
    resultTitle.textContent = "Time is up!";
    resultMessage.textContent = "The game ended automatically after 30 seconds.";
  } else {
    resultTitle.textContent = "Game Completed!";
    resultMessage.textContent = "You answered all 3 questions in time.";
  }

  answersList.innerHTML = "";
  questions.forEach((question, index) => {
    const listItem = document.createElement("li");
    const userAnswer = answers[index] ? answers[index] : "No answer";
    listItem.textContent = `${question} — ${userAnswer}`;
    answersList.appendChild(listItem);
  });

  showScreen(resultScreen);
}

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const name = formData.get("name").toString().trim();

  playerName.textContent = name || "Player";
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
