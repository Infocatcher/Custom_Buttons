// http://infocatcher.ucoz.net/js/cb/checkForAddonsUpdates.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57958
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Check_for_Addons_Updates

// Check for Addons Updates button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012-2014
// version 0.1.4.1 - 2014-02-18

// Button just open hidden tab with about:addons and trigger built-in "Check for Updates" function.
// And show tab, if found updates.

var btn = this;
if("_cb_disabled" in btn)
	return;
btn._cb_disabled = true;

if(!("Services" in window))
	Components.utils.import("resource://gre/modules/Services.jsm");
var appName = Services.appinfo.name;

var imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
var imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
if(appName == "SeaMonkey")
	imgConnecting = imgLoading = "chrome://communicator/skin/icons/loading.gif";
else if(appName == "Thunderbird") {
	imgConnecting = "chrome://messenger/skin/icons/connecting.png";
	imgLoading = "chrome://messenger/skin/icons/loading.png";
}

var image = btn.image;
var tip = btn.tooltipText;
btn.image = imgConnecting;
btn.tooltipText = "Open about:addons…";

var tab;
var tbTabInfo, tbTab;
var tabmail = document.getElementById("tabmail");

if(tabmail) { // Thunderbird
	let addonsWin;
	let receivePong = function(subject, topic, data) {
		addonsWin = subject;
	};
	Services.obs.addObserver(receivePong, "EM-pong", false);
	Services.obs.notifyObservers(null, "EM-ping", "");
	Services.obs.removeObserver(receivePong, "EM-pong");
	if(addonsWin) {
		tbTabInfo = tabmail.getBrowserForDocument(addonsWin);
		tbTab = tab = tbTabInfo.tabNode;
		processAddonsTab(addonsWin);
	}
	else {
		Services.obs.addObserver(function observer(subject, topic, data) {
			Services.obs.removeObserver(observer, topic);
			if(subject.document.readyState == "complete")
				processAddonsTab(subject);
			else {
				subject.addEventListener("load", function onLoad(e) {
					subject.removeEventListener(e.type, onLoad, false);
					processAddonsTab(subject);
				}, false);
			}
		}, "EM-loaded", false);
		// See openAddonsMgr() -> openContentTab()
		tbTabInfo = tabmail.openTab("contentTab", {
			contentPage: "about:addons",
			clickHandler: "specialTabs.siteClickHandler(event, /addons\.mozilla\.org/);",
			background: true
		});
		tbTab = tab = tbTabInfo.tabNode;
		tbTab.collapsed = true;
		// Note: dontSelectHiddenTab() not implemented
	}
}
else {
	var isPending = false;
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
		window.addEventListener("TabSelect", dontSelectHiddenTab, false);
	}
	else if(
		tab.getAttribute("pending") == "true" // Gecko >= 9.0
		|| tab.linkedBrowser.contentDocument.readyState == "uninitialized"
		// || tab.linkedBrowser.__SS_restoreState == 1
	)
		isPending = true;

	var browser = tab.linkedBrowser;
	if(isPending || browser.webProgress.isLoadingDocument) {
		browser.addEventListener("load", processAddonsTab, true);
		if(isPending)
			browser.reload();
	}
	else {
		processAddonsTab();
	}
}

function processAddonsTab(e) {
	var doc;
	if(e && e instanceof Components.interfaces.nsIDOMWindow) {
		doc = e.document;
	}
	else if(e) {
		doc = e.target;
		if(doc.location != "about:addons")
			return;
		browser.removeEventListener(e.type, processAddonsTab, true);
	}
	else {
		doc = browser.contentDocument;
	}

	btn.image = imgLoading;
	btn.tooltipText = $("updates-progress").getAttribute("value");

	var origIcon = tab.image;
	tab.image = image;

	var updEnabledPref = "extensions.update.enabled";
	var updEnabled = cbu.getPrefs(updEnabledPref);
	if(!updEnabled)
		cbu.setPrefs(updEnabledPref, true);

	//Avoid getting false results from the past update check (May not be required for "noneFound")
	$("updates-noneFound").hidden = true;
	$("updates-installed").hidden = true;

	$("cmd_findAllUpdates").doCommand();

	var wait = setInterval(function() {
		if(!doc.defaultView || doc.defaultView.closed) {
			stopWait();
			notify("Tab with add-ons manager was closed!");
			return;
		}
		var inProgress = $("updates-progress");
		if(!inProgress.hidden)
			return;
		var autoUpdate = $("utils-autoUpdateDefault");
		var autoUpdateChecked = autoUpdate.getAttribute("checked") == "true";
		var updated = $("updates-installed");
		var found = $("updates-manualUpdatesFound-btn");
		var notFound = $("updates-noneFound");

		if(
			autoUpdateChecked
				? updated.hidden && notFound.hidden
				: found.hidden && notFound.hidden
		) // Too early?
			return;

		stopWait();
		if(!tbTab)
			tab.closing = false;
		function removeTab() {
			if(!tab.collapsed)
				return;
			if(tbTab)
				tabmail.closeTab(tbTabInfo);
			else
				gBrowser.removeTab(tab);
		}

		if(!updEnabled)
			cbu.setPrefs(updEnabledPref, false);

		if(!notFound.hidden) {
			removeTab();
			notify(notFound.getAttribute("value"));
			return;
		}
		if(autoUpdateChecked) {
			removeTab();
			notify(updated.getAttribute("value"));
			return;
		}

		tab.collapsed = false;
		$("categories").selectedItem = $("category-availableUpdates");
		if(tbTab)
			tabmail.switchToTab(tbTabInfo);
		else {
			var tabWin = tab.ownerDocument.defaultView;
			tabWin.gBrowser.selectedTab = tab;
			setTimeout(function() {
				tabWin.focus();
				doc.defaultView.focus();
				$("addon-list").focus();
			}, 0);
		}
	}, 50);
	function $(id) {
		return doc.getElementById(id);
	}
	function stopWait() {
		clearInterval(wait);
		btn.image = image;
		btn.tooltipText = tip;
		if(tab.image == image)
			tab.image = origIcon;
		window.removeEventListener("TabSelect", dontSelectHiddenTab, false);
		setTimeout(function() {
			delete btn._cb_disabled;
		}, 500);
	}
	function notify(msg) {
		Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService)
			.showAlertNotification(
				"chrome://mozapps/skin/extensions/extensionGeneric.png",
				btn.label,
				msg, false, "", null
			);
	}
}
function dontSelectHiddenTab(e) {
	// <tab /><tab collapsed="true" />
	// Close first tab: collapsed tab becomes selected
	if(e.target != tab)
		return;

	if(/\n(?:BrowserOpenAddonsMgr|toEM)@chrome:\/\//.test(new Error().stack)) {
		// User open Add-ons Manager, show tab
		window.removeEventListener("TabSelect", dontSelectHiddenTab, false);
		setTimeout(function() { // Hidden tab can't be selected, so select it manually...
			tab.collapsed = tab.closing = false;
			gBrowser.selectedTab = tab;
		}, 0);
	}

	function done(t) {
		if(!t.hidden && !t.closing) {
			e.preventDefault();
			e.stopPropagation();
			return gBrowser.selectedTab = t;
		}
		return false;
	}
	for(var t = tab.nextSibling; t; t = t.nextSibling)
		if(done(t))
			return;
	for(var t = tab.previousSibling; t; t = t.previousSibling)
		if(done(t))
			return;
}