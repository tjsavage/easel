from lib.ledstrip import LEDStrip
from lib.animations import PulseAnimation

import time
import sys

spidev = file("/dev/spidev0.0", "wb")
leds = LEDStrip(pixels=32, spi=spidev)

def main():
	anim = PulseAnimation({
				"speed": {
						"step": 4.0,
						"max": 100.0
					}
				})

	
	frame = 0

	while True:
		frame += 1
		buffer = anim.getFrame(frame)
		leds.setPixelBuffer(buffer)

		leds.show()
		time.sleep(0.02)

if __name__ == "__main__":
	try:
		main()
	except KeyboardInterrupt:
		leds.reset()
		sys.exit()
