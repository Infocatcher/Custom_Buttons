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
btn._cb_disabled = true;

Components.utils.import("resource://gre/modules/Services.jsm");
var appName = Services.appinfo.name;

var imgConnecting, imgLoading;
if(appName == "SeaMonkey")
	imgConnecting = imgLoading = "chrome://communicator/skin/icons/loading.gif";
else {
	imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
	imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
}

var image = btn.image;
var tip = btn.tooltipText;
btn.image = imgConnecting;
btn.tooltipText = "Open about:addons…";

var tab;
var ws = Services.wm.getEnumerator("navigator:browser");
windowsLoop:
while(ws.hasMoreElements()) {
	let w = ws.getNext();
	let tabs = w.gBrowser.tabs;
	for(let i = 0, l = tabs.length; i < l; ++i) {
		let t = tabs[i];
		if(
			!t.closing
			&& t.linkedBrowser
			&& t.linkedBrowser.currentURI.spec == "about:addons"
		) {
			tab = t;
			break windowsLoop;
		}
	}
}

if(!tab) {
	tab = gBrowser.addTab("about:addons");
	tab.collapsed = true;
	tab.closing = true; // See "visibleTabs" getter in chrome://browser/content/tabbrowser.xml
}

var browser = tab.linkedBrowser;
if(browser.webProgress.isLoadingDocument)
	browser.addEventListener("load", processAddonsTab, true);
else
	processAddonsTab();

function processAddonsTab(e) {
	var doc;
	if(e) {
		doc = e.target;
		if(doc.location != "about:addons")
			return;
		browser.removeEventListener(e.type, processAddonsTab, true);
	}
	else {
		doc = browser.contentDocument;
	}

	btn.image = imgLoading;
	btn.tooltipText = doc.getElementById("updates-progress").getAttribute("value");

	var updEnabledPref = "extensions.update.enabled";
	var updEnabled = cbu.getPrefs(updEnabledPref);
	if(!updEnabled)
		cbu.setPrefs(updEnabledPref, true);

	doc.getElementById("cmd_findAllUpdates").doCommand();

	var wait = setInterval(function() {
		if(!doc.defaultView || doc.defaultView.closed) {
			stopWait();
			notify("Tab with add-ons manager was closed!");
			return;
		}
		var inProgress = doc.getElementById("updates-progress");
		if(!inProgress.hidden)
			return;
		var found = doc.getElementById("updates-manualUpdatesFound-btn");
		var notFound = doc.getElementById("updates-noneFound");
		if(found.hidden && notFound.hidden) // Too early?
			return;

		stopWait();
		tab.closing = false;

		if(!updEnabled)
			cbu.setPrefs(updEnabledPref, false);

		if(!notFound.hidden) {
			if(tab.collapsed)
				gBrowser.removeTab(tab);
			notify(notFound.getAttribute("value"));
			return;
		}
		tab.collapsed = false;
		doc.getElementById("categories").selectedItem = doc.getElementById("category-availableUpdates");
		var tabWin = tab.ownerDocument.defaultView;
		tabWin.gBrowser.selectedTab = tab;
		setTimeout(function() {
			tabWin.focus();
			doc.defaultView.focus();
			doc.getElementById("addon-list").focus();
		}, 0);
	}, 50);
	function stopWait() {
		clearInterval(wait);
		btn.image = image;
		btn.tooltipText = tip;
		setTimeout(function() {
			delete btn._cb_disabled;
		}, 500);
	}
	function notify(msg) {
		Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService)
			.showAlertNotification(
				"chrome://mozapps/skin/extensions/extensionGeneric.png",
				"Custom Buttons",
				msg, false, "", null
			);
	}
}