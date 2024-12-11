let currentActiveArrow = null;
const ARROW_KEYS = ["ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"];
const COLOR_PALETTE = ["red", "orange", "yellow", "green", "blue", "purple"];
let gameScore = 0;
let arrowSpawnTime = null;
let gameInterval = null;
let gameMusic = null;
let isMuted = false;

const audio = document.getElementById("audio");
const progress = document.getElementById("progress");
const timeDisplay = document.getElementById("time-display");
const textEffect = document.getElementById("text-effect");
const avatarImage = document.querySelector(".character");
const controlBoard = document.getElementById("control-board");
const spawner = document.getElementById("row-spawner");
const startButton = document.getElementById("start-button");
const scoreCounter = document.getElementById("score");
const muteButton = document.getElementById("mute-button");
const restartButton = document.getElementById("restart-button");

const CHARACTER_POSES = [
  "../assets/character/cattobara/pose-a.png",
  "../assets/character/cattobara/pose-b.png",
  "../assets/character/cattobara/pose-c.png",
  "../assets/character/cattobara/pose-d.png",
  "../assets/character/cattobara/pose-e.png",
];

let activePose = CHARACTER_POSES[0];
let previousGPIOState = {};

textEffect.style.transition = "opacity 0.3s";
textEffect.style.opacity = 0;

// Handle audio playback
const triggerAudio = (audioFile, volume = 1) => {
  const sound = new Audio(audioFile);
  sound.volume = volume;
  sound.muted = isMuted;
  sound.play();
  return sound;
};

// Randomly update character pose
const updateCharacterPose = () => {
  let newPose;
  do {
    newPose = CHARACTER_POSES[Math.floor(Math.random() * CHARACTER_POSES.length)];
  } while (newPose === activePose);
  activePose = newPose;
  avatarImage.src = activePose;
};

// Periodically fetch GPIO states from the server and process input
const pollGPIOStates = async () => {
  try {
    const response = await fetch("http://raspberrypi:5000/gpio_status");
    const gpioStates = await response.json();

    const gpioToArrow = {
      12: "ArrowLeft",
      16: "ArrowUp",
      21: "ArrowDown",
      20: "ArrowRight",
    };

    for (const [pin, state] of Object.entries(gpioStates)) {
      const correspondingKey = gpioToArrow[pin];
      if (state === 1 && (!previousGPIOState[pin] || previousGPIOState[pin] === 0)) {
        processKeyInput({ key: correspondingKey });
      }
      previousGPIOState[pin] = state;
    }
  } catch (error) {
    console.error("Error fetching GPIO states:", error);
  }
};

// Handle input
const processKeyInput = (event) => {
  const keyIndex = ARROW_KEYS.indexOf(event.key);
  if (!currentActiveArrow || currentActiveArrow.processed) return;

  const arrowIndex = parseInt(currentActiveArrow.getAttribute("data-arrow"), 10);
  const currentTime = Date.now();
  const timeDifference = currentTime - arrowSpawnTime;
  const accuracyScore = Math.max(0, 150 - Math.abs(500 - timeDifference));

  if (keyIndex === arrowIndex) {
    currentActiveArrow.processed = true;
    textEffect.style.opacity = 0;
    setTimeout(() => {
      textEffect.data = "../assets/effects/text_perfect.svg";
      textEffect.style.opacity = 1;
    }, 300);

    const color = accuracyScore < 15 ? "gray" : accuracyScore < 40 ? "orange" : "lightgreen";
    currentActiveArrow.children[keyIndex].style.setProperty("--arrow-outline", color);
    currentActiveArrow.children[keyIndex].style.setProperty("--arrow-color", color);

    gameScore += accuracyScore;
    scoreCounter.textContent = gameScore;

    const winSounds = ["../assets/effects/win1.wav", "../assets/effects/win2.wav", "../assets/effects/win3.wav"];
    triggerAudio(winSounds[Math.floor(Math.random() * winSounds.length)]);

    updateCharacterPose();
    currentActiveArrow.clicked = true;
  } else {
    textEffect.style.opacity = 0;
    setTimeout(() => {
      textEffect.data = "../assets/effects/text_oops.svg";
      textEffect.style.opacity = 1;
    }, 300);

    gameScore = Math.max(0, gameScore - 10);
    scoreCounter.textContent = gameScore;
    triggerAudio("../assets/effects/fail.wav");
  }
};

// Create new arrow row
const generateArrowRow = (highlightColor, speed) => {
  const arrowRow = controlBoard.cloneNode(true);
  arrowRow.style.position = "absolute";
  const randomArrow = Math.floor(Math.random() * ARROW_KEYS.length);
  arrowRow.setAttribute("data-arrow", randomArrow);

  Array.from(arrowRow.children).forEach((child, index) => {
    const color = index === randomArrow ? highlightColor : "transparent";
    child.style.setProperty("--arrow-outline", color);
    child.style.setProperty("--arrow-color", color);
  });

  spawner.appendChild(arrowRow);
  moveArrowRow(arrowRow, speed);
};

// Animate arrow rows and handle logic for missed arrows
const moveArrowRow = (row, speed) => {
  const boardTopBoundary = controlBoard.getBoundingClientRect().top;
  const rowTopBoundary = row.getBoundingClientRect().top;
  const threshold = rowTopBoundary - boardTopBoundary;
  arrowSpawnTime = Date.now();

  setTimeout(() => {
    const MIN_DISTANCE = 120;
    const MAX_DISTANCE = 160;

    setTimeout(() => {
      currentActiveArrow = row;
      setTimeout(() => {
        if (currentActiveArrow === row) currentActiveArrow = null;
      }, (1 / speed) * MAX_DISTANCE);
    }, (1 / speed) * (threshold - MIN_DISTANCE));

    row.animate([{ transform: "translateY(-7500px)" }], {
      duration: (1 / speed) * 9000,
      iterations: Infinity,
    });

    setTimeout(() => {
      if (!row.clicked) {
        textEffect.style.opacity = 0;
        setTimeout(() => {
          textEffect.data = "../assets/effects/text_missed.svg";
          textEffect.style.opacity = 1;
        }, 300);

        gameScore = Math.max(0, gameScore - 25);
        scoreCounter.textContent = gameScore;
        triggerAudio("../assets/effects/fail.wav");
      }
      row.remove();
    }, (1 / speed) * 1650);
  });
};

// Start game when button is clicked
startButton.addEventListener("click", () => {
  startButton.classList.add("hidden");
  controlBoard.classList.remove("hidden");
  initiateGame(0.2, 1500);
});

// Toggle mute state
muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
});

// Restart game and reset score
restartButton.addEventListener("click", () => {
  if (gameMusic) {
    gameMusic.pause();
    gameMusic.currentTime = 0;
  }

  const checkArrowsGone = setInterval(() => {
    if (spawner.children.length === 0) {
      clearInterval(checkArrowsGone);
      initiateGame(0.2, 1500);
    }
  }, 100);

  gameScore = 0;
  scoreCounter.textContent = gameScore;
  clearInterval(gameInterval);
});

// Initialize game, set up music and generate arrows
const initiateGame = (speed, interval) => {
  gameMusic = triggerAudio("../assets/music/beta.mp3", 0.2);
  setInterval(pollGPIOStates, 10);
  document.addEventListener("keydown", processKeyInput);

  gameInterval = setInterval(() => {
    const selectedColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    generateArrowRow(selectedColor, speed);
  }, interval);

  gameMusic.addEventListener("ended", () => {
    clearInterval(gameInterval);
    document.removeEventListener("keydown", processKeyInput);
  });

  gameMusic.addEventListener("loadedmetadata", updateProgress);
  gameMusic.addEventListener("timeupdate", updateProgress);
};

const updateProgress = () => {
  const currentTime = Math.floor(gameMusic.currentTime);
  const duration = Math.floor(gameMusic.duration);

  const formatTime = (min, sec) => `${min}:${sec.toString().padStart(2, "0")}`;
  const currentMinutes = Math.floor(currentTime / 60);
  const currentSeconds = currentTime % 60;
  const totalMinutes = Math.floor(duration / 60);
  const totalSeconds = duration % 60;

  timeDisplay.textContent = `${formatTime(currentMinutes, currentSeconds)} / ${formatTime(totalMinutes, totalSeconds)}`;
  progress.style.width = `${(gameMusic.currentTime / gameMusic.duration) * 100}%`;
};
