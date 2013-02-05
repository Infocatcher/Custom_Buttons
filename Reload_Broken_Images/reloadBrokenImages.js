// http://infocatcher.ucoz.net/js/cb/reloadBrokenImages.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Reload_Broken_Images

// Reload Broken Images button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012-2013
// version 0.2.0 - 2013-02-05

var debug = false;
var maxAttempts = 4;

var logPrefix = "reloadImage(): ";
debug && Components.utils.import("resource://gre/modules/Services.jsm");
function reloadImage(img) {
	// Based on code from chrome://browser/content/nsContextMenu.js (Firefox 21.0a1)
	if(!(img instanceof Components.interfaces.nsIImageLoadingContent) || !img.currentURI)
		return;
	var request = img.getRequest(Components.interfaces.nsIImageLoadingContent.CURRENT_REQUEST);
	if(request && (request.imageStatus & request.STATUS_LOAD_COMPLETE))
		return;
	var uri = img.currentURI;
	var src = uri.spec;
	urlSecurityCheck(
		src,
		img.ownerDocument.nodePrincipal,
		Components.interfaces.nsIScriptSecurityManager.DISALLOW_SCRIPT
	);
	debug && Services.console.logStringMessage(logPrefix + src);
	var errors = 0;
	function check(e) {
		if(e.type == "error")
			++errors;
		debug && Services.console.logStringMessage(logPrefix + src + " => " + e.type + (errors ? "#" + errors : ""));
		if(errors && errors < maxAttempts) {
			try {
				var tools = Components.classes["@mozilla.org/image/tools;1"]
					.getService(Components.interfaces.imgITools);
				var cache = "getImgCacheForDocument" in tools // Gecko 18
					? tools.getImgCacheForDocument(img.ownerDocument)
					: Components.classes["@mozilla.org/image/cache;1"]
						.getService(Components.interfaces.imgICache);
				if(cache.findEntryProperties(uri)) {
					cache.removeEntry(uri);
					debug && Services.console.logStringMessage(logPrefix + src + " => remove this URI from cache");
				}
			}
			catch(e) {
				debug && Services.console.logStringMessage(logPrefix + src + " => cache.removeEntry() failed");
				Components.utils.reportError(e);
			}
			img.src = "about:blank";
			setTimeout(function() {
				img.src = src;
			}, 0);
		}
		else {
			clearTimeout(stopWaitTimer);
			destroy();
		}
	}
	function destroy() {
		img.removeEventListener("load", check, true);
		img.removeEventListener("error", check, true);
	}
	img.addEventListener("load", check, true);
	img.addEventListener("error", check, true);
	var stopWaitTimer = setTimeout(destroy, 8*60e3);
	img.forceReload();
}
function parseWin(win) {
	Array.forEach(win.frames, parseWin);
	Array.forEach(win.document.images, reloadImage);
}
parseWin(content);