/**
 * @author Tamir Ishay sharbat
 */

var Helper = require("Helper");
var BasicAlarm = require("BasicAlarm");
var AlarmsMng = require("AlarmsMng");
var moment = require("alloy/moment");
var StorageHelper = require("StorageHelper");
var handleTimeChange;

function Alarm(label, repeat, snooze, time, vibration, sounds, shuffle) {
	this.on = false;
	this.label = label;
	this.repeat = repeat;
	this.snooze = snooze;
	//moment.js object.
	this.time = time;
	this.vibration = vibration;
	this.sounds = sounds;
	this.shuffle = shuffle;
	this.viewBlock = null;
	this.middleLine = null;
	BasicAlarm.call(this, sounds);
}

//inherits from BasicAlarm
Alarm.prototype = Object.create(BasicAlarm.prototype);

Alarm.prototype.turnOn = function() {
	var that = this;
	this.on = true;
	setTimeout(function(){
		Ti.Media.audioSessionCategory=Ti.Media.AUDIO_SESSION_CATEGORY_PLAY_AND_RECORD;
		Alloy.Globals.getRecorder().start();
	},0);
	this.turnOnHelper();
	this.time = this.findDate();
	this.setRing((this.time.unix() - moment().unix()) * 1000);
	Ti.App.addEventListener("significanttimechange", function() {
		handleTimeChange = this;
		that.onTimeChange();
	});
};

Alarm.prototype.turnOff = function(shouldAnimate) {
	this.on = false;
	setTimeout(function(){
		Ti.Media.audioSessionCategory=Ti.Media.AUDIO_SESSION_CATEGORY_PLAY_AND_RECORD;
		Alloy.Globals.getRecorder().stop();
	},0);
	this.turnOffHelper(shouldAnimate);
	Ti.App.removeEventListener("significanttimechange", handleTimeChange);
};

Alarm.prototype.equals = function(other) {
	if (!other instanceof Alarm) {
		return false;
	}
	if (this.on == other.on && this.label == other.label && //
	Helper.arrayEqual(this.repeat, other.repeat) && this.snooze == other.snooze && this.time == other.time) {
		return true;
	}
	return false;
};

Alarm.prototype.findDate = function() {
	var date = moment({
		hours : this.time.get("hours"),
		minutes : this.time.get("minutes")
	});
	if (date.isBefore(moment())) {
		date.add(1, "days");
	}
	return date;
};

Alarm.prototype.onTimeChange = function() {
	clearTimeout(this.timeout);
	this.setRing((this.time.unix() - moment().unix()) * 1000);
};

/**
 * reuturns an object with the properties of the "Alarm" in order to save it.
 */
Alarm.prototype.stringify = function() {
	var obj = {};
	for (var key in this) {
		if (key == "viewBlock" || key == "middleLine")
			continue;
		obj[key] = this[key];
		if (key == this.timeout)
			break;
	}
	obj.time = {
		hours : this.time.get("hours"),
		minutes : this.time.get("minutes"),
	};
	obj.sounds = StorageHelper.stringifySounds(this.sounds);
	obj.avalSounds = StorageHelper.stringifySounds(this.avalSounds);
	return obj;
};

module.exports = Alarm;
