// http://infocatcher.ucoz.net/js/cb/toggleFlash.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_Flash

// Toggle Flash button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012
// version 0.1.2 - 2012-09-15

var options = {
	pluginName: "Shockwave Flash", // Or name of any other plugin
	checkedStyle: false,
	disabledGrayscale: true,
	disabledOpacity: 0.65 // 0..1, use 0 to disable
};

var addonId;
this._pluginEnabled = false;
this.__defineGetter__("pluginEnabled", function() {
	return this._pluginEnabled;
});
this.__defineSetter__("pluginEnabled", function(enabled) {
	this._pluginEnabled = enabled;
	if(options.checkedStyle)
		this.checked = enabled;
	if(options.disabledGrayscale)
		this.style.filter = enabled ? "" : 'url("chrome://mozapps/skin/extensions/extensions.svg#greyscale")';
	if(options.disabledOpacity) {
		var icon = this.ownerDocument.getAnonymousElementByAttribute(this, "class", "toolbarbutton-icon");
		if(icon)
			icon.style.opacity = enabled ? "" : options.disabledOpacity;
	}
});
Components.utils.import("resource://gre/modules/AddonManager.jsm");

this.initAddonListener = function() {
	var addonListener = {
		button: this,
		onEnabled: function(addon) {
			if(addon.id == addonId)
				this.button.pluginEnabled = true;
		},
		onDisabled: function(addon) {
			if(addon.id == addonId)
				this.button.pluginEnabled = false;
		}
	};
	AddonManager.addAddonListener(addonListener);
	this.onDestroy = function() {
		AddonManager.removeAddonListener(addonListener);
	};
};

var btn = this;
AddonManager.getAddonsByTypes(["plugin"], function(addons) {
	addons.some(function(addon) {
		if(addon.name.indexOf(options.pluginName) == -1)
			return false;
		addonId = addon.id;
		btn.pluginEnabled = !addon.userDisabled;
		btn.initAddonListener();
		return true;
	});
});

this.onclick = function(e) {
	if(e.button != 0)
		return;
	if(!addonId) {
		alert(options.pluginName + " not installed!");
		return;
	}
	AddonManager.getAddonByID(addonId, function(addon) {
		addon.userDisabled = !addon.userDisabled;
	});
};