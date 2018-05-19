/**
 *
 */

function pageControl(location) {

	this.location = location;

	// the map object
	this.map = createMap(this.location);

	this.marker = new google.maps.Marker({
		position : location,
		animation : google.maps.Animation.DROP,
	});

	this.markerPlaceId = null;

	// the autocomplete service object
	this.service = new google.maps.places.AutocompleteService();

	// the google places service
	this.placesService = new google.maps.places.PlacesService(this.map);

	this.predictions = undefined;

	this.place = null;

}

pageControl.prototype.dropMarker = function(location) {
	this.marker.setPosition(location);
	this.map.panTo(location);
	this.marker.setMap(null);
	this.marker = new google.maps.Marker({
		position : location,
		animation : google.maps.Animation.DROP,
	});
	this.marker.setMap(this.map);
};

pageControl.prototype.handlePred = function(predictions, status, res) {
	this.predictions = predictions;
	var arr = [];
	if (predictions != null) {
		predictions.forEach(function(pred) {
			var obj = {
				label : pred.description
			};
			if (pred.types.indexOf("transit_station") >= 0)
				obj.icon = "bus_icon.png";
			else
				obj.icon = "location_icon.png";
			arr.push(obj);
		});
	}
	res(arr);
};

pageControl.prototype.setSource = function(input, res) {
	var controller = this;
	var req = {
		input : input,
		location : new google.maps.LatLng(this.location.lat, this.location.lng),
		radius : 2000
	};
	this.service.getPlacePredictions(req, function(predictions, status) {
		controller.handlePred(predictions, status, res);
	});
};

pageControl.prototype.onSelect = function(event, ui) {
	var controller = this;
	var index = this.predictions.findIndex(function(pred) {
		if (pred.description == ui.item.value) {
			return true;
		}
		return false;
	});
	var request = {
		placeId : this.predictions[index].place_id
	};
	this.handleDetailsReq(request);
};

pageControl.prototype.handleDetailsReq = function(request) {
	var controller = this;
	this.placesService.getDetails(request, function(place, status) {
		$("#textField").blur();
		if (place.geometry.viewport) {
			controller.map.panToBounds(place.geometry.viewport);
			controller.map.fitBounds(place.geometry.viewport);
		} else {
			controller.map.setZoom(16);
		}
		controller.place = place;
		controller.markerPlaceId = place.place_id;
		controller.dropMarker(place.geometry.location);
	});
};

function createMap(center) {
	var map = new google.maps.Map(document.getElementById('map'), {
		center : center,
		zoom : 10,
		mapTypeId : 'roadmap',
		mapTypeControl : false,
		zoomControl : false,
		scaleControl : false,
		streetViewControl : false,
		rotateControl : false,
		fullscreenControl : false
	});
	var input = document.getElementById("inputContainer");
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
	return map;
}

function setAutocompOptions(controller) {
	var options = {
		source : function(req, res) {
			controller.setSource(req.term, res);
		},
		select : function(event, ui) {
			controller.onSelect(event, ui);
		}
	};
	return options;
}

function makeItem(ul, item) {
	var text = item.label;
	var li = $("<li>");
	var icon = $("<img>");
	icon.attr("src", item.icon);
	if (item.icon == "bus_icon.png") {
		icon.css({
			"width" : "19px",
			"height" : "19px",
			"margin" : "0px 7.35px 0px 8.65px",
		});
	}
	var div = makeDescriptionDiv(text);
	return li.append(icon).append($(div)).appendTo(ul);
}

function makeDescriptionDiv(text) {
	var indexOfComma = text.indexOf(","),
	    div;
	var dir = "ltr";
	if (checkRTL(input.val().charAt(0)))
		dir = "rtl";
	if (indexOfComma > 0) {
		var mainText = text.substr(0, indexOfComma);
		var subText = text.substr(indexOfComma + 1);
		div = $("<div class=description>" + mainText + "</div>");
		var span = $("<span class=greyText>" + subText + "</span>");
		div.append(span);
	} else {
		div = $("<div class=description>" + text + "</div>");
	}
	div=div[0];
	div.style.direction="rtl";
	Ti.API.info(div.style.direction);
	div=$(div);
	return div;
}

function initHandlers() {
	$("#deleteButton").on("touchend", function() {
		$("#deleteButton").css("visibility", "hidden");
		$("#textField").val("").focus();
		$("#textField").autocomplete("close");
	});
	$("#textField").on("input", function() {
		if ($("#textField").val() != "") {
			$("#deleteButton").css("visibility", "visible");
		} else {
			$("#deleteButton").css("visibility", "hidden");
		}
	});
}

function initialize(args) {
	$("script[src^='https://maps']").attr("src", "https://maps.googleapis.com/maps/api/js?" + //
	"key=AIzaSyA_bd3jzlHJbrRUEliC5d8GZ-ktytKmocs&libraries=places&language=" + args.language + "&callback=main");
	var controller = new pageControl(args.location);
	$("#textField").autocomplete(setAutocompOptions(controller));
	$("#textField").autocomplete("instance")._renderItem = makeItem;
	initHandlers();
	if (args.placeId) {
		controller.handleDetailsReq({
			placeId : args.placeId
		});
	}
	return controller;
}

function main() {
	var controller;
	jQuery.ui.autocomplete.prototype._resizeMenu = function() {
		var ul = this.menu.element;
		ul.outerWidth(this.element.outerWidth());
	};
	Ti.App.addEventListener("locationSent", function handle(args) {
		Ti.App.removeEventListener("locationSent", handle);
		controller = initialize(args);
	});
	Ti.App.fireEvent("getLocation");
	Ti.App.addEventListener("getVal", function handleVal() {
		Ti.App.removeEventListener("getVal", handleVal);
		var name = $("#textField").val();
		if (name == "") {
			name = controller.place.name;
		}
		var args = {
			location : {
				lat : controller.marker.getPosition().lat(),
				lng : controller.marker.getPosition().lng()
			},
			name : name,
			placeId : controller.markerPlaceId,
			types : controller.place.types,
			formattedAddress : controller.place.formatted_address,
		};
		Ti.App.fireEvent("returnVal", args);
	});
}

function checkRTL(s) {
	var ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' + '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
	    rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
	    rtlDirCheck = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']');

	return rtlDirCheck.test(s);
}

var input = $("#textField");
input.on("keyup", keypress);

function keypress(e) {
	var isRTL = checkRTL(input.val().charAt(0));
	var dir = "ltr";
	if (isRTL)
		dir = "rtl";
	if (input.val() != "" && e.charCode != 32)
		input[0].style.direction = dir;
}
