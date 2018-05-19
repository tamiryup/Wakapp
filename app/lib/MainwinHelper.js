/**
 *
 */
var ViewHelper = require("ViewHelper");
var moment = require("alloy/moment");
var dispatcher = require("dispatcher");
var AlarmsMng = require("AlarmsMng");

module.exports = MainwinObj;

/**
 * @param save - the Mainwin's save function.
 */
function MainwinObj($, alarmControllers, array, middleLines, doneEdit, trash, save, addWin, //
openAdd, engageEditMode, exitEditMode, trashFunc) {
	this.$ = $;
	this.alarmControllers = alarmControllers;
	this.array = array;
	this.middleLines = middleLines;
	this.doneEdit = doneEdit;
	this.trash = trash;
	this.save = save;
	this.addWin = addWin;
	this.openAddFunc = openAdd;
	this.engageEditModeFunc = engageEditMode;
	this.exitEditModeFunc = exitEditMode;
	this.trashFunc = trashFunc;
	this.initializeListeners();
}

/**
 * sets event listeners to the buttons of the view.
 *
 * @param openAdd - a function to be called when the user presses the plus button.
 * @param engageEditMode - a function to be called when the user presses the edit button. (starts edit mode).
 * @param exitEditMode - a function to be called when the user presses the done button while in edit mode.
 * @param trashFunc - a function to be called when the user presses the trash button in edit mode.
 */
MainwinObj.prototype.initializeListeners = function() {
	this.$.plus.addEventListener("click", this.openAddFunc);
	this.$.edit.addEventListener("click", this.engageEditModeFunc);
	this.doneEdit.addEventListener("click", this.exitEditModeFunc);
	this.trash.addEventListener("click", this.trashFunc);
};

/**
 * opens a window that will enable the user to add a new alarm.
 *
 * HOW IT WORKS:
 * 1. creates a new controller of kind "this.addWin" and opens it.
 * 2. adds an event listener "saveAlarm" to the mainController (i.e. timeAlarms) and binds it to the save function.
 * 3. adds an event listener "cancel" to the mainController. when it is triggerd it will unbind the "saveAlarm"
 *    listener and the "cancel" listener (so we won't have listeners for no reason and the problems they cause).
 */
MainwinObj.prototype.openAdd = function() {
	this.removeAllListeners();
	var $ = this.$;
	var save = this.save;
	var add = Alloy.createController(this.addWin, {
		mainCont : $,
		Mainwin : this,
	});
	add.getView().open();
	$.on("saveAlarm", save);
	$.on("cancel", function onCancel() {
		$.off("saveAlarm", save);
		$.off("cancel", onCancel);
	});
};

/**
 * a general function that is called to help the save function in the mainController.
 *
 * @param alarm - an Alarm object to add to the view and the "alarmControllers" array.
 * @param index - where to add the alarm to the array.
 * @param isEdit - true if the alarm we got was just updated (and already exist).
 *                 false if it is a new alarm
 */
MainwinObj.prototype.saveHelper = function(alarm, index, isEdit) {
	var c = Alloy.createController("AlarmBlock", {
		timeAlarm : alarm,
		array : this.array,
	});
	alarm.viewBlock = c;
	this.alarmControllers.splice(index, 0, c);
	ViewHelper.reRenderView(index, this.alarmControllers, this.$);
	ViewHelper.organizeMiddleLines(index, this.alarmControllers, this.array, this.middleLines, this.$);
	if (isEdit == false) {
		dispatcher.trigger("closeAdd");
	}
};

/**
 * engages edit mode for the MainwinObj.
 *
 * @param exitEditMode - function to exit editMode with.
 * @param update - function used to update alarm if needed.
 *
 * HOW IT WORKS:
 * 1. animates buttons to doneEdit and trash.
 * 2. triggers edit for every AlarmBlock in alarmControllers.
 * 3. binds "exitEditMode" and "updateAlarm" events to the dispatcher.
 */
MainwinObj.prototype.engageEditMode = function(exitEditMode, update) {
	this.animateButtons(this.doneEdit, this.trash);
	for (var i = 0; i < this.alarmControllers.length; i++) {
		this.alarmControllers[i].trigger("edit");
	}
	dispatcher.on("exitEditMode", exitEditMode);
	dispatcher.on("updateAlarm", update);
};

/**
 * exitEditMode is called when we want to quit edit mode.
 *
 * @param time - how much time should the animation take.
 *
 * HOW IT WORKS:
 * 1. unbind all dispatcher event and animate buttons back to usuall.
 * 2. triggers "doneEdit" of every AlarmBlock in alarmControllers.
 */
MainwinObj.prototype.exitEditMode = function(time) {
	if (time == undefined) {
		time = 200;
	}
	// unbinds "updateAlarm" and "exitEditMode" events.
	dispatcher.off();
	this.animateButtons(this.$.edit, this.$.plus);
	for (var i = 0; i < this.alarmControllers.length; i++) {
		this.alarmControllers[i].trigger("doneEdit", time);
	}
};

/**
 * deleteSelected is called when we wish to delete selected items (marked=true) from the view.
 */
MainwinObj.prototype.deleteSelected = function(animationDuration) {
	var animationCount = 0;
	var t = this;
	this.trash.removeEventListener("click", this.trashFunc);
	this.$.on("addAnimationCount", function() {
		animationCount = t.countAnimations(posArr, animationCount);
	});
	var posArr = ViewHelper.deleteFromView(this.alarmControllers, this.$, animationDuration);
	ViewHelper.deleteMiddleLines(this.alarmControllers, this.array, this.middleLines, this.$, animationDuration);
};

/**
 * counts the animations and if all alarms have finished animating
 *  cleans the controllers and adds the trash listener back.
 */
MainwinObj.prototype.countAnimations = function(posArr, animationCount) {
	var t = this;
	animationCount++;
	if (animationCount == this.alarmControllers.length) {
		setTimeout(function() {
			t.cleanControllers(posArr);
			t.trash.addEventListener("click", t.trashFunc);
		}, 5);
		this.$.off();
	} else {
		//wait
	}
	return animationCount;
};

/**
 * deletes all marked AlarmBlocks from the alarmControllers array and if not marked sets their position.
 */
MainwinObj.prototype.cleanControllers = function(posArr) {
	var index = 0;
	for (var i = 0; i < this.alarmControllers.length; i++) {
		if (this.alarmControllers[i].getMarked()) {
			this.alarmControllers.splice(i, 1);
			if (this.array[i].on)
				this.array[i].turnOff(false);
			this.array.splice(i, 1);
			i--;
		} else {
			this.alarmControllers[i].container.setTop(posArr[index].top);
			this.alarmControllers[i].container.setLeft(posArr[index].left);
			index++;
		}
	}
};

/**
 * triggerd when an alarm is updated.
 * deletes it from the view and makes a new alarm with the updated properties.
 * exits edit mode at last.
 */
MainwinObj.prototype.update = function(args) {
	this.alarmControllers[args.index].setMarked(true);
	var posArr = ViewHelper.deleteFromView(this.alarmControllers, this.$, 0);
	ViewHelper.deleteMiddleLines(this.alarmControllers, this.array, this.middleLines, this.$, 0);
	this.cleanControllers(posArr);
	var index = this.save(args);
	this.animateButtons(this.$.edit, this.$.plus);
	for (var i = 0; i < this.alarmControllers.length; i++) {
		if (i != index) {
			this.alarmControllers[i].trigger("doneEdit", {
				time : 0
			});
		}
	}
	dispatcher.trigger("closeAdd");
	dispatcher.off();
};

/**
 * animates the buttons.
 *
 * @param butLeft - the one to be the left nav button.
 * @param butRight - the one to be the right nav button.
 */
MainwinObj.prototype.animateButtons = function(butLeft, butRight) {
	this.$.win.setLeftNavButton(butLeft, {
		animated : true
	});
	this.$.win.setRightNavButton(butRight, {
		animated : true
	});
};

MainwinObj.prototype.removeAllListeners = function() {
	this.$.plus.removeEventListener("click", this.openAddFunc);
	this.$.edit.removeEventListener("click", this.engageEditModeFunc);
	this.doneEdit.removeEventListener("click", this.exitEditModeFunc);
	this.trash.removeEventListener("click", this.trashFunc);
};
