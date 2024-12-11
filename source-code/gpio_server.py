from flask import Flask, jsonify
from flask_cors import CORS
from gpiozero import Button
import threading
import time

app = Flask(__name__)
CORS(app)

# GPIO Pin Configuration
PINS = [12, 16, 20, 21]
buttons = {pin: Button(pin, pull_up=False) for pin in PINS}

gpio_states = {pin: 0 for pin in PINS}  # Shared state for GPIO statuses

def monitor_gpio():
    """Thread to continuously monitor GPIO states."""
    while True:
        for pin, button in buttons.items():
            gpio_states[pin] = int(button.is_pressed)
        time.sleep(0.01)

@app.route('/gpio_status', methods=['GET'])
def get_gpio_status():
    """Return the current GPIO states as a JSON response."""
    print(gpio_states)
    return jsonify(gpio_states)

if __name__ == '__main__':
    try:
        # Start GPIO monitoring thread
        gpio_thread = threading.Thread(target=monitor_gpio, daemon=True)
        gpio_thread.start()

        # Run server
        app.run(host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\nCleaning up...")
