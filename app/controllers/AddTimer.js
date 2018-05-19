// Arguments passed into this controller can be accessed via the `$.args` object directly or:

var args = $.args;
var mainCont = args.mainCont;
var dispatcher = require("dispatcher");
var AddHelper = require("AddHelper");
var ListenerObject = require("ListenerObject");
var isEdit = Boolean(args.isEdit);
var Mainwin = args.Mainwin;
var listeners = initListeners();

//closing and openning

////////////////////
////DO NOT TOUCH///
//////////////////

AddHelper.initPlace($);

function animateOpen() {
	AddHelper.animateOpen($, Mainwin);
}

function animateClose() {
	AddHelper.animateClose($);
}

//end of block

function initListeners() {
	arr = [];
	arr[0] = new ListenerObject($.labelRow, "click", openLabel);
	arr[1] = new ListenerObject($.soundRow, "click", openSound);
	arr[2] = new ListenerObject($.snoozeRow, "click", openSnooze);
	return arr;
}

/**
 * a function calling AddHelper's "addAllListeners" to add back event listeners.
 */
function addAllListeners() {
	AddHelper.addAllListeners(listeners, addAllListeners);
}

function onCancel() {
	animateClose();
}

$.save.addEventListener("click", onSave);

/**
 * initializing variables.
 */
var label = args.label || "Timer";
var snooze = args.snooze || 5;
var duration = args.duration || 60 * 1000;
var sounds = args.sounds || [Alloy.Globals.defaultSound];
var vibration = Boolean(args.vibration);
var shuffle = Boolean(args.shuffle);

function initializeView() {
	setLabel({
		value : label,
	});
	setSnooze({
		val : snooze,
	});
	$.sound.setText(AddHelper.setSoundHelp($, sounds, shuffle));
	$.s.value = vibration;
	$.pick.setSelectedRow(0, 1);
	$.pick.setSelectedRow(0, 0);
	$.pick.setCountDownDuration(duration);
}

initializeView();

function onCancel() {
	mainCont.trigger("cancel");
	animateClose();
}

/////////////////
//label func's//
///////////////
function openLabel(e) {
	AddHelper.removeAllListeners(listeners, addAllListeners);
	var l = Alloy.createController("Label", {
		win : $.win,
		text : label,
		element : $.label,
	});
	$.win.openWindow(l.getView());
	dispatcher.on("setLabel", setLabel);
}

function setLabel(e) {
	label = e.value;
	$.label.text = label;
	dispatcher.off("setLabel", setLabel);
}

//end of label func's

//////////////////
//snooze func's//
////////////////
function openSnooze(e) {
	AddHelper.removeAllListeners(listeners, addAllListeners);
	var s = Alloy.createController("Snooze", {
		win : $.win,
		snooze : snooze,
	});
	$.win.openWindow(s.getView());
	dispatcher.on("setSnooze", setSnooze);
}

function setSnooze(e) {
	snooze = e.val;
	if (snooze == null) {
		$.snooze.text = "Off";
	} else {
		$.snooze.text = snooze + " min";
	}
	dispatcher.off("setSnooze", setSnooze);
}

//end of snooze func's

/////////////////////
//vibration func's//
///////////////////

function onChange(e) {
	vibration = e.value;
}

//end of vibration func's

function openSound() {
	AddHelper.removeAllListeners(listeners, addAllListeners);
	AddHelper.openSound($, setSound, sounds, shuffle, isEdit);
}

function setSound(args) {
	dispatcher.off("setSound", setSound);
	sounds = args.sounds;
	shuffle = args.shuffle;
	$.sound.setText(AddHelper.setSoundHelp($, sounds, shuffle));
}

$.pick.addEventListener("change", function(e) {
	duration = e.countDownDuration;
});

/**
 * a function that is triggerd when the user taps the save
 * button in the add alarm page.
 */
function onSave() {
	dispatcher.on("closeAdd", function onCloseAdd() {
		dispatcher.off("closeAdd", onCloseAdd);
		animateClose();
	});
	var eventStr = "saveAlarm";
	if (isEdit) {
		eventStr = "updateAlarm";
	}
	mainCont.trigger(eventStr, {
		label : label,
		snooze : snooze,
		duration : duration,
		vibration : vibration,
		sounds : sounds,
		shuffle : shuffle,
		isEdit : isEdit,
	});
}

