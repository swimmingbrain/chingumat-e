import RPi.GPIO as GPIO
import time

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(22, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:
    if GPIO.input(22) == GPIO.HIGH:
        print("PRESS!")
        time.sleep(1)
