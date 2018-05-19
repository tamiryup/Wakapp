/**
 * an alarm manager object which is used to manage the list of alarms.
 */

var AlarmsMng = {

	timeAlarms : [],

	timers : [],

	locationAlarms : [],

	numOn : 0,

	/**
	 * an array of alarms which are listening for location event.
	 */
	locationsOn : [],

	distanceFilter : 50000,

	accuracy : Ti.Geolocation.ACCURACY_THREE_KILOMETERS,

	/**
	 * adds a new alarm to the sorted timeAlarms array.
	 *
	 * @param {Object} alarm - an alarm to add.
	 * @return - the index of the alarm in the array.
	 */
	addToTimeAlarms : function(alarm) {
		var hours = alarm.time.hours(),
		    minutes = alarm.time.minutes(),
		    temp;
		for (var i = 0; i < this.timeAlarms.length; i++) {
			temp = this.timeAlarms[i].time;
			if (temp.hours() == hours && temp.minutes() >= minutes) {
				this.timeAlarms.splice(i, 0, alarm);
				return i;
			}
			if (temp.hours() > hours) {
				this.timeAlarms.splice(i, 0, alarm);
				return i;
			}
		}
		this.timeAlarms.push(alarm);
		if (this.timeAlarms.length == 1) {
			return 0;
		} else {
			return this.timeAlarms.length - 1;
		}
	},

	/**
	 * adds a new timer to the sorted timers array.
	 *
	 * @param {Object} timer - a timer to add.
	 * @return - the index of the timer in the array.
	 */
	addToTimers : function(timer) {
		for (var i = 0; i < this.timers.length; i++) {
			var temp = this.timers[i].duration;
			if (temp > timer.duration) {
				this.timers.splice(i, 0, timer);
				return i;
			}
		}
		this.timers.push(timer);
		return this.timers.length - 1;
	},

	/**
	 * adds a new location to the locationAlarms array.
	 *
	 * @param {Object} locAlarm - a location to add.
	 * @return - the index of the location in the array.
	 */
	addToLocationAlarms : function(locAlarm) {
		this.locationAlarms.push(locAlarm);
		return this.locationAlarms.length - 1;
	},

	incNumOn : function() {
		this.numOn++;
	},

	decNumOn : function() {
		this.numOn--;
	},

	addToLocationsOn : function(locationAlarm) {
		for (var i = 0; i < this.locationsOn.length; i++) {
			if (locationAlarm.equals(this.locationsOn[i])) {
				return;
			}
		}
		this.locationsOn.push(locationAlarm);
		this.setDistanceFilter();
		this.setAccuracy();
	},

	removeFromLocationsOn : function(locationAlarm) {
		for (var i = 0; i < this.locationsOn.length; i++) {
			if (locationAlarm.equals(this.locationsOn[i])) {
				this.locationsOn.splice(i, 1);
				this.setDistanceFilter();
				this.setAccuracy();
				return;
			}
		}
	},

	/**
	 * goes over the "locationsOn" array and takes the minimal distance filter.
	 */
	setDistanceFilter : function() {
		if (this.locationsOn.length == 0)
			return;
		var min = this.locationsOn[0].distanceFilter;
		for (var i = 1; i < this.locationsOn.length; i++) {
			if (this.locationsOn[i].distanceFilter < min)
				min = this.locationsOn[i].distanceFilter;
		}
		this.distanceFilter = min;
		Ti.Geolocation.distanceFilter = this.distanceFilter;
	},

	setAccuracy : function() {
		if (this.locationsOn.length == 0)
			return;
		var min = this.locationsOn[0].accuracy;
		for (var i = 1; i < this.locationsOn.length; i++) {
			if (this.locationsOn[i].accuracy < min)
				min = this.locationsOn[i].accuracy;
		}
		this.accuracy = min;
		Ti.Geolocation.accuracy = this.accuracy;
	},

	/**
	 * returns a string which can be saved as a representation of the current "timeAlarms" array.
	 */
	stringifyTimeAlarms : function() {
		var arr = [];
		for (var i = 0; i < this.timeAlarms.length; i++) {
			var obj = this.timeAlarms[i].stringify();
			arr.push(obj);
		}
		return JSON.stringify(arr);
	},

	/**
	 * returns a string which can be saved as a representation of the current "timers" array.
	 */
	stringifyTimers : function() {
		var arr = [];
		for (var i = 0; i < this.timers.length; i++) {
			var obj = this.timers[i].stringify();
			arr.push(obj);
		}
		return JSON.stringify(arr);
	},

	stringifyLocations : function() {
		var arr = [];
		for (var i = 0; i < this.locationAlarms.length; i++) {
			var obj = this.locationAlarms[i].stringify();
			arr.push(obj);
		}
		return JSON.stringify(arr);
	},

	/**
	 * finds the number of alarms which are activated (on) in the timers
	 * and the timeAlarms lists.
	 */
	findNumOn : function() {
		var on = 0;
		for (alarm in this.timeAlarms) {
			if (alarm.on)
				on++;
		}
		for (timer in this.timers) {
			if (timer.on)
				on++;
		}
		this.numOn = on;
	},
};

module.exports = AlarmsMng;
