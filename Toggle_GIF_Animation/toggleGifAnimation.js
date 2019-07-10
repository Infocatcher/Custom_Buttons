// http://infocatcher.ucoz.net/js/cb/toggleGifAnimation.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57977
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_GIF_Animation

// Toggle GIF Animation button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2013
// version 0.2.0 - 2013-06-14

var gifAnimation = {
	// Note: we use original button's icon to indicate disabled state
	iconEnabled: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABlElEQVR4nI2SsUsCcRTHv+/yJGzS4kCRWqqpQ5xahYwER/8CGxoPh2rxP6itWXLQKQiXGiQh3JrUKYgIogbvQBwMTTB/r8XfeXde5BcOfvd+733e9/d+P2JmAEC5XN7MZrN3RKRiJiKCVzKfmZ81TctRt14Ro9uLxUwfhXLnWEkeSYipaVoUrXSYX/O77NTbic7MzO/HO654Kx1my7LYsiw2TbPLzAgAwPb1C9qHkYWO/Y8etgDXnjyClOItSj707fX38MeOOePMbIMCmHVwJtiA0RQA0EisgRRCZCPoKgYA6tYrontpLDXE6NkVWD+whxiLxaIkaaVSaT+TyTwB8+v75xrNeDweDTg3hBCuIu/A/EAugPyWdLAIkA4k5C8HzrgvwFvsB1twIIRwAZxyAprNJgaDAQA0CoXC/CFJB0IITKdTe+39b7fb6HQ6N7VaLW87MAyDUqkUCSGYZu39BggAk8nkMZFInOq6HioWi0NiZlSr1XUiyqmqukdEEQCrAEIAgo5aAeBrPB6PFEXpAfgEcP8LWVgYRnUM0zMAAAAASUVORK5CYII=",

	button: this,
	getUtils: function(win) {
		return win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindowUtils);
	},
	get mode() {
		var win = content;
		var utils = this.getUtils(win);
		return utils.imageAnimationMode;
	},
	set mode(mode) {
		var win = content;
		this.setMode(win, mode);
		this.updateState(mode);
	},
	toggle: function() {
		var ic = Components.interfaces.imgIContainer;
		this.mode = this.mode == ic.kNormalAnimMode
			? ic.kDontAnimMode
			: ic.kNormalAnimMode;
	},
	setMode: function(win, mode) {
		Array.prototype.forEach.call(win.frames, function(win) {
			this.setMode(win, mode);
		}, this);
		var utils = this.getUtils(win);
		try {
			utils.imageAnimationMode = mode;
		}
		catch(e) { // NS_ERROR_NOT_AVAILABLE
		}
	},
	updateState: function(mode) {
		if(mode === undefined)
			mode = this.mode;
		var btn = this.button;
		var icon = btn.ownerDocument.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon")
			|| btn.getElementsByClassName("toolbarbutton-icon")[0];
		icon.src = mode == Components.interfaces.imgIContainer.kDontAnimMode
			? btn.image
			: this.iconEnabled;
	},
	_updateStateTimer: 0,
	updateStateDelayed: function() {
		clearTimeout(this._updateStateTimer);
		this._updateStateTimer = setTimeout(function(_this) {
			_this.updateState();
		}, 20, this);
	}
};

this.toggleGifAnimation = function() {
	gifAnimation.toggle();
};
this.setAttribute("oncommand", "this.toggleGifAnimation();");

var progressListener = {
	onLocationChange: function(aWebProgress, aRequest, aLocation) {
		gifAnimation.updateStateDelayed();
	}
};
//progressListener.onStateChange =
//	progressListener.onProgressChange =
//	progressListener.onStatusChange =
//	progressListener.onSecurityChange = function dummy() {};

gifAnimation.updateStateDelayed();
gBrowser.addProgressListener(progressListener);
this.onDestroy = function() {
	gBrowser.removeProgressListener(progressListener);
};