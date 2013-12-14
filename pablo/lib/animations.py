import math

class Animation():
	def __init__(self, config):
		self.config = config
		if not self.config:
			self.config = {}

		if not "pixels" in self.config:
			self.config["pixels"] = 32

	def getFrame(self, frame):
		raise Exception("Not implemented getFrame")

class PulseAnimation(Animation):
	def __init__(self, config):
		Animation.__init__(self, config)

		if "color" not in self.config:
			self.config["color"] = (1.0, 1.0, 1.0)

		if "speed" not in self.config:
			self.config["speed"] = {
								"step": 1.0,
								"max": 100.0,
							}

	def getFrame(self, frame):
		buffer = []
		position = (frame * self.config["speed"]["step"] % self.config["speed"]["max"]) / self.config["speed"]["max"]
		angle = position * 2 * math.pi
		amplitude = (math.sin(angle) + 1) / 2.0
		for i in range(self.config["pixels"]):
			buffer.append((self.config["color"][0] * amplitude, 
							self.config["color"][1] * amplitude,
							self.config["color"][2] * amplitude))