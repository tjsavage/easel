from lib.ledstrip import LEDStrip
from lib.animations import PulseAnimation

import time

anim = PulseAnimation(None)

spidev = file("/dev/spidev0.0", "wb")
leds = LEDStrip(pixels=32, spi=spidev)
frame = 0

while True:
	frame += 1
	buffer = anim.getFrame(frame)
	leds.setPixelBuffer(buffer)

	leds.show()
	time.sleep(0.02)
