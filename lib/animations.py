import math

class KeyFrame():
	def __init__(self, rgb, timing):
		self.rgb = rgb
		self.timing = timing

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

	def interpolate(self, rgb1, rgb2, ratio):
		r = (rgb2[0] - rgb1[0]) * ratio + rgb1[0]
		g = (rgb2[1] - rgb1[1]) * ratio + rgb1[1]
		b = (rgb2[2] - rgb1[2]) * ratio + rgb1[2]

		return (r, g, b)

	def getFilledFrame(self, rgb):
		buffer = []
		for i in range(self.config["pixels"]):
			buffer.append(rgb)
		return buffer

class PulseAnimation(Animation):
	def __init__(self, config=None):
		Animation.__init__(self, config)

		if "color" not in self.config:
			self.config["color"] = (1.0, 1.0, 1.0)

		if "backgroundColor" not in self.config:
			self.config["backgroundColor"] = (0.0, 0.0, 0.0)

		if "speed" not in self.config:
			self.config["speed"] = {
								"step": 1.0,
								"max": 100.0
							}

	def getFrame(self, frame):
		position = (frame * self.config["speed"]["step"] % self.config["speed"]["max"]) / self.config["speed"]["max"]
		angle = position * 2 * math.pi
		amplitude = (math.sin(angle) + 1) / 2.0
		return self.getFilledFrame(self.interpolate(self.config["color"], self.config["backgroundColor"], amplitude))

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

		headLocation = (frame * self.config["speed"]["step"]) % self.config["pixels"]
		tailLocation = (headLocation - self.config["tail"]) % self.config["pixels"]
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

class KeyFrameAnimation(Animation):
	def __init__(self, config=None):
		Animation.__init__(self, config)

		if "speed" not in self.config:
			self.config["speed"] = {
								"step": 1.0,
								"max": 100.0
							}

		if "loop" not in self.config:
			self.config["loop"] = True

		if "keyFrames" not in self.config:
			self.config["keyFrames"] = []
			self.config["keyFrames"].append(KeyFrame((1,0,0), 0.00))
			self.config["keyFrames"].append(KeyFrame((1,1,0), 0.20))
			self.config["keyFrames"].append(KeyFrame((0,1,0), 0.45))
			self.config["keyFrames"].append(KeyFrame((0,1,1), 0.60))
			self.config["keyFrames"].append(KeyFrame((0,0,1), 0.75))
			self.config["keyFrames"].append(KeyFrame((1,0,1), 0.90))

	def getFrame(self, frame):
		if self.config["loop"]:
			timing = ((frame * self.config["speed"]["step"]) % self.config["speed"]["max"]) / self.config["speed"]["max"] * 1.0
		else:
			timing = min((frame * self.config["speed"]["step"]) / self.config["speed"]["max"] * 1.0, 1.0)
		prevFrame = self.config["keyFrames"][0]
		nextFrame = None
		for keyFrame in self.config["keyFrames"][1:]:
			if keyFrame.timing <= timing:
				prevFrame = keyFrame
			if keyFrame.timing > timing:
				nextFrame = keyFrame
				break
		if not nextFrame:
			if self.config["loop"]:
				nextFrame = self.config["keyFrames"][0]

		if nextFrame:
			interpolationRatio =  (timing - prevFrame.timing) / (nextFrame.timing - prevFrame.timing)
		else:
			interpolationRatio = 0.0
			nextFrame = prevFrame
		r = (nextFrame.rgb[0] - prevFrame.rgb[0]) * interpolationRatio + prevFrame.rgb[0]
		g = (nextFrame.rgb[1] - prevFrame.rgb[1]) * interpolationRatio + prevFrame.rgb[1]
		b = (nextFrame.rgb[2] - prevFrame.rgb[2]) * interpolationRatio + prevFrame.rgb[2]

		return self.getFilledFrame((r, g, b))


class SunriseAnimation(KeyFrameAnimation):
	def __init__(self, config=None):
		KeyFrameAnimation.__init__(self, config)

		self.config["keyFrames"] = []
		self.config["keyFrames"].append(KeyFrame((0,0,0), 0.00))
		self.config["keyFrames"].append(KeyFrame((0.09,0.04,0.17), 0.20))
		self.config["keyFrames"].append(KeyFrame((0.15,0.01,0.15), 0.40))
		self.config["keyFrames"].append(KeyFrame((0.16,0.08,0.08), 0.60))
		self.config["keyFrames"].append(KeyFrame((0.26,0.17,0.19), 0.70))
		self.config["keyFrames"].append(KeyFrame((0.92,0.85,0.33), 0.80))
		self.config["keyFrames"].append(KeyFrame((1.0,0.96,0.65), 0.90))

		self.config["loop"] = False

class NightLightAnimation(PulseAnimation):
	def __init__(self, config=None):
		PulseAnimation.__init__(self, config)

		self.config["color"] = (0.7, 0.2, 0.15)
		self.config["backgroundColor"] = (0.42, 0.1, 0.1)
