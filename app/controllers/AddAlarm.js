// Arguments passed into this controller can be accessed via the `$.args` object directly or:

var args = $.args;
var moment = require("alloy/moment");
var dispatcher = require("dispatcher");
var mainCont = args.mainCont;
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

$.save.addEventListener("click", onSave);

/**
 * initailizeing the variables.
 */
var label = args.label || "Alarm";
var repeat = args.repeat || [false, false, false, false, false, false, false];
var snooze = args.snooze || 5;
var sounds = args.sounds || [Alloy.Globals.defaultSound];
var vibration = Boolean(args.vibration);
var shuffle = Boolean(args.shuffle);

//end of initialization.

function initializeView() {
	setLabel({
		value : label,
	});
	setRepeat({
		days : repeat,
	});
	if ($.repeat.text == "") {
		$.repeat.text = "Never";
	}
	setSnooze({
		val : snooze,
	});
	$.sound.setText(AddHelper.setSoundHelp($, sounds, shuffle));
	$.s.value = vibration;
	if (args.isEdit) {
		$.pick.setValue(args.time.toDate());
	}
}

initializeView();

/**
 * initializes the "listeners" array.
 */
function initListeners() {
	arr = [];
	arr[0] = new ListenerObject($.labelRow, "click", openLabel);
	arr[1] = new ListenerObject($.repeatRow, "click", openRepeat);
	arr[2] = new ListenerObject($.soundRow, "click", openSound);
	arr[3] = new ListenerObject($.snoozeRow, "click", openSnooze);
	return arr;
}

/**
 * a function calling AddHelper's "addAllListeners" to add back event listeners.
 */
function addAllListeners() {
	AddHelper.addAllListeners(listeners, addAllListeners);
}

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
	dispatcher.off("setLabel", setLabel);
	label = e.value;
	$.label.text = label;
}

//end of label func's

//////////////////
//repeat func's//
////////////////
function openRepeat(e) {
	AddHelper.removeAllListeners(listeners, addAllListeners);
	var r = Alloy.createController("Repeat", {
		win : $.win,
		checked : repeat,
	});
	$.win.openWindow(r.getView());
	dispatcher.on("setRepeat", setRepeat);
}

/**
 * 1. sets the repeat string to appear.
 * 2. sets the repeat array.
 * @param {Object} e
 */
function setRepeat(e) {
	dispatcher.off("setRepeat", setRepeat);
	repeat = e.days;
	st = "";
	if (repeat[0])
		st += "Sun ";
	if (repeat[1])
		st += "Mon ";
	if (repeat[2])
		st += "Tue ";
	if (repeat[3])
		st += "Wed ";
	if (repeat[4])
		st += "Thu ";
	if (repeat[5])
		st += "Fri ";
	if (repeat[6])
		st += "Sat";
	if (st == "") {
		st = "Never";
	}
	if (st == "Sun Mon Tue Wed Thu Fri Sat") {
		st = "Every Day";
	}
	$.repeat.text = st.trim();
}

//end of repeat func's

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
	dispatcher.off("setSnooze", setSnooze);
	snooze = e.val;
	if (snooze == null) {
		$.snooze.text = "Off";
	} else {
		$.snooze.text = snooze + " min";
	}
}

//end of snooze func's

/////////////////////
//vibration func's//
///////////////////

function onChange(e) {
	vibration = e.value;
}

/////////////////
//sound func's//
///////////////
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

// end of sounds func's

/**
 * a function that is triggerd when the user taps the save
 * button in the add alarm page.
 *
 * HOW IT WORKS:
 * 1. takes the time from the time picker and create a time object with hours and minutes properties.
 * 2. bind dispatcher to "closeAdd" event (which will close this window when triggerd).
 * 3. triggers the "saveAlarm" or "updateAlarm" event which is binded to the mainController ("mainCont").
 */
function onSave() {
	var minutes = $.pick.getValue().getMinutes();
	var hours = $.pick.getValue().getHours();
	time = {
		minutes : minutes,
		hours : hours,
	};
	dispatcher.on("closeAdd", function onCloseAdd() {
		animateClose();
		dispatcher.off("closeAdd", onCloseAdd);
	});
	var eventStr = "saveAlarm";
	if (isEdit) {
		eventStr = "updateAlarm";
	}
	mainCont.trigger(eventStr, {
		snooze : snooze,
		label : label,
		repeat : repeat,
		time : time,
		vibration : vibration,
		sounds : sounds,
		shuffle : shuffle,
		isEdit : isEdit,
	});
}
