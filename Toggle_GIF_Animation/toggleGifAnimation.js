// http://infocatcher.ucoz.net/js/cb/toggleGifAnimation.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57977
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_GIF_Animation

// Toggle GIF Animation button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2013
// version 0.2.0 - 2013-06-14

// Tip: use image.animation_mode = none to disable animation by default
// http://kb.mozillazine.org/Firefox_:_Tips_:_Animated_Images#Image_animation_preference

var gifAnimation = this.gifAnimation = {
	// Note: we use original button's icon to indicate disabled state
	iconEnabled: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABlElEQVR4nI2SsUsCcRTHv+/yJGzS4kCRWqqpQ5xahYwER/8CGxoPh2rxP6itWXLQKQiXGiQh3JrUKYgIogbvQBwMTTB/r8XfeXde5BcOfvd+733e9/d+P2JmAEC5XN7MZrN3RKRiJiKCVzKfmZ81TctRt14Ro9uLxUwfhXLnWEkeSYipaVoUrXSYX/O77NTbic7MzO/HO654Kx1my7LYsiw2TbPLzAgAwPb1C9qHkYWO/Y8etgDXnjyClOItSj707fX38MeOOePMbIMCmHVwJtiA0RQA0EisgRRCZCPoKgYA6tYrontpLDXE6NkVWD+whxiLxaIkaaVSaT+TyTwB8+v75xrNeDweDTg3hBCuIu/A/EAugPyWdLAIkA4k5C8HzrgvwFvsB1twIIRwAZxyAprNJgaDAQA0CoXC/CFJB0IITKdTe+39b7fb6HQ6N7VaLW87MAyDUqkUCSGYZu39BggAk8nkMZFInOq6HioWi0NiZlSr1XUiyqmqukdEEQCrAEIAgo5aAeBrPB6PFEXpAfgEcP8LWVgYRnUM0zMAAAAASUVORK5CYII=",

	remote: window.gMultiProcessBrowser,
	button: this,
	getUtils: function(win) {
		return win.windowUtils || win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindowUtils);
	},
	get mode() {
		var utils = this.getUtils(content);
		return utils.imageAnimationMode;
	},
	set mode(mode) {
		this.setMode(content, mode);
		this.updateState(mode);
	},
	toggle: function() {
		if(this.remote) {
			this.toggleRemote();
			return;
		}
		var ic = Components.interfaces.imgIContainer;
		this.mode = this.mode == ic.kNormalAnimMode
			? ic.kDontAnimMode
			: ic.kNormalAnimMode;
	},
	toggleRemote: function() {
		this.loadFrameScript(function() {
			var ic = Components.interfaces.imgIContainer;
			var mode = content.windowUtils.imageAnimationMode == ic.kNormalAnimMode ? ic.kDontAnimMode : ic.kNormalAnimMode;
			(function setMode(win) {
				try {
					win.windowUtils.imageAnimationMode = mode;
				}
				catch(e) { // NS_ERROR_NOT_AVAILABLE
				}
				Array.prototype.forEach.call(win.frames, setMode);
			})(content);
			sendAsyncMessage("CB:ToggleGIFAnimation:mode", mode);
		});
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
		if(mode === undefined && this.remote) {
			this.updateStateRemote();
			return;
		}
		if(mode === undefined)
			mode = this.mode;
		var btn = this.button;
		var icon = btn.icon
			|| btn.ownerDocument.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
		icon.src = mode == Components.interfaces.imgIContainer.kDontAnimMode
			? btn.image
			: this.iconEnabled;
	},
	updateStateRemote: function() {
		this.loadFrameScript(function() {
			try {
				var mode = content.windowUtils.imageAnimationMode;
			}
			catch(e) { // NS_ERROR_NOT_AVAILABLE
			}
			sendAsyncMessage("CB:ToggleGIFAnimation:mode", mode);
		});
	},
	loadFrameScript: function(fn) {
		var code = "(" + fn + ")();";
		var data = "data:application/javascript," + encodeURIComponent(code);
		var mm = gBrowser.selectedBrowser.messageManager;
		var _this = this;
		mm.addMessageListener("CB:ToggleGIFAnimation:mode", function receiveMessage(msg) {
			mm.removeMessageListener("CB:ToggleGIFAnimation:mode", receiveMessage);
			if(msg.data != null)
				_this.updateState(msg.data);
		});
		mm.loadFrameScript(data, false);
	},
	_updateStateTimer: 0,
	updateStateDelayed: function() {
		if(this._updateStateTimer)
			return;
		this._updateStateTimer = setTimeout(function(_this) {
			_this._updateStateTimer = 0;
			_this.updateState();
		}, 20, this);
	}
};

this.setAttribute("oncommand", "this.gifAnimation.toggle();");

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