/**
 * @author Tamir Ishay sharbat
 */

function ListenerObject(element, event, func) {
	this.element = element;
	this.event = event;
	this.func = func;
}

module.exports = ListenerObject;
