// http://infocatcher.ucoz.net/js/cb/detachTab.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Detach_Tab

// Detach Tab button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012
// version 0.2.0

var forceHideTabBar = false;

var btn = this;
if("_detachedWindow" in btn)
	attachTab();
else
	detachTab();

function detachTab() {
	btn.checked = true;
	var selectedTab = gBrowser.selectedTab;
	btn._tabPos = "_tPos" in selectedTab
		? selectedTab._tPos
		: Array.indexOf(gBrowser.tabs || gBrowser.tabContainer.childNodes, selectedTab);
	if("TreeStyleTabService" in window)
		btn._parentTab = TreeStyleTabService.getParentTab(selectedTab);
	// See replaceTabWithWindow() in chrome://browser/content/tabbrowser.xml
	var opts = "chrome,dialog=no,all";
	//var opts = "chrome,dialog=0,resizable=1,location=0";
	var w = btn._detachedWindow = window.openDialog(getBrowserURL(), "_blank", opts, selectedTab);
	if(forceHideTabBar) {
		var autoHide = cbu.getPrefs("browser.tabs.autoHide");
		if(!autoHide)
			cbu.setPrefs("browser.tabs.autoHide", true);
	}
	var initDetachedWindow = function init(e) {
		w.removeEventListener(e.type, init, false);
		w.addEventListener("unload", destroyDetachedWindow, false);
		compactWindow(w);
	};
	var destroyDetachedWindow = function destroy(e, parentDestroy) {
		w.removeEventListener(e.type, destroy, false);
		window.removeEventListener("unload", destroyParentWindow, false);
		if(!parentDestroy)
			_attachTab();
		if(forceHideTabBar && !autoHide)
			cbu.setPrefs("browser.tabs.autoHide", false);
	};
	var destroyParentWindow = function destroy(e) {
		w.removeEventListener("load", initDetachedWindow, false);
		destroyDetachedWindow(e, true);
	};
	w.addEventListener("load", initDetachedWindow, false);
	window.addEventListener("unload", destroyParentWindow, false);
}
function attachTab() {
	if(!btn._detachedWindow.closed)
		btn._detachedWindow.close();
	else
		delete btn._detachedWindow;
}
function _attachTab() {
	var tab = btn._detachedWindow.gBrowser.selectedTab;
	var newTab = gBrowser.selectedTab = gBrowser.addTab();
	gBrowser.moveTabTo(newTab, btn._tabPos);
	if("_parentTab" in btn && btn._parentTab && btn._parentTab.parentNode)
		gBrowser.treeStyleTab.attachTabTo(newTab, btn._parentTab);
	varwarnOnClose = cbu.getPrefs("browser.tabs.warnOnClose");
	if(varwarnOnClose) // Strange bug...
		cbu.setPrefs("browser.tabs.warnOnClose", false);
	try {
		gBrowser.swapBrowsersAndCloseOther(newTab, tab);
	}
	catch(e) {
		Components.utils.reportError(e);
	}
	if(varwarnOnClose)
		cbu.setPrefs("browser.tabs.warnOnClose", true);
	window.focus();
	delete btn._detachedWindow;
	delete btn._tabPos;
	delete btn._parentTab;
	btn.checked = false;
}
function compactWindow(win) {
	var document = win.document;
	// See styles for window[chromehidden~="*"] in chrome://global/content/xul.css
	// But don't use "display: none;"
	var style = '\
		#TabsToolbar,\n\
		.tabbrowser-strip,\n\
		.treestyletab-splitter,\n\
		.chromeclass-menubar,\n\
		.chromeclass-directories,\n\
		.chromeclass-status,\n\
		.chromeclass-extrachrome,\n\
		.chromeclass-location,\n\
		.chromeclass-toolbar,\n\
		.chromeclass-toolbar-additional {\n\
			visibility: collapse !important;\n\
		}';
	document.insertBefore(
		document.createProcessingInstruction(
			"xml-stylesheet",
			'href="' + "data:text/css,"
				+ encodeURIComponent(style) + '" type="text/css"'
		),
		document.firstChild
	);
}