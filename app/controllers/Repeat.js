// Arguments passed into this controller can be accessed via the `$.args` object directly or:

var args = $.args;
var dispatcher = require("dispatcher");
var days = args.checked || [false, false, false, false, false, false, false];

$.table.addEventListener("click", check);

function addListeners() {
	dispatcher.trigger("addListeners");
}

function initialize() {
	rows = $.table.data[0].rows;
	for (var i = 0; i < days.length; i++) {
		if (days[i] == false) {
			break;
		}
		if (days[6]) {
			$.every.setHasCheck(true);
			//$.table.removeEventListener("click",check);
			return;
		}
	}
	for (var i = 0; i < days.length; i++) {
		if (days[i]) {
			rows[i].setHasCheck(true);
		}
	}
};

initialize();

function speicalCheck(e) {
	if (e.row.getHasCheck()) {
		e.row.setHasCheck(false);
		$.table.addEventListener("click", check);
		setAll(false);
	} else {
		e.row.setHasCheck(true);
		//$.table.removeEventListener("click", check);
		setAll(true);
		clearChecks();
	}
}

function setAll(flag) {
	for (var i = 0; i < days.length; i++) {
		days[i] = flag;
	}
}

function clearChecks() {
	var arr = $.table.data[0].rows;
	for (var i = 0; i < arr.length; i++) {
		arr[i].setHasCheck(false);
	}
}

function check(e) {
	if ($.every.getHasCheck()) {
		setAll(false);
		$.every.setHasCheck(false);
	}
	if (e.row.getHasCheck()) {
		e.row.setHasCheck(false);
		days[e.index] = false;
	} else {
		e.row.setHasCheck(true);
		days[e.index] = true;
	}
}

function end(e) {
	dispatcher.trigger("setRepeat", {
		days : days
	});
	args.win.closeWindow($.w);
}
