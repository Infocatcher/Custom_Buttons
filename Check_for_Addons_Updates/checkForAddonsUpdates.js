// http://infocatcher.ucoz.net/js/cb/checkForAddonsUpdates.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Check_for_Addons_Updates

// Check for Addons Updates button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012
// version 0.1.2 - 2012-10-04

// Button just open hidden tab with about:addons and trigger built-in "Check for Updates" function.
// And show tab, if found updates.

var btn = this;
if("_cb_disabled" in btn)
	return;
var image = btn.image;
var tip = btn.tooltipText;
btn.image = "chrome://browser/skin/tabbrowser/connecting.png";
btn.tooltipText = "Open about:addons…";
btn._cb_disabled = true;
var tab = gBrowser.addTab("about:addons");
tab.collapsed = true;
tab.closing = true; // See "visibleTabs" getter in chrome://browser/content/tabbrowser.xml

var browser = tab.linkedBrowser;
browser.addEventListener("load", function load(e) {
	var doc = e.target;
	if(doc.location != "about:addons")
		return;
	browser.removeEventListener(e.type, load, true);

	btn.image = "chrome://browser/skin/tabbrowser/loading.png";
	btn.tooltipText = doc.getElementById("updates-progress").getAttribute("value");

	var updEnabledPref = "extensions.update.enabled";
	var updEnabled = cbu.getPrefs(updEnabledPref);
	if(!updEnabled)
		cbu.setPrefs(updEnabledPref, true);

	doc.getElementById("cmd_findAllUpdates").doCommand();

	var wait = setInterval(function() {
		var inProgress = doc.getElementById("updates-progress");
		if(!inProgress.hidden)
			return;
		var found = doc.getElementById("updates-manualUpdatesFound-btn");
		var notFound = doc.getElementById("updates-noneFound");
		if(found.hidden && notFound.hidden) // Too early?
			return;

		clearInterval(wait);
		btn.image = image;
		btn.tooltipText = tip;
		setTimeout(function() {
			delete btn._cb_disabled;
		}, 500);
		tab.closing = false;

		if(!updEnabled)
			cbu.setPrefs(updEnabledPref, false);

		if(!notFound.hidden) {
			//tab.collapsed = false;
			gBrowser.removeTab(tab);
			Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService)
				.showAlertNotification(
					"chrome://mozapps/skin/extensions/extensionGeneric.png",
					"Custom Buttons",
					notFound.getAttribute("value"),
					false, "", null
				);
			return;
		}
		tab.collapsed = false;
		doc.getElementById("categories").selectedItem = doc.getElementById("category-availableUpdates");
		gBrowser.selectedTab = tab;
		setTimeout(function() {
			doc.defaultView.focus();
			doc.getElementById("addon-list").focus();
		}, 0);
	}, 50);
}, true);