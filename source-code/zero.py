from gpiozero import Button
import time
button = Button(16, pull_up=False)
while True:
    if button.is_pressed:
        print("Button is pressed")
    else:
        print("Button is not pressed")
    time.sleep(0.1)
