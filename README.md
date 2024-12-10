# chingumat-e

<img src="./assets/logo/logo-neon.png" alt="Project Logo" width="400"/>

*A captivating rhythm-based game with GPIO support for Raspberry Pi.*

![Demo GIF](./assets/branding/chingumate-preview.gif)  
*(Above: Game preview, Game Tester: Franziska Tigges)*

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Hardware Overview](#hardware-overview)
4. [Screenshots](#screenshots)
5. [Getting Started](#getting-started)
6. [How to Run](#how-to-run)
7. [Technologies Used](#technologies-used)
8. [Contributing](#contributing)
9. [License](#license)

---

## Introduction

**Chingumate** is an interactive rhythm-based game designed to work with web browsers and hardware inputs via GPIO pins on a Raspberry Pi. The game leverages foot buttons made from lightweight aluminum puzzle mats, making it easy to transport in a backpack. Perfect for gaming enthusiasts and developers!

---

## Features

- 🎶 **Rhythm-based gameplay** synchronized with music.
- 🎮 **Foot button controls** via GPIO pins on a Raspberry Pi.
- 🖥️ **Responsive neon-themed web interface**.
- ✨ **Custom animations and character poses**.
- 🧳 **Portable setup**: Puzzle mats serve as lightweight, easy-to-carry foot buttons.

---

## Hardware Overview

Chingumate uses the following hardware:

- **Aluminum puzzle mats**: Function as foot buttons for gameplay.
- **Raspberry Pi**: Central hub for GPIO processing.
- **Cables**: Minimal setup for quick deployment.
- **Portable design**: Lightweight and easy to transport in a backpack.

---

## Screenshots

### Game Interface
![Game Screenshot](./assets/branding/screenshot.png)

### Character Animation
The original character is a cat in a capybara costume, called **Chingubara**. Dancing is the only thing that makes him happy, but he doesn't like to dance alone. For more about the lore, scroll down to the end of this README file!

<img src="./assets/branding/poses.gif" alt="Character Poses" width="100"/>

---

## Getting Started

### Prerequisites

1. **Hardware Setup**:
   - Puzzle mats with aluminum contacts as foot buttons.
   - Raspberry Pi with GPIO pins and connecting cables.

2. **Software Setup**:
   - Raspberry Pi running Python 3.
   - Install required Python libraries:
     ```bash
     pip install flask flask-cors gpiozero
     ```

3. Any modern web browser.

---

## How to Run

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/chingumate.git
cd chingumate
```

## Step 2: Set Up the Raspberry Pi

- Connect the foot button GPIO pins as follows:
  - **Button 1 (Left)**: GPIO 12
  - **Button 2 (Up)**: GPIO 16
  - **Button 3 (Down)**: GPIO 20
  - **Button 4 (Right)**: GPIO 21

### Step 3: Start the Server

Run the Python script to monitor GPIO states and serve data to the web interface:

```bash
python3 gpio_server.py
```

### Step 4: Start the Local Web Server

Serve the game files using a simple Python HTTP server:

```bash
python3 -m http.server 8000
```

### Step 5: Play the Game

1. Access the game in your browser from your PC:
   ```
   http://<raspberry-ip>:8000/index.html
   ```

2. Step on the foot buttons to match the rhythm and enjoy the game!

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Flask (Python)
- **Hardware**: Raspberry Pi, GPIO-connected aluminum puzzle mats
- **Design**: Neon-inspired UI, custom animations

---

## Contributing

I welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch (`feature/my-feature`).
3. Commit changes (`git commit -m 'Add my feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
