/**
 * a view helper for adding and removing alarms.
 */

exports.reRenderView = reRenderView;
exports.organizeMiddleLines = organizeMiddleLines;
exports.deleteFromView = deleteFromView;
exports.deleteMiddleLines = deleteMiddleLines;

/**
 * re-render's the view after an alarm have been added by the user.
 *
 * @param {Object} index - the index of the alarm in the list.
 * @param alarmControllers - an array of "AlarmBlock" controllers.
 * @param mainCont - the main controller of the view we are changing.
 */
function reRenderView(index, alarmControllers, mainCont) {
	createFirst(index, alarmControllers, mainCont);
	index++;
	reRenderOther(index, alarmControllers);
};

/**
 * creates the first element (the element that the user just made).
 *
 * @param {Integer} index - the index of it in the list.
 * @param alarmControllers - an array of "AlarmBlock" controllers.
 * @param mainCont - the main controller of the view we are changing.
 */
function createFirst(index, alarmControllers, mainCont) {
	var top;
	if (index == 0) {
		top = 0;
		alarmControllers[index].container.setLeft(0);
	} else if (index % 2 == 1) {
		top = alarmControllers[index - 1].container.getTop();
		alarmControllers[index].container.setLeft(Alloy.Globals.width + 0.5);
	} else {
		top = alarmControllers[index - 1].container.getTop() + Alloy.Globals.height;
		alarmControllers[index].container.setLeft(0);
	}
	alarmControllers[index].container.setTop(top);
	mainCont.scroll.add(alarmControllers[index].getView());
}

/**
 * re-render's the other elements (the elements after the first element that
 * 	the user just added). and moves them accordingly.
 *
 * @param {Object} index - the index from which you should start updating.
 * @param alarmControllers - an array of "AlarmBlock" controllers.
 */
function reRenderOther(index, alarmControllers) {
	while (index < alarmControllers.length) {
		if (index % 2 == 1) {
			alarmControllers[index].updateViews({
				"#container" : {
					left : Alloy.Globals.width + 0.5,
					top : alarmControllers[index - 1].container.getTop()
				}
			});
		} else {
			alarmControllers[index].updateViews({
				"#container" : {
					left : 0,
					top : alarmControllers[index - 1].container.getTop() + Alloy.Globals.height
				}
			});
		}
		index++;
	}
}

/**
 * a function which organizes the middle lines in the view
 * and sets the middleLine proprety of the alarms array.
 *
 * @param {int} index - the index of the first element which needs update.
 * @param {array} alarmControllers - an array of "AlarmBlock" controllers
 * @param {array} alarms - an array of "Alarm" objects
 * @param {array} middleLines - an array of "middleLine" controllers.
 * @param {controller} mainCont - the main controller of the view we are changing.
 */
function organizeMiddleLines(index, alarmControllers, alarms, middleLines, mainCont) {
	var m;
	var len = alarms.length;
	if (len % 2 == 1) {
		m = Alloy.createController("middleLine");
		m.container.top = alarmControllers[len - 1].container.getTop();
		middleLines.push(m);
		mainCont.scroll.add(m.getView());
	}
	while (index < len) {
		var middleIndex = parseInt(index / 2);
		alarms[index].middleLine = middleLines[middleIndex];
		if (alarms[index].on == false) {
			alarms[index].middleLine.container.setBackgroundColor(Alloy.Globals.backgroundColor);
		}
		index++;
	}
}

/**
 * when in editing mode and trash icon is clicked.
 * this function removes the selected alarms's views from the scroll object in the menu.
 * and also sets the new position of the not removed alarm views.
 *
 * @param {array} alarmControllers - an array of "AlarmBlock" controllers.
 * @param {controller} mainCont - the controller of the main view.
 */
function deleteFromView(alarmControllers, mainCont, animationDuration) {
	var deleted = 0;
	var topLeftPos = [];
	for (var i = 0; i < alarmControllers.length; i++) {
		if (alarmControllers[i].getMarked()) {
			deleteHelp(i, alarmControllers, mainCont, animationDuration);
			topLeftPos[i] = null;
			deleted++;
		} else {
			topLeftPos[i] = {
				top : alarmControllers[i - deleted].container.getTop(),
				left : alarmControllers[i - deleted].container.getLeft(),
			};
		}
	}
	setPosAfterDelete(alarmControllers, topLeftPos, animationDuration, mainCont);
	return (topLeftPos.filter(function(x) {
			return x != null;
		}));
}

/**
 * deleteHelp recieves an index in the "alarmControllers" array,
 * and deletes it from the view using an animation.
 *
 * @param {int} i - index in the array
 * @param {array} alarmControllers - an array of "AlarmBlock" controllers.
 * @param {controller} mainCont - the controller of the main view.
 */
function deleteHelp(i, alarmControllers, mainCont, animationDuration) {
	var x = alarmControllers[i].getView();
	var a = Ti.UI.createAnimation({
		opacity : 0,
		duration : animationDuration,
	});
	alarmControllers[i].container.animate(a, function() {
		mainCont.trigger("addAnimationCount");
		mainCont.scroll.remove(x);
	});
}

/**
 * animates the views to their new positions after the delete.
 *
 * @param {array} alarmControllers - an array of "AlarmBlock" controllers.
 * @param {array} positions - a position array to know where and what to animate.
 */
function setPosAfterDelete(alarmControllers, positions, animationDuration, mainCont) {
	for (var i = 0; i < alarmControllers.length; i++) {
		if (alarmControllers[i].getMarked() == false) {
			var index = i;
			var temp = alarmControllers[i];
			var a = Ti.UI.createAnimation({
				top : positions[index].top,
				left : positions[index].left,
				duration : animationDuration,
			});
			alarmControllers[i].container.animate(a, function() {
				mainCont.trigger("addAnimationCount");
			});
		}
	}
}

/**
 * a function that deletes and resets the middle lines.
 * both the view's and the "Alarm" objects.
 *
 * @param {array} alarmControllers - an array of "AlarmBlock" controllers.
 * @param {array} alarms - an "Alarm" object array.
 * @param {array} middleLines - an array of the middleLines currently in use.
 * @param {controller} mainCont - the controller of the main view.
 */
function deleteMiddleLines(alarmControllers, alarms, middleLines, mainCont, animationDuration) {
	var len = getLen(alarmControllers);
	for (var i = middleLines.length - 1; i >= len; i--) {
		var a = Ti.UI.createAnimation({
			opacity : 0,
			duration : animationDuration,
		});
		var line = middleLines.pop();
		line.container.animate(a, function() {
			mainCont.scroll.remove(line.getView());
		});
	}
	resetMiddleLines(alarmControllers, alarms, middleLines);
}

/**
 * helps the "deleteMiddleLines" function set the alarms array's objects
 * middleLine property.
 *
 * @param {array} alarmControllers - an array of "AlarmBlock" controllers.
 * @param {array} alarms - an array of "server side" alarm object.
 * @param {array} middleLines - an array of the middleLines currently in use.
 */
function resetMiddleLines(alarmControllers, alarms, middleLines) {
	index = 0;
	for (var i = 0; i < alarms.length; i++) {
		if (alarmControllers[i].getMarked() == false) {
			alarms[i].middleLine = middleLines[parseInt(index)];
			if(alarms[i].on==false){
				alarms[i].middleLine.container.setBackgroundColor(Alloy.Globals.backgroundColor);
			}
			index += 1 / 2;
		}
	}
}

/**
 * returns the number of alarms that will stay after the delete.
 *
 * @param {array} alarmControllers - an array of "AlarmBlock" controllers.
 */
function getLen(alarmControllers) {
	var len = 0;
	for (var i = 0; i < alarmControllers.length; i++) {
		if (alarmControllers[i].getMarked() == false) {
			len++;
		}
	}
	if (len % 2 == 0) {
		len = len / 2;
	} else {
		len = parseInt(len / 2) + 1;
	}
	return len;
}
