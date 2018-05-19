// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var dispatcher = require("dispatcher");
var win = args.win;

function addListeners() {
	dispatcher.trigger("addListeners");
}

function makeRow(i) {
	var r = Ti.UI.createPickerRow({
		id : String(i),
	});
	var l = Ti.UI.createLabel({
		text : String(i),
		font : {
			fontSize : "30",
		},
		textAlign : 'center',
		height : 'auto',
	});
	r.add(l);
	return r;
}

function setPickerRows() {
	var col1 = Ti.UI.createPickerColumn({
		width : 75,
	});
	for (var i = 0; i <= 25; i++) {
		col1.addRow(makeRow(i));
	}
	var col2 = Ti.UI.createPickerColumn({
		width : 20,
	});
	col2.addRow(makeRow("."));
	var col3 = Ti.UI.createPickerColumn({
		width : 75,
	});
	for (var i = 0; i < 10; i++) {
		col3.addRow(makeRow(i));
	}
	$.pick.setColumns([col1, col2, col3]);
	if (args.radius && args.radius>=1) {
		$.pick.setSelectedRow(0, parseInt(args.radius));
	} else {
		$.pick.setSelectedRow(2, parseInt((args.radius - Math.floor(args.radius)) * 10));
	}
}

setPickerRows();

function end() {
	var afterDecimal = parseInt($.pick.getSelectedRow(2).id);
	var beforeDecimal = parseInt($.pick.getSelectedRow(0).id);
	var rad = beforeDecimal + (afterDecimal / 10);
	dispatcher.trigger("setRadius", {
		radius : rad,
	});
	win.closeWindow($.w);
}
