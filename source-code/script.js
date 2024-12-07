let currentActiveArrow = null;
const ARROW_KEYS = ["ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"];
const COLOR_PALETTE = ["red", "orange", "yellow", "green", "blue", "purple"];
let gameScore = 0;
let arrowSpawnTime = null;
let gameInterval = null;
let gameMusic = null;
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const timeDisplay = document.getElementById('time-display');
const textEffect = document.getElementById("text-effect");

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
const triggerAudio = (audioFile, volume=1) => {
  const sound = new Audio(audioFile);
  sound.volume = volume;
  sound.play();
  return sound;
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
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - arrowSpawnTime;
  const accuracyScore = Math.max(0, 100 - Math.abs(500-timeDifference)); // Adjust the scoring logic as needed
  console.log(`Time difference: ${timeDifference} ms`);
  if (keyIndex == arrowIndex) {
    textEffect.data = "../assets/effects/text_perfect.svg";
    currentActiveArrow.children[keyIndex].style.setProperty("--arrow-outline", "lightgreen");
    currentActiveArrow.children[keyIndex].style.setProperty("--arrow-color", "lightgreen");
    gameScore += accuracyScore;
    scoreCounter.innerHTML = `${gameScore}`;
    const winSounds = ["../assets/effects/win1.wav", "../assets/effects/win2.wav", "../assets/effects/win3.wav"];
    const randomWinSound = winSounds[Math.floor(Math.random() * winSounds.length)];
    triggerAudio(randomWinSound);
    updateCharacterPose();
    currentActiveArrow.clicked = true;
  } else {
    textEffect.data = "../assets/effects/text_oops.svg";
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
  arrowSpawnTime = new Date().getTime();
  setTimeout(() => {
    const MIN_DISTANCE = 60;
    const MAX_DISTANCE = 160;

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
      if (!row.clicked) {
        textEffect.data = "../assets/effects/text_missed.svg";
        triggerAudio("../assets/effects/fail.wav");
      }
      row.remove();
    }, (1 / speed) * 1650);
  });
};

// Start the game
const initiateGame = (speed, interval) => {
  gameMusic = triggerAudio("../assets/music/sample-a.mp3", 0.2);
  document.addEventListener("keydown", processKeyInput);
  gameInterval = setInterval(() => {
    const randomColorIndex = Math.floor(Math.random() * 6);
    const selectedColor = COLOR_PALETTE[randomColorIndex];
    generateArrowRow(selectedColor, speed);
  }, interval);

  gameMusic.addEventListener("ended", () => {
    clearInterval(gameInterval);
    document.removeEventListener("keydown", processKeyInput);
  });
};

startButton.addEventListener("click", () => {
  startButton.classList.add("hidden");
  controlBoard.classList.remove("hidden");
  initiateGame(0.4, 500);
});

// Set audio duration once metadata is loaded
gameMusic.addEventListener('loadedmetadata', () => {
  updateProgress();
});

// Update progress bar and time display
gameMusic.addEventListener('timeupdate', updateProgress);

function updateProgress() {
  const currentTime = Math.floor(gameMusic.currentTime);
  const duration = Math.floor(gameMusic.duration);

  const currentMinutes = Math.floor(currentTime / 60);
  const currentSeconds = currentTime % 60;
  const totalMinutes = Math.floor(duration / 60);
  const totalSeconds = duration % 60;

  // Format time to display as mm:ss
  const formatTime = (min, sec) => `${min}:${sec.toString().padStart(2, '0')}`;

  timeDisplay.textContent = `${formatTime(currentMinutes, currentSeconds)} / ${formatTime(totalMinutes, totalSeconds)}`;

  const progressPercent = (gameMusic.currentTime / gameMusic.duration) * 100;
  progress.style.width = `${progressPercent}%`;
}