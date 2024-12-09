import RPi.GPIO as GPIO
import time
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(16, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

while True:
    state = GPIO.input(16)
    if state:
        print('on')
    else:
        print('off')
    time.sleep(1)
