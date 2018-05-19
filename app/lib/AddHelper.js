/**
 * @author Tamir Ishay sharbat
 */

var dispatcher = require("dispatcher");
var ListenerObject = require("ListenerObject");

exports.initPlace = initPlace;
exports.animateOpen = animateOpen;
exports.animateClose = animateClose;
exports.openSound = openSound;
exports.setSoundHelp = setSoundHelp;
exports.removeAllListeners = removeAllListeners;
exports.addAllListeners = addAllListeners;

function initPlace($) {
	$.win.transform = Ti.UI.create2DMatrix().translate(0, Ti.Platform.displayCaps.platformHeight);
}

function animateClose($) {
	dispatcher.off("closeAdd", animateClose);
	var a = Ti.UI.createAnimation({
		transform : Ti.UI.create2DMatrix().translate(0, Ti.Platform.displayCaps.platformHeight),
		duration : 250,
	});
	$.win.animate(a, function() {
		$.win.close();
	});
}

function animateOpen($, Mainwin) {
	var a = Ti.UI.createAnimation({
		transform : Ti.UI.create2DMatrix().translate(0, 15),
		duration : 250,
	});
	$.win.animate(a, function() {
		if (Mainwin != null)
			Mainwin.initializeListeners();
	});
}

/**
 * opens the sound choosing window with paramters "sound" and "shuffle".
 *
 * @param {Object} $ - main contoller of the add window.
 * @param {Object} callback - a function to handle what the sound will give back.
 * @param {Object} sounds - an array of {TableViewRow, MediaItem} to send to the "Sound" controller.
 * @param {Object} shuffle - a boolean value indicating if shuffle is on or off.
 * @param isEdit - specifies if the sound is called not to make a new alarm but to edit an existing one.
 * @param isLocation - true if called while making a location alarm and false otherwise.
 */
function openSound($, callback, sounds, shuffle, isEdit, isLocation) {
	var s = Alloy.createController("Sound", {
		win : $.win,
		sounds : sounds,
		shuffle : shuffle,
		isEdit : isEdit,
		isLocation : isLocation,
	});
	$.win.openWindow(s.getView());
	dispatcher.on("setSound", callback);
}

function setSoundHelp($, sounds, shuffle) {
	if (shuffle && sounds.length >= 2) {
		return "Shuffle";
	} else if (sounds.length == 1) {
		return sounds[0].row.title;
	} else {
		return "None";
	}
}

function removeAllListeners(listeners, addAllListeners) {
	if (!( listeners instanceof Array))
		throw "listeners is not array";
	for (var i = 0; i < listeners.length; i++) {
		if (!(listeners[i] instanceof ListenerObject))
			throw "not all elements in listeners are ListenerObject";
		listeners[i].element.removeEventListener(listeners[i].event, listeners[i].func);
	}
	dispatcher.on("addListeners", addAllListeners);
}

function addAllListeners(listeners, addAllListeners) {
	dispatcher.off("addListeners", addAllListeners);
	if (!( listeners instanceof Array))
		throw "listeners is not array";
	for (var i = 0; i < listeners.length; i++) {
		if (!(listeners[i] instanceof ListenerObject))
			throw "not all elements in listeners are ListenerObject";
		listeners[i].element.addEventListener(listeners[i].event, listeners[i].func);
	}
}
