// Arguments passed into this controller can be accessed via the `$.args` object directly or:

var args = $.args;
var dispatcher=require("dispatcher");

function addListeners() {
	dispatcher.trigger("addListeners");
}

function setPickerRows() {
	var col = Ti.UI.createPickerColumn();
	for (var i = 1; i <= 10; i++) {
		var r = Ti.UI.createPickerRow({
			id : String(i),
		});
		var l = Ti.UI.createLabel({
			text : String(i),
			font : {
				fontSize : "35",
			},
			width : 100,
			textAlign : 'center',
			height : 'auto',
		});
		r.add(l);
		col.addRow(r);
	}
	$.pick.setColumns([col]);
	if (args.snooze) {
		$.pick.setSelectedRow(0, args.snooze - 1);
	}else{
		$.pick.setSelectedRow(0, 4);
		$.none.setHasCheck(true);
	}
}

setPickerRows();

function check(e) {
	if (e.row.getHasCheck()) {
		e.row.setHasCheck(false);
	} else {
		e.row.setHasCheck(true);
	}
}

function end(e) {
	var snooze;
	if (!$.none.getHasCheck()) {
		snooze = $.pick.getSelectedRow(0).id;
		snooze = Number(snooze);
	}
	dispatcher.trigger("setSnooze", {
		val : snooze
	});
	args.win.closeWindow($.w);
}
