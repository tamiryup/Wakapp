/**
 * EVENTS:
 * 1. edit - the edit event is fired on the controller
 *    when the page goes into editing mode.
 *
 * 2. doneEdit - the done edit event is fired on the controller
 *    when the page exits editing mode.
 */

var args = $.args;

var Alarm = require("Alarm");
var Timer = require("Timer");
var LocationAlarm = require("LocationAlarm");

var AlarmsMng = require("AlarmsMng");
var moment = require("alloy/moment");
var dispatcher = require("dispatcher");
var Helper = require("Helper");

var alarm = args.timeAlarm;
var array = args.array;
var marked = false;
var addWin;

if ( alarm instanceof Alarm) {
	addWin = "AddAlarm";
} else if ( alarm instanceof Timer) {
	addWin = "AddTimer";
} else if ( alarm instanceof LocationAlarm) {
	addWin = "AddLocation";
}

//listeners
$.on("edit", startEdit);
$.on("doneEdit", function(args) {
	endEdit(Number(args.time));
});
$.container.addEventListener("click", toggleOn);

/////////////////////////////
//mark getters and setters//
///////////////////////////

exports.setMarked = function(flag) {
	marked = flag;
};

exports.getMarked = function() {
	return marked;
};

//end of getters, setters.

//////////////////////////
//iniatilizes the block//
////////////////////////

/**
 * initializes the block's view.
 *
 * HOW IT WORKS:
 * 1. set the text for the label.
 * 2. set the main text using "setTimeText" function.
 * 3. if the alarm var is a time alarm set the repeat text.
 */
function initializeBlock() {
	if (alarm.label) {
		$.label.text = alarm.label;
	}
	setTimeText();

	if ( alarm instanceof Alarm) {
		setRepeat();
	}

	$.arrow.transform = Ti.UI.create2DMatrix().rotate(45);
}

/**
 * sets the text of the "time" label which is the main text of the block.
 */
function setTimeText() {
	$.label.font = {
		fontFamily : "helvetica",
		fontSize : (15 / 160) * Alloy.Globals.height,
	};
	if ( alarm instanceof Alarm) {
		$.time.text = alarm.time.format("H:mm");
		$.time.font = {
			fontFamily : "HelveticaNeue-Thin",
			fontSize : (50 / 160) * Alloy.Globals.height,
		};
	} else if ( alarm instanceof Timer) {
		setTimerText();
	} else if ( alarm instanceof LocationAlarm) {
		setLocationText();
	}
}

function setTimerText() {
	$.time.font = {
		fontFamily : "HelveticaNeue-Thin",
		fontSize : (37 / 160) * Alloy.Globals.height
	};
	$.time.bottom = (45 / 160) * Alloy.Globals.height;
	$.time.text = moment.duration(alarm.duration).hours() + "h\n  " + moment.duration(alarm.duration).minutes() + "min";
}

/**
 * sets the text (font and size) of the "time" label for alarms of instance "LocatinoAlarm".
 */
function setLocationText() {
	$.locationIcon.setVisible(true);
	var len = Helper.findLongestWord(alarm.name);
	$.time.height = "65%";
	$.time.left = $.locationIcon.width;
	$.time.textAlign = Titanium.UI.TEXT_ALIGNMENT_CENTER;
	var font = {
		fontFamily : "HelveticaNeue-Thin",
		fontSize : Math.min(45, (Alloy.Globals.width * 1.55 / len + 1)) - 2,
	};
	font.fontSize = Math.min(font.fontSize, ((Ti.Platform.displayCaps.platformWidth) / (alarm.name.length)) * 1.9);
	if (font.fontSize < 40) {
		font.fontFamily = "HelveticaNeue-Light";
	}
	$.time.font = font;
	$.time.width = Alloy.Globals.width - $.time.left - 10;
	$.time.text = alarm.name;
	//$.time.borderColor="black";
}

/**
 * sets the text for the repeat label.
 */
function setRepeat(e) {
	var repeat = alarm.repeat;
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
	if (st == "Sun Mon Tue Wed Thu Fri Sat") {
		st = "Every Day";
	}
	//st = st.replace(/,\s*$/, "");
	$.repeat.text = st.trim();
}

//end of initializing for the block.

///////////////////////
//defines animations//
/////////////////////
var backgroundAnimation = Ti.UI.createAnimation({
	backgroundColor : "white",
	duration : 200,
	transition : Ti.UI.iPhone.AnimationStyle.NONE,
});

var textAnimation = Ti.UI.createAnimation({
	color : "black",
	duration : 200,
	transition : Ti.UI.iPhone.AnimationStyle.NONE,
});

var middleAnimation = Ti.UI.createAnimation({
	duration : 200,
	transition : Ti.UI.iPhone.AnimationStyle.NONE,
});

var locationIconAnimation = Ti.UI.createAnimation({
	duration : 200,
	transition : Ti.UI.iPhone.AnimationStyle.NONE,
});

initializeBlock();
//new block

function animateLocationIcon(turnOn) {
	if ( alarm instanceof LocationAlarm) {
		locationIconAnimation.visible = turnOn;
		if (turnOn) {
			locationIconAnimation.zIndex = 1;
		} else {
			locationIconAnimation.zIndex = -1;
		}
		$.blackLocationIcon.animate(locationIconAnimation);
	}
}

/**
 * decides what to do with the middle lines (turn on or off).
 *
 * @param turnOn - boolean to signal whether should turn on or off.
 */
function animateMiddleLine(turnOn) {
	if (turnOn) {
		middleAnimation.backgroundColor = "white";
	} else if (!turnOn) {
		middleAnimation.backgroundColor = Alloy.Globals.backgroundColor;
	}
	alarm.middleLine.container.animate(middleAnimation);
}

/**
 * turns the view into on mode using the given animations.
 */
function turnViewOn() {
	backgroundAnimation.backgroundColor = "white";
	textAnimation.color = "black";
	modeChangeHelper();
}

/**
 * turns the view into off mode using the given animations.
 */
function turnViewOff() {
	backgroundAnimation.backgroundColor = Alloy.Globals.backgroundColor;
	textAnimation.color = Alloy.Globals.fontColor;
	modeChangeHelper();
}

function modeChangeHelper() {
	$.container.animate(backgroundAnimation);
	$.time.animate(textAnimation);
	$.label.animate(textAnimation);
	$.repeat.animate(textAnimation);
	animateLocationIcon(alarm.on);
	animateMiddleLine(alarm.on);
}

/**
 * triggerd when the user presses the alarm. toggles its state accordingly.
 */
function toggleOn(e) {
	if (alarm.on) {
		alarm.turnOff(true);
	} else {
		alarm.turnOn();
		turnViewOn();
	}
}

/**
 * function that is fired when the delete circle is clicked.
 */
function onCircle() {
	if (marked == false) {
		//checks the circle, sets marked to true.
		turnCircleOn();
	} else {
		//unchcecks the circle, sets marked to false.
		turnCircleOff();
	}
}

/**
 * turns the delete circle on (checks it).
 */
function turnCircleOn() {
	$.circle.setBackgroundColor("rgb(255,0,0)");
	$.circle.setBorderWidth(0);
	$.cross.setImage("check.png");
	marked = true;
}

/**
 * turns the delete circle off (unchecks it).
 */
function turnCircleOff() {
	$.circle.setBackgroundColor("transparent");
	$.circle.setBorderWidth(0.5);
	$.cross.setImage("");
	marked = false;
}

/**
 * blurs all the text in the alarm block.
 *
 * @param {Integer} opacity - the opacity to blur to.
 * @param {Double} time - how much time should the animation be.
 */
function blurText(opacity, time) {
	if (time == 0) {
		$.label.setOpacity(opacity);
		$.time.setOpacity(opacity);
		$.repeat.setOpacity(opacity);
		return;
	}
	animation = Ti.UI.createAnimation({
		opacity : opacity,
		duration : time,
	});
	$.label.animate(animation);
	$.time.animate(animation);
	$.repeat.animate(animation);
}

/**
 * makes the editing aids (such as the arrow and circle) visible
 * and animates them in.
 *
 * @param {Boolean} visible - should the aids be visible or not.
 * @param {Double} time - how much time should the animation be.
 */
function editingAids(visible, time) {
	opacity = Number(visible);
	animation = Ti.UI.createAnimation({
		opacity : opacity,
		duration : time,
	});
	if (time != 0) {
		$.circle.animate(animation);
		$.arrow.animate(animation);
	}
	$.circle.setVisible(visible);
	$.circleContainer.setVisible(visible);
	$.arrow.setVisible(visible);
	setTimeout(function() {
		$.arrow.setOpacity(opacity);
		$.circle.setOpacity(opacity);
	}, time);
}

/**
 * a function to start editing.
 *
 * HOW IT WORKS:
 * 1. calls "editingAids" and "blurText".
 * 2. changes the function called when the container is clicked to "openEditAlarm".
 */
function startEdit() {
	editingAids(true, 200);
	blurText(0.4, 200);
	$.container.removeEventListener("click", toggleOn);
	$.container.addEventListener("click", openEditAlarm);
}

/**
 * function to end editing.
 *
 * HOW IT WORKS:
 * 1. calls "editingAids" and "blurText".
 * 2. turns circle of (after "blurText" and "editingAids" are done animating meaning the circle won't be shown to the user)
 *    using "turnCircleOff".
 * 3. changes the function called when the container is clicked to "toggleOn".
 */
function endEdit(time) {
	if (time == undefined) {
		time = 200;
	}
	blurText(1, time);
	editingAids(false, time);
	setTimeout(turnCircleOff, time);
	$.container.removeEventListener("click", openEditAlarm);
	$.container.addEventListener("click", toggleOn);
}

/**
 * opens the alarm's editing window.
 *
 * HOW IT WORKS:
 * 1. binds "updateAlarm" event to $.
 * 2. binds "cancel" event to $.
 * 3. calls one of the following (depending on the alarm's type): editTimeAlarm, editTimer, editLocationAlarm.
 */
function openEditAlarm() {
	$.on("updateAlarm", update);
	$.on("cancel", function onCancel() {
		$.off("updateAlarm", update);
		$.off("cancel", onCancel);
	});
	if ( alarm instanceof Alarm) {
		editTimeAlarm();
	} else if ( alarm instanceof Timer) {
		editTimer();
	} else if ( alarm instanceof LocationAlarm) {
		editLocationAlarm();
	}
}

/**
 * opens the edit window for time alarms.
 */
function editTimeAlarm() {
	var editWin = Alloy.createController(addWin, {
		label : alarm.label,
		repeat : alarm.repeat,
		snooze : alarm.snooze,
		time : alarm.time,
		vibration : alarm.vibration,
		sounds : alarm.sounds,
		shuffle : alarm.shuffle,
		isEdit : true,
		mainCont : $,
	});
	editWin.w.title = "Edit Alarm";
	editWin.getView().open();
}

/**
 * opens the edit window for timers.
 */
function editTimer() {
	var editWin = Alloy.createController(addWin, {
		label : alarm.label,
		snooze : alarm.snooze,
		duration : alarm.duration,
		vibration : alarm.vibration,
		sounds : alarm.sounds,
		shuffle : alarm.shuffle,
		isEdit : true,
		mainCont : $,
	});
	editWin.w.title = "Edit Timer";
	editWin.getView().open();
}

/**
 * opens the edit window for location alarms.
 */
function editLocationAlarm() {
	var editWin = Alloy.createController(addWin, {
		name : alarm.name,
		locationName : alarm.locationName,
		location : alarm.location,
		radius : alarm.radius,
		placeId : alarm.placeId,
		formattedAddress : alarm.formattedAddress,
		locationTypes : alarm.locationTypes,
		sounds : alarm.sounds,
		isEdit : true,
		mainCont : $,
	});
	editWin.w.title = "Edit Location";
	editWin.getView().open();
}

/**
 * triggerd when the alarm block should be updated.
 * starts the updating process.
 *
 * HOW IT WORKS:
 * 1. unbinds "updateAlarm" event from $.
 * 2. finds the alarm's index in the array.
 * 3. triggers dispatcher event "updateAlarm".
 */
function update(args) {
	$.off("updateAlarm", update);
	args.index = array.findIndex(null, alarm);
	dispatcher.trigger("updateAlarm", args);
	// the "updateAlarm" event is binded to the dispatcher
	// in the "engageEditMode" function (which is in the mainWinHelper).
	// when triggerd calls the update function in the mainWinHelper.
}

function instantTurnOn() {
	alarm.turnOn();
	setAnimationsDuration(0);
	turnViewOn();
	setAnimationsDuration(200);
}

function instantViewTurnOff() {
	setAnimationsDuration(0);
	turnViewOff();
	setAnimationsDuration(200);
}

function setAnimationsDuration(duration) {
	backgroundAnimation.duration = duration;
	textAnimation.duration = duration;
	middleAnimation.duration = duration;
	locationIconAnimation.duration = duration;
}

exports.turnOn = function() {
	alarm.turnOn();
	turnViewOn();
};

exports.turnViewOff = turnViewOff;
exports.instantViewTurnOff = instantViewTurnOff;
exports.instantTurnOn = instantTurnOn;
