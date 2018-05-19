/**
 *
 */

var AlarmsMng = require("AlarmsMng");
var Alarm = require("Alarm");
var Timer = require("Timer");
var LocationAlarm = require("LocationAlarm");
var Helper = require("Helper");
var moment = require("alloy/moment");
var StorageHelper = require("StorageHelper");

Ti.UI.backgroundColor = "white";
$.tabs.setActiveTab($.locationAlarms);

var service;

var recorder = Alloy.Globals.getRecorder();
var musicPlayer = Alloy.Globals.getMusicPlayer();
var soundPlayer = Alloy.Globals.soundPlayer;

Ti.App.addEventListener("resumed", onResume);

Ti.App.addEventListener("pause", onPause);

Alloy.Globals.backgroundPlayer.addEventListener("interrupted", onInterrupt);

Alloy.Globals.backgroundPlayer.addEventListener("resume", onMediaResume);

Ti.App.addEventListener("resumed", function() {
	if (service != null) {
		service.stop();
		service.unregister();
		service = null;
	}
});

Ti.App.addEventListener("paused", function() {
	/*if (!Alloy.Globals.backgroundPlayer.playing)
	 Alloy.Globals.backgroundPlayer.play();
	 if (AlarmsMng.numOn <= 0)
	 Alloy.Globals.backgroundPlayer.stop();
	 else
	 recorder.start();*/
	Ti.API.info("paused");
});

function onResume() {
	if (Alloy.Globals.backgroundPlayer.playing)
		Alloy.Globals.backgroundPlayer.stop();
	Alloy.Globals.inApp = true;
/*	if (recorder.recording) {
		Alloy.Globals.getRecorder().stop();
	}*/
	Ti.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAYBACK;
}

function onPause() {
	if (Alloy.Globals.isPlaying)
		Ti.App.iOS.fireEvent("notification");
	saveChanges();
	//Helper.stopAudio();
	Alloy.Globals.inApp = false;
	Ti.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAY_AND_RECORD;
	//Alloy.Globals.backgroundPlayer.play();
	Ti.API.info("number of alarms on: " + AlarmsMng.numOn);
	/*if (AlarmsMng.numOn <= 0)
		Alloy.Globals.backgroundPlayer.stop();
	else
		recorder.start();*/
}

function saveChanges() {
	Ti.App.Properties.setInt("numOn", AlarmsMng.numOn);
	Ti.App.Properties.setInt("distanceFilter", AlarmsMng.distanceFilter);
	Ti.App.Properties.setInt("accuracy", AlarmsMng.accuracy);
	var alarmsFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'timeAlarms.txt');
	alarmsFile.write(AlarmsMng.stringifyTimeAlarms());
	var timersFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'timers.txt');
	timersFile.write(AlarmsMng.stringifyTimers());
	var locationsFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'locations.txt');
	locationsFile.write(AlarmsMng.stringifyLocations());
}

function initApp() {
	AlarmsMng.distanceFilter = Ti.App.Properties.getInt("distanceFilter", 50000);
	AlarmsMng.accuracy = Ti.App.Properties.getInt("accuracy", Ti.Geolocation.ACCURACY_THREE_KILOMETERS);
	initTimeAlarms();
	initTimers();
	initLocations();
	AlarmsMng.findNumOn();
}

function initTimeAlarms() {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'timeAlarms.txt');
	if (!file.exists())
		return;
	var text = file.read().text;
	if (text == "[]" || text == "")
		return;
	var arr = JSON.parse(text);
	for (var i = 0; i < arr.length; i++) {
		var alarm = new Alarm(arr[i].label, arr[i].repeat, arr[i].snooze, moment(arr[i].time), //
		arr[i].vibration, arr[i].sounds, arr[i].shuffle);
		alarm.parse(arr[i]);
		AlarmsMng.timeAlarms.push(alarm);
		$.alarmsController.saveHelper(alarm, i, false);
	}
}

function initTimers() {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'timers.txt');
	if (!file.exists())
		return;
	var text = file.read().text;
	if (text == "[]" || text == "")
		return;
	var arr = JSON.parse(text);
	for (var i = 0; i < arr.length; i++) {
		var timer = new Timer(arr[i].label, arr[i].snooze, arr[i].duration, arr[i].vibration, arr[i].sounds, arr[i].shuffle);
		timer.parse(arr[i]);
		AlarmsMng.timers.push(timer);
		$.timersController.saveHelper(timer, i, false);
	}
}

function initLocations() {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'locations.txt');
	if (!file.exists())
		return;
	var text = file.read().text;
	if (text == "[]" || text == "")
		return;
	var arr = JSON.parse(text);
	for (var i = 0; i < arr.length; i++) {
		var location = new LocationAlarm(arr[i].name, arr[i].locationName, arr[i].location, arr[i].radius, arr[i].placeId, //
		arr[i].sounds, arr[i].formattedAddress, arr[i].locationTypes);
		location.parse(arr[i]);
		AlarmsMng.locationAlarms.push(location);
		$.locationsController.saveHelper(location, i, false);
	}
}

function onInterrupt() {
	if (recorder.recording && musicPlayer.playbackState != Ti.Media.MUSIC_PLAYER_STATE_PLAYING && !soundPlayer.playing) {
		recorder.stop();
	}
	Ti.API.info("interruption occured");
}

function onMediaResume() {
	if (!recorder.recording && !Alloy.Globals.isPlaying) {
		recorder.start();
	}
	Ti.API.info("resumed after interruption");
}

initApp();

$.tabs.open();

/**
 * register for notifications.
 */
if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
	Ti.App.iOS.registerUserNotificationSettings({
		types : [//
		Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, //
		Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND, //
		Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE, //
		Ti.App.iOS.USER_NOTIFICATION_TYPE_NONE //
		]
	});
}
