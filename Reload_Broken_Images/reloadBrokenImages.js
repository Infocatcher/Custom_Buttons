// http://infocatcher.ucoz.net/js/cb/reloadBrokenImages.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57978
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Reload_Broken_Images

// Reload Broken Images button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012-2013
// version 0.2.1pre2 - 2013-02-12

var debug = false;
var maxAttempts = 4;

var logPrefix = "reloadImage(): ";
debug && Components.utils.import("resource://gre/modules/Services.jsm");
var activeAttempts = 0;
var totalImages = 0;
var successImages = 0;
var failedImages = 0;
function reloadImage(img) {
	// Based on code from chrome://browser/content/nsContextMenu.js (Firefox 21.0a1)
	if(!(img instanceof Components.interfaces.nsIImageLoadingContent) || !img.currentURI)
		return;
	var request = img.getRequest(Components.interfaces.nsIImageLoadingContent.CURRENT_REQUEST);
	if(request && (request.imageStatus & request.STATUS_LOAD_COMPLETE))
		return;
	var uri = img.currentURI;
	var src = uri.spec;
	try {
		urlSecurityCheck(
			src,
			img.ownerDocument.nodePrincipal,
			Components.interfaces.nsIScriptSecurityManager.DISALLOW_SCRIPT
		);
	}
	catch(e) {
		Components.utils.reportError(e);
		return;
	}
	debug && Services.console.logStringMessage(logPrefix + src);
	var errors = 0;
	function check(e) {
		var error = e.type == "error";
		if(error && ++errors < maxAttempts) {
			try {
				var tools = Components.classes["@mozilla.org/image/tools;1"]
					.getService(Components.interfaces.imgITools);
				var cache = "getImgCacheForDocument" in tools // Gecko 18
					? tools.getImgCacheForDocument(img.ownerDocument)
					: Components.classes["@mozilla.org/image/cache;1"]
						.getService(Components.interfaces.imgICache);
				if(cache.findEntryProperties(uri)) {
					cache.removeEntry(uri);
					debug && Services.console.logStringMessage(logPrefix + src + "\n=> remove this URI from cache");
				}
			}
			catch(e) {
				debug && Services.console.logStringMessage(logPrefix + src + "\n=> cache.removeEntry() failed");
				Components.utils.reportError(e);
			}

			// Workaround for "Image corrupt or truncated" error
			var req = new XMLHttpRequest();
			req.open("GET", src, true);
			req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
			req.onload = req.onerror = resetSrc;
			req.send(null);

			resetSrc();
		}
		else {
			if(error)
				++failedImages;
			else
				++successImages;
			feedback("Reloading: " + successImages + "/" + totalImages);
			destroy();
		}
		debug && Services.console.logStringMessage(logPrefix + src + "\n=> " + e.type + (error ? "#" + errors : ""));
	}
	function resetSrc() {
		img.src = "about:blank";
		setTimeout(function() {
			img.src = src;
		}, 0);
	}
	function destroy() {
		clearTimeout(stopWaitTimer);
		img.removeEventListener("load", check, true);
		img.removeEventListener("error", check, true);
		if(!--activeAttempts)
			feedback("Done [count: " + totalImages + (failedImages ? ", failed: " + failedImages + "" : "") + "]");
	}
	img.addEventListener("load", check, true);
	img.addEventListener("error", check, true);
	var stopWaitTimer = setTimeout(destroy, 8*60e3);
	++activeAttempts;
	++totalImages;
	img.forceReload();
}
function feedback(s) {
	if("XULBrowserWindow" in window)
		XULBrowserWindow.setOverLink("Reload Broken Images: " + s, null);
}
function parseWin(win) {
	Array.forEach(win.frames, parseWin);
	var doc = win.document;
	if("images" in doc) // HTML document
		Array.forEach(doc.images, reloadImage);
	else {
		Array.forEach(
			doc.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "img"),
			reloadImage
		);
		Array.forEach(
			doc.getElementsByTagNameNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "image"),
			reloadImage
		);
	}
}
parseWin(content);
feedback("Start reloading: " + totalImages);