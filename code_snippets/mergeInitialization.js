// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/mergeInitialization.js
// Example for safely use only one button for initialization of many "buttons" without UI

var _destructors = [];
function destructor() {
	var args = arguments;
	_destructors.forEach(function(destructor) {
		try {
			destructor.apply(this, args);
		}
		catch(e) {
			Components.utils.reportError(e);
		}
	}, this);
}
if("defineProperty" in Object) { // Firefox 4+
	Object.defineProperty(this, "onDestroy", {
		get: function() {
			return _destructors.length ? destructor : undefined;
		},
		set: function(f) {
			_destructors.push(f);
		},
		enumerable: true,
		configurable: true
	});
}
else {
	this.__defineGetter__("onDestroy", function() {
		return _destructors.length ? destructor : undefined;
	});
	this.__defineSetter__("onDestroy", function(f) {
		_destructors.push(f);
	});
}

// Usage example:
(function() {
	// Some code #1
	LOG("Initialize button #1");
	function destructor(reason) {
		LOG("onDestroy #1 " + reason);
	}
	this.onDestroy = destructor;
}).apply(this, arguments);

(function() {
	// Some code #2
	LOG("Initialize button #2");
	function destructor(reason) {
		LOG("onDestroy #2 " + reason);
	}
	this.onDestroy = destructor;
}).apply(this, arguments);

(function() {
	// Code of any button without UI here
}).apply(this, arguments);

// ...