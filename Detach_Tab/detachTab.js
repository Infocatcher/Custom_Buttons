// http://infocatcher.ucoz.net/js/cb/detachTab.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Detach_Tab

// Detach Tab button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012
// version 0.2.0

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
	// See replaceTabWithWindow() in chrome://browser/content/tabbrowser.xml
	var opts = "chrome,dialog=no,all";
	//var opts = "chrome,dialog=0,resizable=1,location=0";
	var w = btn._detachedWindow = window.openDialog(getBrowserURL(), "_blank", opts, selectedTab);
	var autoHide = cbu.getPrefs("browser.tabs.autoHide");
	if(!autoHide)
		cbu.setPrefs("browser.tabs.autoHide", true);
	var initDetachedWindow = function init(e) {
		w.removeEventListener(e.type, init, false);
		w.addEventListener("unload", destroyDetachedWindow, false);
		compactWindow(w);
	};
	var destroyDetachedWindow = function destroy(e) {
		w.removeEventListener(e.type, destroy, false);
		window.removeEventListener("unload", destroyParentWindow, false);
		_attachTab();
		if(!autoHide)
			cbu.setPrefs("browser.tabs.autoHide", false);
	};
	var destroyParentWindow = function destroy(e) {
		w.removeEventListener("load", initDetachedWindow, false);
		destroyDetachedWindow(e);
	};
	w.addEventListener("load", initDetachedWindow, false);
	window.addEventListener("unload", destroyParentWindow, false);
}
function attachTab() {
	if(!btn._detachedWindow.closed)
		btn._detachedWindow.close();
}
function _attachTab() {
	var tab = btn._detachedWindow.gBrowser.selectedTab;
	var newTab = gBrowser.selectedTab = gBrowser.addTab();
	gBrowser.moveTabTo(newTab, btn._tabPos);
	try {
		gBrowser.swapBrowsersAndCloseOther(newTab, tab);
	}
	catch(e) {
		Components.utils.reportError(e);
	}
	delete btn._detachedWindow;
	delete btn._tabPos;
	btn.checked = false;
}
function compactWindow(win) {
	var document = win.document;
	// See styles for window[chromehidden~="*"] in chrome://global/content/xul.css
	// But don't use "display: none;"
	var style = '\
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

	var tc = win.gBrowser.tabContainer;
	//eval(
	//	"tc.updateVisibility = " + tc.updateVisibility.toString()
	//		.replace(/\s*&&\s*![\w.]+\("browser\.tabs\.autoHide"\)/, "")
	//);
	tc.updateVisibility = function() {
		this.visible = false;
	};
}