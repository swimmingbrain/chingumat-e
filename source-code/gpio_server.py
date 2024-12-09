from flask import Flask, jsonify
from flask_cors import CORS
from gpiozero import Button
import threading
import time

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (needed for browser on PC)

# GPIO Pin Configuration
pins = [12, 16, 20, 21]  # GPIO pins to monitor
buttons = {pin: Button(pin, pull_up=False) for pin in pins}

# Shared state to store GPIO statuses
gpio_states = {pin: 0 for pin in pins}

def monitor_gpio():
    """Thread to continuously monitor GPIO states."""
    global gpio_states
    while True:
        for pin, button in buttons.items():
            gpio_states[pin] = int(button.is_pressed)  # 1 if pressed, 0 otherwise
        time.sleep(0.01)  # Polling interval

@app.route('/gpio_status', methods=['GET'])
def get_gpio_status():
    # Return the current GPIO states
    print(gpio_states)  # Log the GPIO states to verify
    return jsonify(gpio_states)

if __name__ == '__main__':
    try:
        # Start GPIO monitoring in a separate thread
        gpio_thread = threading.Thread(target=monitor_gpio)
        gpio_thread.daemon = True
        gpio_thread.start()
        
        # Run Flask server
        app.run(host='0.0.0.0', port=5000)  # Accessible to the local network
    except KeyboardInterrupt:
        print("\nCleaning up...")

