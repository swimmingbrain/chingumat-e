let currentActiveArrow = null;
const ARROW_KEYS = ["ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"];
const COLOR_PALETTE = ["red", "orange", "yellow", "green", "blue", "purple"];
let gameScore = 0;
let arrowSpawnTime = null;
let gameInterval = null;
let gameMusic = null;
const progress = document.getElementById("progress");
const timeDisplay = document.getElementById("time-display");
const textEffect = document.getElementById("text-effect");

textEffect.style.transition = "opacity 0.3s";
textEffect.style.opacity = 0;

// Character poses paths
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

// Trigger audio function
const triggerAudio = (audioFile, volume = 1) => {
  const sound = new Audio(audioFile);
  sound.volume = volume;
  if (isMuted) sound.muted = true;
  sound.play();
  return sound;
};

// Update character pose
const updateCharacterPose = () => {
  let newPose;
  do {
    newPose = CHARACTER_POSES[Math.floor(Math.random() * CHARACTER_POSES.length)];
  } while (newPose === activePose);

  activePose = newPose;
  avatarImage.src = activePose;
};

// Handle GPIO input
let previousGPIOState = {};

const pollGPIOStates = async () => {
  try {
    const response = await fetch("http://<raspberry-pi-ip>:5000/gpio_status"); // Replace <raspberry-pi-ip> with the Pi's IP address
    const gpioStates = await response.json();

    const gpioToArrow = {
      12: "ArrowLeft",
      16: "ArrowUp",
      20: "ArrowDown",
      21: "ArrowRight",
    };

    for (const [pin, state] of Object.entries(gpioStates)) {
      const correspondingKey = gpioToArrow[pin];

      // Process game logic if GPIO pin is pressed
      if (state === 1 && (!previousGPIOState[pin] || previousGPIOState[pin] === 0)) {
        processKeyInput({ key: correspondingKey });
      }

      // Update the previous state
      previousGPIOState[pin] = state;
    }
  } catch (error) {
    console.error("Error fetching GPIO states:", error);
  }
};

// Game logic for key inputs
const processKeyInput = (event) => {
  const keyIndex = ARROW_KEYS.indexOf(event.key);
  if (!currentActiveArrow) return;
  const arrowIndex = currentActiveArrow.getAttribute("data-arrow");
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - arrowSpawnTime;
  const accuracyScore = Math.max(0, 150 - Math.abs(500 - timeDifference));
  if (keyIndex == arrowIndex && !currentActiveArrow.processed) {
    currentActiveArrow.processed = true;
    gameScore += accuracyScore;
    scoreCounter.innerHTML = `${gameScore}`;
    updateCharacterPose();
    triggerAudio("../assets/effects/win1.wav");
    currentActiveArrow.clicked = true;
  } else {
    gameScore -= 10;
    if (gameScore < 0) gameScore = 0;
    scoreCounter.innerHTML = `${gameScore}`;
    triggerAudio("../assets/effects/fail.wav");
  }
};

// Generate and animate new arrow row
const generateArrowRow = (highlightColor, speed) => {
  const arrowRow = controlBoard.cloneNode(true);
  const randomArrow = Math.floor(Math.random() * 4);
  arrowRow.setAttribute("data-arrow", randomArrow);

  for (let i = 0; i < 4; i++) {
    arrowRow.children[i].style.setProperty(
      "--arrow-outline",
      i === randomArrow ? highlightColor : "transparent"
    );
  }

  spawner.append(arrowRow);
  arrowSpawnTime = new Date().getTime();
  setTimeout(() => {
    currentActiveArrow = arrowRow;
  }, (1 / speed) * 1000);

  setTimeout(() => {
    if (!arrowRow.clicked) gameScore -= 25;
    arrowRow.remove();
  }, (1 / speed) * 2000);
};

// Start game
startButton.addEventListener("click", () => {
  initiateGame(0.8, 500);
});

const initiateGame = (speed, interval) => {
  gameMusic = triggerAudio("../assets/music/ROSÉ & Bruno Mars - APT.mp3", 0.2);
  setInterval(pollGPIOStates, 100); // Poll GPIO states
  gameInterval = setInterval(() => {
    const randomColorIndex = Math.floor(Math.random() * COLOR_PALETTE.length);
    const selectedColor = COLOR_PALETTE[randomColorIndex];
    generateArrowRow(selectedColor, speed);
  }, interval);
};
