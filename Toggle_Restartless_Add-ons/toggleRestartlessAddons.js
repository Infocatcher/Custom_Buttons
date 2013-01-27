// http://infocatcher.ucoz.net/js/cb/toggleRestartlessAddons.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_Restartless_Add-ons

// Toggle Restartless Add-ons button for Custom Buttons
// (code for "initialization" section)
// Also the code can be used from main window context (as Mouse Gestures code, for example)

// (c) Infocatcher 2013
// version 0.1.0b2 - 2013-01-27

const addonTypes = ["extension", "plugin"];
var showVersions = 0;
// 0 - don't show versions
// 1 - show after name: "Addon Name 1.2"
// 2 - show as "acceltext" (in place for hotkey text)

var mp = document.createElement("menupopup");
mp.setAttribute("onpopupshowing", "this.updateMenu();");
mp.setAttribute("oncommand", "this.toggleAddon(event.target);");
mp.setAttribute("onpopuphidden", "this.destroyMenu();");

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
			var label = addon.name;
			if(showVersions == 1)
				label += " " + addon.version;
			else if(showVersions == 2)
				mi.setAttribute("acceltext", addon.version);
			mi.setAttribute("label", label);
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

if(
	this instanceof XULElement // Custom Buttons
	&& typeof event == "object"
	&& !("type" in event) // Initialization
) {
	this.type = "menu";
	this.orient = "horizontal";
	this.appendChild(mp);

	this.onmouseover = function(e) {
		if(e.target != this)
			return;
		Array.some(
			this.parentNode.getElementsByTagName("*"),
			function(node) {
				if(
					node != this
					&& node.namespaceURI == xulns
					&& node.boxObject
					&& node.boxObject instanceof Components.interfaces.nsIMenuBoxObject
					&& node.open
				) {
					node.open = false;
					this.open = true;
					return true;
				}
				return false;
			},
			this
		);
	};
}
else { // Mouse gestures or something other...
	let e;
	if(typeof event == "object" && event instanceof Event && "screenX" in event) // FireGestures
		e = event;
	else if("mgGestureState" in window && "endEvent" in mgGestureState) // Mouse Gestures Redox
		e = mgGestureState.endEvent;
	else {
		let anchor = window.gBrowser && gBrowser.selectedBrowser
			|| document.documentElement;
		if("boxObject" in anchor) {
			let bo = anchor.boxObject;
			e = {
				screenX: bo.screenX,
				screenY: bo.screenY
			};
		}
	}
	if(!e || !("screenX" in e))
		throw new Error("[Toggle Restartless Add-ons]: Can't get event object");
	document.documentElement.appendChild(mp);
	mp.addEventListener("popuphidden", function destroy(e) {
		mp.removeEventListener(e.type, destroy, false);
		mp.destroyMenu();
		mp.parentNode.removeChild(mp);
	}, false);
	mp.openPopupAtScreen(e.screenX, e.screenY);
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