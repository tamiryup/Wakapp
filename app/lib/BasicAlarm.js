/**
 * @author Tamir
 */

var Helper = require("Helper");
var AlarmsMng = require("AlarmsMng");
var StorageHelper = require("StorageHelper");

function BasicAlarm(sounds) {
	this.avalSounds = sounds.slice();
	//index in array.
	this.current = 0;
	this.usedCurrent = false;
	this.timeout = null;
}

/**
 * sets when the alarm should ring.
 */
BasicAlarm.prototype.setRing = function(duration) {
	var that = this;
	this.timeout = setTimeout(function() {
		that.ring();
	}, duration);
};

BasicAlarm.prototype.chooseCurrent = function() {
	this.current = Math.floor(Math.random() * this.avalSounds.length);
};

/**
 * rings and calls "listenToSnooze" in order to activate snooze when user pulls notification.
 */
BasicAlarm.prototype.ring = function() {
	if (Alloy.Globals.isPlaying)
		Ti.App.iOS.fireEvent("notification");
	Helper.stopAudio();
	Helper.stopRecorder();
	Ti.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAYBACK;
	if (Alloy.Globals.inApp == false) {
		this.ringNotification();
	} else {
		this.turnOff(false);
	}
};

BasicAlarm.prototype.ringNotification = function() {
	if (this.avalSounds != [])
		this.playSound();
	else
		Alloy.Globals.setPlaying(this);
	this.vibrate();
	if (this.location != null)
		Ti.App.iOS.scheduleLocalNotification(this.createSnoozeNotifyObj("you arrived at " + this.name));
	else
		Ti.App.iOS.scheduleLocalNotification(this.createSnoozeNotifyObj(this.label));
	this.listenToSnooze();
};

BasicAlarm.prototype.vibrate = function() {
	if (this.vibration) {
		Alloy.Globals.shouldVibrate = true;
		Helper.vibrate();
	}
};

BasicAlarm.prototype.playSound = function() {
	Alloy.Globals.setPlaying(this);
	this.usedCurrent = true;
	var soundObject = this.avalSounds[this.current];
	if (soundObject.item == null) {
		this.playRegularSound(soundObject);
	} else {
		this.playSong(soundObject);
	}
};

BasicAlarm.prototype.playRegularSound = function(soundObject) {
	var that = this;
	Alloy.Globals.soundPlayer = Ti.Media.createSound({
		url : Helper.titleToUrl(soundObject.row.title),
		looping : true,
	});
	Alloy.Globals.soundPlayer.addEventListener("interrupted", function onSoundPlayerInterruption() {
		Alloy.Globals.soundPlayer.removeEventListener("interrupted", onSoundPlayerInterruption);
		that.handleSnooze();
	});
	Alloy.Globals.soundPlayer.play();
	Alloy.Globals.stopSoundTimeout = setTimeout(this.turnOff, 10 * 60 * 1000);
};

BasicAlarm.prototype.playSong = function(soundObject) {
	var musicPlayer = Alloy.Globals.getMusicPlayer();
	//var arr = Helper.fillArray(, Math.ceil(600 / soundObject.item.playbackDuration));
	musicPlayer.setQueue(Ti.Media.queryMusicLibrary(soundObject.item)[0]);
	musicPlayer.play();
};

/**
 * createSnoozeNotifyObj is a function which returns a notification object.
 * the function sets the notification to go off now with given body and action snooze.
 *
 * @param body - the alert body the notification should have.
 *
 * @return - a notification object.
 */
BasicAlarm.prototype.createSnoozeNotifyObj = function(body) {
	var action;
	if (this.snooze == null)
		action = "turn off";
	else
		action = "snooze";
	return {
		date : new Date(new Date().getTime() + 100),
		alertBody : body,
		alertAction : action
	};
};

/**
 * adds an event listener to when the user swipes on the notification.
 */
BasicAlarm.prototype.listenToSnooze = function() {
	var that = this;
	Ti.App.iOS.addEventListener("notification", function handle() {
		Ti.App.iOS.removeEventListener("notification", handle);
		Ti.API.info(that.label);
		that.handleSnooze();
	});
};

BasicAlarm.prototype.handleSnooze = function() {
	clearTimeout(Alloy.Globals.stopSoundTimeout);
	/*if (this.snooze != null) {
		Helper.stopAudio();
		Helper.stopRecorder();
		this.setRing(this.snooze * 60 * 1000);
	} else {*/
		this.turnOff(false);
	//}
};

BasicAlarm.prototype.turnOffHelper = function(shouldAnimate) {
	if (shouldAnimate) {
		this.viewBlock.turnViewOff();
	} else {
		this.viewBlock.instantViewTurnOff();
	}
	if (this.location == null)
		AlarmsMng.decNumOn();
	if (this.timeout != null)
		clearTimeout(this.timeout);
	Helper.stopAudio();
	if (this.usedCurrent && this.avalSounds.length > 0)
		this.avalSounds.splice(this.current, 1);
	if (this.avalSounds.length == 0)
		this.avalSounds = this.sounds.slice();
};

BasicAlarm.prototype.turnOnHelper = function() {
	this.usedCurrent = false;
	this.chooseCurrent();
	AlarmsMng.incNumOn();
};

BasicAlarm.prototype.onSoundPlayerInterrupt = function() {
	this.handleSnooze();
};

BasicAlarm.prototype.parse = function(obj) {
	this.sounds = StorageHelper.parseSounds(obj.sounds);
	this.avalSounds = StorageHelper.parseSounds(obj.avalSounds);
	this.current = obj.current;
	this.usedCurrent = obj.usedCurrent;
	this.timeout = obj.timeout;
};

module.exports = BasicAlarm;
