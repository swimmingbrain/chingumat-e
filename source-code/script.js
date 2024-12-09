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

textEffect.style.transition = "opacity 0.3s";
textEffect.style.opacity = 0;

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
  if(isMuted) sound.muted = true;
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

// Handle GPIO input
let previousGPIOState = {};

const pollGPIOStates = async () => {
  try {
    const response = await fetch("http://raspberrypi:5000/gpio_status"); // Replace <raspberry-pi-ip> with the Pi's IP address
    const gpioStates = await response.json();

    const gpioToArrow = {
      12: "ArrowLeft",
      16: "ArrowUp",
      21: "ArrowDown",
      20: "ArrowRight",
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

// Handle keyboard inputs
const processKeyInput = (event) => {
  const keyIndex = ARROW_KEYS.indexOf(event.key);
  if (!currentActiveArrow) return;
  const arrowIndex = currentActiveArrow.getAttribute("data-arrow");
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - arrowSpawnTime;
  const accuracyScore = Math.max(0, 150 - Math.abs(500-timeDifference)); // Adjust the scoring logic as needed
  console.log(`Time difference: ${timeDifference} ms`);
  if (keyIndex == arrowIndex && !currentActiveArrow.processed) {
    currentActiveArrow.processed = true;
    textEffect.style.opacity = 0;
    setTimeout(() => {
      textEffect.data = "../assets/effects/text_perfect.svg";
      textEffect.style.opacity = 1;
    }, 300);
    let color;
    if (accuracyScore < 15) {
        color = "gray";
    } else if (accuracyScore < 40) {
        color = "orange";
    } else {
        color = "lightgreen";
    }
    currentActiveArrow.children[keyIndex].style.setProperty("--arrow-outline", color);
    currentActiveArrow.children[keyIndex].style.setProperty("--arrow-color", color);
    gameScore += accuracyScore;
    scoreCounter.innerHTML = `${gameScore}`;
    const winSounds = ["../assets/effects/win1.wav", "../assets/effects/win2.wav", "../assets/effects/win3.wav"];
    const randomWinSound = winSounds[Math.floor(Math.random() * winSounds.length)];
    triggerAudio(randomWinSound);
    updateCharacterPose();
    currentActiveArrow.clicked = true;
  } else {
    textEffect.style.opacity = 0;
    setTimeout(() => {
      textEffect.data = "../assets/effects/text_oops.svg";
      textEffect.style.opacity = 1;
    }, 300);
    gameScore -= 10;
    if (gameScore < 0) gameScore = 0;
    scoreCounter.innerHTML = `${gameScore}`;
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
    const MIN_DISTANCE = 120;
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
      duration: (1 / speed) * 9000,
      iterations: Infinity,
    };

    row.animate(animationSettings, animationOptions);
    setTimeout(() => {
      if (!row.clicked) {
        textEffect.style.opacity = 0;
        setTimeout(() => {
          textEffect.data = "../assets/effects/text_missed.svg";
          gameScore -= 25;
          if (gameScore < 0) gameScore = 0;
          scoreCounter.innerHTML = `${gameScore}`;
          textEffect.style.opacity = 1;
        }, 300);
        triggerAudio("../assets/effects/fail.wav");
      }
      row.remove();
    }, (1 / speed) * 1650);
  });
};

startButton.addEventListener("click", () => {
  startButton.classList.add("hidden");
  controlBoard.classList.remove("hidden");
  initiateGame(0.2, 1500);
});

const muteButton = document.getElementById("mute-button");
let isMuted = false;

muteButton.addEventListener("click", () => {
  isMuted = !isMuted;

});

const restartButton = document.getElementById("restart-button");
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
  scoreCounter.innerHTML = `${gameScore}`;
  clearInterval(gameInterval);
});

// Start the game
const initiateGame = (speed, interval) => {
  gameMusic = triggerAudio("../assets/music/ROSÉ & Bruno Mars - APT.mp3", 0.2);
  setInterval(pollGPIOStates, 10); // Poll GPIO states
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

  // Set audio duration once metadata is loaded
  gameMusic.addEventListener('loadedmetadata', () => {
    updateProgress();
  });

  // Update progress bar and time display
  gameMusic.addEventListener('timeupdate', updateProgress);
};

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
