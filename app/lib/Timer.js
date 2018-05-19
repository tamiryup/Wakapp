/**
 * @author Tamir Ishay sharbat
 *
 * sounds - sounds is an array containing objects of form:
 * 		{row: TableViewRow ,item: Titanium.media.item }
 */

var BasicAlarm = require("BasicAlarm");
var AlarmsMng = require("AlarmsMng");
var Helper = require("Helper");
var StorageHelper = require("StorageHelper");

function Timer(label, snooze, duration, vibration, sounds, shuffle) {
	this.on = false;
	this.label = label;
	this.snooze = snooze;
	this.duration = duration;
	this.vibration = vibration;
	this.sounds = sounds;
	this.shuffle = shuffle;
	this.middleLine = undefined;
	this.viewBlock = undefined;
	BasicAlarm.call(this, sounds);
}

//inherits from BasicAlarm
Timer.prototype = Object.create(BasicAlarm.prototype);

Timer.prototype.turnOn = function() {
	this.on = true;
	this.turnOnHelper();
	this.setRing(this.duration);
};

Timer.prototype.turnOff = function(shouldAnimate) {
	this.on = false;
	this.turnOffHelper(shouldAnimate);
};

Timer.prototype.equals = function(other) {
	if (!other instanceof Timer) {
		return false;
	}
	if (this.on == other.on && this.label == other.label && //
	this.snooze == other.snooze && this.duration == other.duration) {
		return true;
	}
	return false;
};

Timer.prototype.stringify = function() {
	var obj = {};
	for (var key in this) {
		if (key == "viewBlock" || key == "middleLine")
			continue;
		obj[key] = this[key];
		if (key == this.timeout)
			break;
	}
	obj.sounds = StorageHelper.stringifySounds(this.sounds);
	obj.avalSounds = StorageHelper.stringifySounds(this.avalSounds);
	return obj;
};

module.exports = Timer;
