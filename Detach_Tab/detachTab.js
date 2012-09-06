// http://infocatcher.ucoz.net/js/cb/detachTab.js

// Detach Tab button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012
// version 0.1.0

if(!("_detachedWindow" in this)) {
	this.checked = true;
	// See replaceTabWithWindow() in chrome://browser/content/tabbrowser.xml
	var opts = "chrome,dialog=no,all";
	//var opts = "chrome,dialog=0,resizable=1,location=0";
	var w = this._detachedWindow = window.openDialog(getBrowserURL(), "_blank", opts, gBrowser.selectedTab);
	var _this = this;
	w.addEventListener("load", function loader(e) {
		w.removeEventListener(e.type, loader, false);
		w.document.documentElement.setAttribute("customButtonsDetached", "true");
		w.addEventListener("unload", function destroy(e) {
			w.removeEventListener(e.type, destroy, false);
			delete _this._detachedWindow;
			_this.checked = false;
		}, false);
	}, false);
}
else {
	var tab = this._detachedWindow.gBrowser.selectedTab;
	try {
		gBrowser.swapBrowsersAndCloseOther(gBrowser.selectedTab = gBrowser.addTab(), tab);
	}
	catch(e) {
		Components.utils.reportError(e);
	}
	if("_detachedWindow" in this && !this._detachedWindow.closed)
		this._detachedWindow.close();
}