// http://infocatcher.ucoz.net/js/cb/toggleRestartlessAddons.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_Restartless_Add-ons

// Toggle Restartless Add-ons button for Custom Buttons
// (code for "initialization" section)
// Also the code can be used from main window context (as Mouse Gestures code, for example)

// (c) Infocatcher 2013
// version 0.1.0pre - 2013-01-30

const addonTypes = ["extension", "plugin"];
var showVersions = 0;
// 0 - don't show versions
// 1 - show after name: "Addon Name 1.2"
// 2 - show as "acceltext" (in place for hotkey text)

var mp = document.createElement("menupopup");
mp.setAttribute("onpopupshowing", "this.updateMenu();");
mp.setAttribute("oncommand", "this.handleEvent(event);");
mp.setAttribute("onmousedown", "if(event.button == 0) this.handleEvent(event);");
mp.setAttribute("onclick", "if(event.button > 0) this.handleEvent(event);");
mp.setAttribute("oncontextmenu", "return false;");
mp.setAttribute("onpopuphidden", "this.destroyMenu();");

var cleanupTimer = 0;
mp.updateMenu = function() {
	clearTimeout(cleanupTimer);
	addStyle();
	getRestartlessAddons(addonTypes, function(addons) {
		var df = document.createDocumentFragment();
		var prevType;
		function key(addon) {
			return addonTypes.indexOf(addon.type) + "\n" + addon.name.toLowerCase();
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
			var icon = addon.iconURL || addon.icon64URL
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
mp.handleEvent = function(e) {
	var mi = e.target;
	if(!("_cbAddon" in mi))
		return;
	if(e.type == "mousedown") {
		mi.setAttribute("closemenu", e.shiftKey ? "none" : "auto");
		return;
	}
	var addon = mi._cbAddon;
	var hasModifier = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
	if(e.type == "command" && (!hasModifier || e.shiftKey)) {
		var dis = !addon.userDisabled;
		addon.userDisabled = dis;
		setDisabled(mi, dis);
	}
	else if(e.type == "command" && hasModifier || e.type == "click" && e.button == 1) {
		openAddonPage(addon);
		closeMenus(mi);
	}
	else if(e.type == "click" && e.button == 2) {
		if(openAddonOptions(addon))
			closeMenus(mi);
	}
};
mp.destroyMenu = function() {
	removeStyle();
	clearTimeout(cleanupTimer);
	cleanupTimer = setTimeout(function() {
		mp.textContent = "";
	}, 5000);
};
function setDisabled(mi, disabled) {
	if(disabled)
		mi.classList.add("toggleRestartlessAddons-disabled");
	else
		mi.classList.remove("toggleRestartlessAddons-disabled");
}

if(
	this instanceof XULElement // Custom Buttons
	&& typeof event == "object"
	&& !("type" in event) && typeof _phase == "string" && _phase == "init" // Initialization
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
	else if(this == window && "mgGestureState" in window && "endEvent" in mgGestureState) // Mouse Gestures Redox
		e = mgGestureState.endEvent;
	else {
		let anchor = this instanceof XULElement && this
			|| window.gBrowser && gBrowser.selectedBrowser
			|| document.documentElement;
		if("boxObject" in anchor) {
			let bo = anchor.boxObject;
			e = {
				screenX: bo.screenX,
				screenY: bo.screenY
			};
			if(this instanceof XULElement)
				e.screenY += bo.height;
		}
	}
	if(!e || !("screenX" in e))
		throw new Error("[Toggle Restartless Add-ons]: Can't get event object");
	document.documentElement.appendChild(mp);
	mp.addEventListener("popuphidden", function destroy(e) {
		mp.removeEventListener(e.type, destroy, false);
		setTimeout(function() {
			mp.destroyMenu();
			mp.parentNode.removeChild(mp);
		}, 0);
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
function openAddonOptions(addon) {
	// Based on code from chrome://mozapps/content/extensions/extensions.js
	// Firefox 21.0a1 (2013-01-27)
	Components.utils.import("resource://gre/modules/Services.jsm");
	var optionsURL = addon.optionsURL;
	if(!addon.isActive || !optionsURL)
		return false;
	if(addon.type == "plugin") // No options for now!
		return false;
	if(addon.optionsType == AddonManager.OPTIONS_TYPE_INLINE)
		openAddonPage(addon, true);
	else if(addon.optionsType == AddonManager.OPTIONS_TYPE_TAB && "switchToTabHavingURI" in window)
		switchToTabHavingURI(optionsURL, true);
	else {
		var windows = Services.wm.getEnumerator(null);
		while(windows.hasMoreElements()) {
			var win = windows.getNext();
			if(win.document.documentURI == optionsURL) {
				win.focus();
				return true;
			}
		}
		// Note: original code checks browser.preferences.instantApply and may open modal windows
		window.openDialog(optionsURL, "", "chrome,titlebar,toolbar,centerscreen,dialog=no");
	}
	return true;
}
function openAddonPage(addon, scrollToPreferences) {
	var openAddonsMgr = window.BrowserOpenAddonsMgr // Firefox
		|| window.openAddonsMgr // Thunderbird
		|| window.toEM; // SeaMonkey
	scrollToPreferences = scrollToPreferences && parseFloat(Services.appinfo.platformVersion) >= 12
			? "/preferences"
			: "";
	openAddonsMgr("addons://detail/" + encodeURIComponent(addon.id) + scrollToPreferences);
}

function addStyle() {
	if(addStyle.hasOwnProperty("_style"))
		return;
	var style = '\
		.toggleRestartlessAddons-disabled > .menu-iconic-left {\n\
			opacity: 0.4;\n\
		}\n\
		.toggleRestartlessAddons-disabled > .menu-iconic-text,\n\
		.toggleRestartlessAddons-disabled > .menu-accel-container {\n\
			opacity: 0.5;\n\
		}';
	addStyle._style = document.insertBefore(
		document.createProcessingInstruction(
			"xml-stylesheet",
			'href="' + "data:text/css,"
				+ encodeURIComponent(style) + '" type="text/css"'
		),
		document.documentElement
	);
}
function removeStyle() {
	if(!addStyle.hasOwnProperty("_style"))
		return;
	var s = addStyle._style;
	s.parentNode.removeChild(s);
	delete addStyle._style;
}