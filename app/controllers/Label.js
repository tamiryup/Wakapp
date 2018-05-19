// Arguments passed into this controller can be accessed via the `$.args` object directly or:

var args = $.args;
var dispatcher = require("dispatcher");
var win = args.win;
var charLimit = 40 || args.charLimit;
if (args.title) {
	$.w.title = args.title;
}

$.container.top = (Ti.Platform.displayCaps.platformHeight - 258) / 2;

function addListeners() {
	dispatcher.trigger("addListeners");
}

/**
 * focuses the field and sets value to the text given
 */
function focus(e) {
	$.field.focus();
	$.field.value = args.text;
}

/**
 * triggerd when the user presses done and sends the value in the text field back.
 *
 * HOW IT WORKS:
 * 1. gets the value from the text field if empty sets to "Alarm".
 * 2. triggers dispatcher event "setLabel" with value of the text field.
 * 3. closes the window.
 */
function end(e) {
	var val = $.field.getValue();
	if (val == "") {
		val = "Alarm";
	}
	dispatcher.trigger("setLabel", {
		value : val
	});
	args.element.setText(val);
	win.closeWindow($.w);
}

function limitChars(e) {
	e.source.value = e.source.value.slice(0, charLimit);
}
