/**
 *
 */

var BasicAlarm = require("BasicAlarm");
var LocationHelper = require("LocationHelper");
var AlarmsMng = require("AlarmsMng");
var StorageHelper = require("StorageHelper");

function LocationAlarm(name, locationName, location, radius, placeId, sounds, formattedAddress, locationTypes) {
	this.on = false;
	this.name = name;
	this.locationName = locationName;
	this.location = location;
	this.radius = radius;
	this.placeId = placeId;
	this.sounds = sounds;
	this.formattedAddress = formattedAddress.toLowerCase();
	this.typeName = this.formattedAddress.substring(0, this.formattedAddress.indexOf(","));
	this.locationTypes = locationTypes;
	this.type = setType(locationTypes);
	this.shuffle = false;
	this.vibration = true;
	this.snooze = null;
	this.distanceFilter = null;
	this.accuracy = null;
	this.viewBlock = undefined;
	this.middleLine = undefined;
	BasicAlarm.call(this, sounds);
}

//inherits from BasicAlarm
LocationAlarm.prototype = Object.create(BasicAlarm.prototype);

LocationAlarm.prototype.turnOn = function() {
	this.on = true;
	var that = this;
	if (Ti.Geolocation.locationServicesEnabled) {
		this.setGeoSettings();
		this.startLocationListener();
	} else {
		this.turnOff();
	}
};

LocationAlarm.prototype.setGeoSettings = function() {
	Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	Ti.Geolocation.pauseLocationUpdateAutomatically = true;
	Ti.API.info("tyep: "+this.type);
	if (this.type != "point") {
		this.accuracy = Ti.Geolocation.ACCURACY_KILOMETER;
		this.distanceFilter = 500;
	} else {
		this.accuracy = Ti.Geolocation.ACCURACY_HUNDRED_METERS;
		this.distanceFilter = 0;
	}
	AlarmsMng.addToLocationsOn(this);
};

LocationAlarm.prototype.startLocationListener = function() {
	var that = this;
	Ti.Geolocation.addEventListener("location", function onLocation(e) {
		Ti.API.info("location event fired");
		if (that.on == false) {
			Ti.Geolocation.removeEventListener("location", onLocation);
			return;
		}
		if (e.error) {
			Ti.API.warn("error in location event");
		} else {
			if (that.checkDistance(e.coords)) {
				Ti.Geolocation.removeEventListener("location", onLocation);
				that.removeLocationListener();
			}
		}
	});
};

LocationAlarm.prototype.checkDistance = function(currentLocation) {
	var isInRadius = this.checkDistancePoint(currentLocation);
	if (isInRadius) {
		return true;
	} else if (this.type != "point" && isInRadius == false) {
		return this.checkDistanceFromArea(currentLocation);
	}
	return false;
};

LocationAlarm.prototype.checkDistancePoint = function(currentLocation) {
	var distance = LocationHelper.distance(currentLocation.latitude, currentLocation.longitude, //
	this.location.lat, this.location.lng);
	if (distance < this.radius) {
		this.setRing(0);
		return true;
	}
	if (this.type == "point") {
		//this.setAccuracyAndFilter();
	}
	return false;
};

LocationAlarm.prototype.setAccuracyAndFilter = function(distance) {
	var accuracy;
	var distanceFromRad = distance - this.radius;
	this.setDistanceFilter(Math.max(50, distanceFromRad / 2));
	if (distanceFromRad > 6)
		accuracy = Ti.Geolocation.ACCURACY_THREE_KILOMETERS;
	else if (distanceFromRad > 2)
		accuracy = Ti.Geolocation.ACCURACY_KILOMETER;
	else if (distanceFromRad > 0.2)
		accuracy = Ti.Geolocation.ACCURACY_HUNDRED_METERS;
	else
		accuracy = Ti.Geolocation.ACCURACY_BEST;
	if (this.accuracy != accuracy)
		this.setAccuracy(accuracy);
};

LocationAlarm.prototype.checkDistanceFromArea = function(currentLocation) {
	var inRadius = false;
	var that = this;
	var bearing = LocationHelper.bearing(currentLocation.latitude, //
	currentLocation.longitude, this.location.lat, this.location.lng);

	var dest = LocationHelper.calcDestination(currentLocation.latitude, //
	currentLocation.longitude, this.radius + 0.2, bearing);

	Ti.Geolocation.reverseGeocoder(dest.lat, dest.lon, function(result) {
		inRadius = that.handleGeocoding(result);
	});
	return inRadius;
};

LocationAlarm.prototype.handleGeocoding = function(address) {
	if (address.success == 1) {
		Ti.API.info(address);
		for (var i = 0; i < address.places.length; i++) {
			if (this.checkLocality(address.places[i])) {
				this.setRing(0);
				return true;
			}
		}
	} else {
		Ti.API.warn("problem geocoding");
	}
	return false;
};

LocationAlarm.prototype.checkLocality = function(place) {
	Ti.API.info(this.typeName);
	if (this.type == "country" && place.country.length >= 2 && this.formattedAddress.indexOf(place.country.toLowerCase()) >= 0) {
		return true;
	}
	if (this.type == "state" && place.state != null && place.state.length >= 2 && //
	this.formattedAddress.indexOf(place.state.toLowerCase()) >= 0) {
		return true;
	}
	if (this.type == "city" && place.city.length >= 2 && this.formattedAddress.indexOf(place.city.toLowerCase()) >= 0) {
		return true;
	}
	if (this.type != "point" && place.address.toLowerCase().indexOf(this.typeName) >= 0) {
		return true;
	}
	return false;
};

LocationAlarm.prototype.turnOff = function(shouldAnimate) {
	this.on = false;
	this.removeLocationListener();
	this.turnOffHelper(shouldAnimate);
};

LocationAlarm.prototype.removeLocationListener = function() {
	AlarmsMng.removeFromLocationsOn(this);
	this.distanceFilter = null;
	this.accuracy = null;
};

LocationAlarm.prototype.equals = function(other) {
	if (!other instanceof LocationAlarm) {
		return false;
	}
	if (this.on == other.on && this.name == other.name && this.radius == other.radius//
	&& this.location.lat == other.location.lat && this.location.lng == this.location.lng) {
		return true;
	}
	return false;
};

LocationAlarm.prototype.setDistanceFilter = function(distanceFilter) {
	this.distanceFilter = distanceFilter;
	AlarmsMng.setDistanceFilter();
};

LocationAlarm.prototype.setAccuracy = function(accuracy) {
	this.accuracy = accuracy;
	AlarmsMng.setAccuracy();
};

LocationAlarm.prototype.stringify = function() {
	var obj = {};
	for (var key in this) {
		if (key == "viewBlock" || key == "middleLine" || key == "locationListener")
			continue;
		obj[key] = this[key];
		if (key == this.timeout)
			break;
	}
	obj.sounds = StorageHelper.stringifySounds(this.sounds);
	obj.avalSounds = StorageHelper.stringifySounds(this.avalSounds);
	return obj;
};

function setType(locationTypes) {
	if (locationTypes.indexOf("country") >= 0) {
		return "country";
	} else if (locationTypes.indexOf("administrative_area_level_1") >= 0) {
		return "state";
	} else if (locationTypes.indexOf("political") >= 0) {
		return "city";
	} else {
		return "point";
	}
}

module.exports = LocationAlarm;
