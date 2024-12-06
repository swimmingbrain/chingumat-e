let currentActiveArrow = null;
const ARROW_KEYS = ["ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"];
const COLOR_PALETTE = ["red", "orange", "yellow", "green", "blue", "purple"];
let gameScore = 0;

// Define the character poses paths
const CHARACTER_POSES = [
  "../assets/character/cattobara/pose-a.png",
  "../assets/character/cattobara/pose-b.png",
  "../assets/character/cattobara/pose-c.png",
  "../assets/character/cattobara/pose-d.png",
  "../assets/character/cattobara/pose-e.png",
];

let activePose = CHARACTER_POSES[0];
const avatarImage = document.querySelector(".character");

const controlBoard = document.getElementById("control-board");
const spawner = document.getElementById("row-spawner");
const startButton = document.getElementById("start-button");
const scoreCounter = document.getElementById("score");

const boardTopBoundary = controlBoard.getBoundingClientRect().top;

// Play audio files for game events
const triggerAudio = (audioFile) => {
  const sound = new Audio(audioFile);
  sound.play();
};

// Choose a random pose from the list and update the character's pose
const updateCharacterPose = () => {
  let newPose;
  do {
    newPose = CHARACTER_POSES[Math.floor(Math.random() * CHARACTER_POSES.length)];
  } while (newPose === activePose);

  activePose = newPose;
  avatarImage.src = activePose;
};

// Handle keyboard inputs
const processKeyInput = (event) => {
  const keyIndex = ARROW_KEYS.indexOf(event.key);
  if (!currentActiveArrow) return;

  const arrowIndex = currentActiveArrow.getAttribute("data-arrow");
  if (keyIndex == arrowIndex) {
    currentActiveArrow.children[keyIndex].style.setProperty("--arrow-outline", "lightgreen");
    currentActiveArrow.children[keyIndex].style.setProperty("--arrow-color", "lightgreen");
    gameScore++;
    scoreCounter.innerHTML = `Score: ${gameScore}`;
    triggerAudio("../assets/effects/win.wav");
    updateCharacterPose();
  } else {
    triggerAudio("../assets/effects/fail.wav");
  }
};

// Generate new arrows row
const generateArrowRow = (highlightColor, speed) => {
  const arrowRow = controlBoard.cloneNode(true);
  arrowRow.style.position = "absolute";
  const randomArrow = Math.floor(Math.random() * 4);
  arrowRow.setAttribute("data-arrow", randomArrow);

  for (let i = 0; i < 4; i++) {
    if (i === randomArrow) {
      arrowRow.children[i].style.setProperty("--arrow-outline", highlightColor);
    } else {
      arrowRow.children[i].style.setProperty("--arrow-outline", "transparent");
      arrowRow.children[i].style.setProperty("--arrow-color", "transparent");
    }
  }

  spawner.append(arrowRow);
  moveArrowRow(arrowRow, speed);
};

// Animate the arrow row
const moveArrowRow = (row, speed) => {
  const rowTopBoundary = row.getBoundingClientRect().top;
  const threshold = rowTopBoundary - boardTopBoundary;

  const MIN_DISTANCE = 60;
  const MAX_DISTANCE = 100;

  setTimeout(() => {
    currentActiveArrow = row;
    setTimeout(() => {
      if (currentActiveArrow === row) {
        currentActiveArrow = null;
      }
    }, (1 / speed) * MAX_DISTANCE);
  }, (1 / speed) * (threshold - MIN_DISTANCE));

  const animationSettings = [{ transform: "translateY(-7500px)" }];

  const animationOptions = {
    duration: (1 / speed) * 10000,
    iterations: Infinity,
  };

  row.animate(animationSettings, animationOptions);

  setTimeout(() => {
    row.remove();
  }, (1 / speed) * 10000);
};

// Start the game
const initiateGame = (speed, interval) => {
  triggerAudio("../assets/music/sample-a.mp3");
  document.addEventListener("keydown", processKeyInput);
  setInterval(() => {
    const randomColorIndex = Math.floor(Math.random() * 6);
    const selectedColor = COLOR_PALETTE[randomColorIndex];
    generateArrowRow(selectedColor, speed);
  }, interval);
};

startButton.addEventListener("click", () => {
  startButton.classList.add("hidden");
  controlBoard.classList.remove("hidden");
  initiateGame(0.4, 500);
});
