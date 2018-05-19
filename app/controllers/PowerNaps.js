// Arguments passed into this controller can be accessed via the `$.args` object directly or:

var args = $.args;
var Timer = require("Timer");
var AlarmsMng = require("AlarmsMng");
var ViewHelper = require("ViewHelper");
var moment = require("alloy/moment");
var dispatcher = require("dispatcher");
var MainwinHelper = require("MainwinHelper");

var alarmControllers = [];
var middleLines = [];

//buttons
var doneEdit = Ti.UI.createButton({
	systemButton : Ti.UI.iPhone.SystemButton.DONE,
	id : "doneEdit",
});
var trash = Ti.UI.createButton({
	systemButton : Ti.UI.iPhone.SystemButton.TRASH,
	id : "trash"
});

var MainwinObj = new MainwinHelper($, alarmControllers, AlarmsMng.timers, middleLines, //
doneEdit, trash, save, "AddTimer", openAdd, engageEditMode, exitEditMode, trashFunc);


function trashFunc() {
	deleteSelected(200);
}

function openAdd() {
	MainwinObj.openAdd();
}

function save(args) {
	$.off("saveAlarm", save);
	var timer = new Timer(args.label, args.snooze, args.duration, args.vibration, args.sounds, args.shuffle);
	var index = AlarmsMng.addToTimers(timer);
	MainwinObj.saveHelper(timer, index, args.isEdit);
	return index;
}

function engageEditMode() {
	MainwinObj.engageEditMode(exitEditMode, update);
}

function exitEditMode(time) {
	MainwinObj.exitEditMode(time);
}

/**
 * deleteSelected is fired when the user in editing mode and presses the trash icon.
 * then calls a viewHelper function "deleteFromView" that deletes and move the alarms.
 * after that the "cleanControllers" function is called to clean the arrays underneath.
 */
function deleteSelected(animationDuration) {
	MainwinObj.deleteSelected(animationDuration);
}

function update(args) {
	MainwinObj.update(args);
}

exports.saveHelper = function(alarm, index, isEdit) {
	MainwinObj.saveHelper(alarm, index, isEdit);
};
