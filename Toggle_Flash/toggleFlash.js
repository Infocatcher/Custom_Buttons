// http://infocatcher.ucoz.net/js/cb/toggleFlash.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_Flash

// Toggle Flash button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012
// version 0.1.1 - 2012-09-13

const addonName = "Shockwave Flash"; // Or name of any other plugin
var addonId;

Components.utils.import("resource://gre/modules/AddonManager.jsm");

this.initAddonListener = function() {
	var addonListener = {
		button: this,
		onEnabled: function(addon) {
			if(addon.id == addonId)
				this.button.checked = true;
		},
		onDisabled: function(addon) {
			if(addon.id == addonId)
				this.button.checked = false;
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
		if(addon.name.indexOf(addonName) == -1)
			return false;
		addonId = addon.id;
		btn.checked = !addon.userDisabled;
		btn.initAddonListener();
		return true;
	});
});

this.onclick = function(e) {
	if(e.button != 0)
		return;
	if(!addonId) {
		alert(addonName + " not installed!");
		return;
	}
	AddonManager.getAddonByID(addonId, function(addon) {
		addon.userDisabled = !addon.userDisabled;
	});
};