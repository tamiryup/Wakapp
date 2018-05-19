// Arguments passed into this controller can be accessed via the `$.args` object directly or:

/**
 * EVENTS:
 * 1. saveAlarm - the save alarm event is fired when
 *    when the "AddAlarm" page fires it. usually when
 *    the user presses the save button.
 *
 * 2. closeAdd - the close add event if fired when we want to close
 *    the "AddAlarm" page. the event can only be fired from the save function.
 *
 * ASSUMPTIONS:
 * 1. the "alarmControllers" array and the "AlarmsMng.timeAlarms" lengths
 *    are always equal.
 *
 *
 */

var args = $.args;
var Alarm = require("Alarm");
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

var MainwinObj = new MainwinHelper($, alarmControllers, AlarmsMng.timeAlarms, middleLines, //
doneEdit, trash, save, "AddAlarm", openAdd, engageEditMode, exitEditMode, trashFunc);

function trashFunc() {
	deleteSelected(200);
}

function openAdd(e) {
	MainwinObj.openAdd();
}

/**
 * this function saves the newly made alarm clock.
 * it should be triggerd only by the save alarm event.
 *
 * HOW IT WORKS:
 * 1. the function creates a new alarm from the args then a new controller from that alarm.
 * 2. adds them to the corresponding arrays(AlarmsMng.timeAlarm, alarmControllers).
 * 3. updates the view using the "ViewHelper"'s functions.
 * 4. after it's all done it fires the "closeAdd" event to close the "AddAlarm" window.
 *
 * @param {Object} args - an argument object sent to the function.
 */
function save(args) {
	$.off("saveAlarm", save);
	var alarm = new Alarm(args.label, args.repeat, args.snooze, moment(args.time), args.vibration, args.sounds, args.shuffle);
	var index = AlarmsMng.addToTimeAlarms(alarm);
	MainwinObj.saveHelper(alarm, index, args.isEdit);
	return index;
}

/*
* #########      ########           #######      ###############
* #              #  ########           #               ##
* #              #     ######          #               ##
* #########      #        ####         #               ##
* #              #     ######          #               ##
* #              #  ########           #               ##
* #########      #########          #######            ##
*/

////////////////////////
//EDIT MODE FUNCTIONS//
//////////////////////
/**
 * starts edit mode of the alarms.
 */
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

//end of edit mode functions

function update(args) {
	MainwinObj.update(args);
}

exports.saveHelper = function(alarm, index, isEdit) {
	MainwinObj.saveHelper(alarm, index, isEdit);
};
