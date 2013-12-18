var Easing = require('easing');

var STEPS = 100;
var DURATION_SCALE = 1000/STEPS;

function Throb(setter, num_pixels, start_color, end_color, duration, options)
{
    this.setter = setter;
    this.pixels = num_pixels;
    this.start_color = start_color;
    this.end_color = end_color;
    this.duration = duration;
    if (options !== undefined && "easing" in options) {
        this.easing = Easing(STEPS, options.easing, {
            endToEnd:true
        });
    } else {
        this.easing = Easing(STEPS, 'linear', {
            endToEnd:true
        });
    }
    this.step = 0;
    this.running = false;
}

Throb.prototype.start = function() {
    //console.log(this.easing);
    this.running = true;
    this.tick();
}

Throb.prototype.stop = function() {
    this.running = false;
}

Throb.prototype.calculate_single = function(start_value, end_value) {
    var retval = start_value + (end_value-start_value)*this.easing[this.step];
    return retval;
}

Throb.prototype.calculate_rgb = function() {
    var r = this.calculate_single(this.start_color[0],
                                  this.end_color[0]);
    var g = this.calculate_single(this.start_color[1],
                                  this.end_color[1]);
    var b = this.calculate_single(this.start_color[2],
                                  this.end_color[2]);
    return [r,g,b];
}

Throb.prototype.tick = function() {
    var self = this;
    var rgb = this.calculate_rgb();
    // Loop through all of the pixels in pixels, and call set
    for (var i = 0; i < this.pixels; i++) {
        self.setter.set(i, rgb[0], rgb[1], rgb[2]);
    } 
    self.setter.sync();

    this.step = (this.step+=1)%STEPS;
    if (this.running) {
        setTimeout(function() { self.tick(); },
            this.duration*DURATION_SCALE);
    }
}

module.exports = Throb;
