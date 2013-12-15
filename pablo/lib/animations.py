import math

class Animation():
	def __init__(self, config=None):
		self.config = config
		if not self.config:
			self.config = {}

		if not "pixels" in self.config:
			self.config["pixels"] = 32

	def getFrame(self, frame):
		raise Exception("Not implemented getFrame")

	def multiplyRGB(self, rgb, amplitude):
		return (rgb[0] * amplitude, rgb[1] * amplitude, rgb[2] * amplitude)

class PulseAnimation(Animation):
	def __init__(self, config=None):
		Animation.__init__(self, config)

		if "color" not in self.config:
			self.config["color"] = (1.0, 1.0, 1.0)

		if "speed" not in self.config:
			self.config["speed"] = {
								"step": 1.0,
								"max": 100.0
							}

	def getFrame(self, frame):
		buffer = []
		position = (frame * self.config["speed"]["step"] % self.config["speed"]["max"]) / self.config["speed"]["max"]
		angle = position * 2 * math.pi
		amplitude = (math.sin(angle) + 1) / 2.0
		for i in range(self.config["pixels"]):
			buffer.append(self.multiplyRGB(self.config["color"], amplitude))
		return buffer

class SlowPulseAnimation(PulseAnimation):
	def __init__(self, config=None):
		PulseAnimation.__init__(self, config)
		self.config["speed"]["max"] = 150

class FastPulseAnimation(PulseAnimation):
	def __init__(self, config=None):
		PulseAnimation.__init__(self, config)
		self.config["speed"]["step"] = 3.0 

class RunnerAnimation(Animation):
	def __init__(self, config=None):
		Animation.__init__(self, config)

		if "color" not in self.config:
			self.config["color"] = (1.0, 1.0, 1.0)

		if "backgroundColor" not in self.config:
			self.config["backgroundColor"] = (0.0, 0.0, 0.0)

		if "speed" not in self.config:
			self.config["speed"] = {
								"step": 1.0,
							}

		if "tail" not in self.config:
			self.config["tail"] = 4

	def getFrame(self, frame):
		buffer = []

		headLocation = int((frame * self.config["speed"]["step"])) % self.config["pixels"]
		tailLocation = int((headLocation - self.config["tail"])) % self.config["pixels"]

		for i in range(self.config["pixels"]):
			if i > tailLocation and i <= headLocation:
				amplitude = (self.config["tail"] - (headLocation - i)) / self.config["tail"] * 1.0
				buffer.append(self.multiplyRGB(self.config["color"], amplitude))
			elif (i > tailLocation and tailLocation > headLocation):
				amplitude = (self.config["tail"] - (headLocation + self.config["pixels"] - i)) / self.config["tail"] * 1.0
				buffer.append(self.multiplyRGB(self.config["color"], amplitude))
			elif (i <= headLocation and tailLocation > headLocation):
				amplitude = (self.config["tail"] - (headLocation - i)) / self.config["tail"] * 1.0
				buffer.append(self.multiplyRGB(self.config["color"], amplitude))
			else:
				buffer.append(self.config["backgroundColor"])
		return buffer



