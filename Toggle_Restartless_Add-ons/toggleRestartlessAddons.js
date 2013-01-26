// http://infocatcher.ucoz.net/js/cb/toggleRestartlessAddons.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_Restartless_Add-ons

// Toggle Restartless Add-ons button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2013
// version 0.1.0b1 - 2013-01-27

const addonTypes = ["extension", "plugin"];

var mp = document.createElement("menupopup");
mp.setAttribute("onpopupshowing", "this.updateMenu();");
mp.setAttribute("oncommand", "this.toggleAddon(event.target);");
mp.setAttribute("onpopuphidden", "this.destroyMenu();");

this.type = "menu";
this.appendChild(mp);

var cleanupTimer = 0;
mp.updateMenu = function() {
	clearTimeout(cleanupTimer);
	getRestartlessAddons(addonTypes, function(addons) {
		var df = document.createDocumentFragment();
		var prevType;
		function key(addon) {
			return addonTypes.indexOf(addon.type) + "\n" + addon.name;
		}
		addons.sort(function(a, b) {
			var ka = key(a);
			var kb = key(b);
			return ka == kb ? 0 : ka < kb ? -1 : 1;
		}).forEach(function(addon) {
			var type = addon.type;
			if(prevType && type != prevType)
				df.appendChild(document.createElement("menuseparator"));
			prevType = type;
			var icon = addon.iconURL
				|| type == "plugin"    && "chrome://mozapps/skin/plugins/pluginGeneric-16.png"
				|| type == "extension" && "chrome://mozapps/skin/extensions/extensionGeneric-16.png"
				|| "";
			var mi = document.createElement("menuitem");
			mi.className = "menuitem-iconic";
			mi.setAttribute("label", addon.name);
			mi.setAttribute("image", icon);
			var desc = addon.description;
			desc && mi.setAttribute("tooltiptext", desc);
			setDisabled(mi, addon.userDisabled);
			mi._cbAddon = addon;
			df.appendChild(mi);
		});
		mp.textContent = "";
		mp.appendChild(df);
	});
};
mp.toggleAddon = function(mi) {
	if(!("_cbAddon" in mi))
		return;
	var addon = mi._cbAddon;
	var dis = !addon.userDisabled;
	addon.userDisabled = dis;
	setDisabled(mi, dis);
};
mp.destroyMenu = function() {
	clearTimeout(cleanupTimer);
	cleanupTimer = setTimeout(function() {
		mp.textContent = "";
	}, 5000);
};
function setDisabled(mi, disabled) {
	mi.style.opacity = disabled ? "0.5" : "";
}

function getRestartlessAddons(addonTypes, callback, context) {
	Components.utils.import("resource://gre/modules/AddonManager.jsm");
	AddonManager.getAddonsByTypes(addonTypes, function(addons) {
		var restartless = addons.filter(function(addon) {
			var ops = addon.operationsRequiringRestart;
			return !addon.appDisabled
				&& !(ops & AddonManager.OP_NEEDS_RESTART_ENABLE || ops & AddonManager.OP_NEEDS_RESTART_DISABLE);
		});
		callback.call(context, restartless);
	});
}