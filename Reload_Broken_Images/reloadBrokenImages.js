// Based on code from chrome://browser/content/nsContextMenu.js (Firefox 15.0a1)
Components.utils.import("resource://gre/modules/Services.jsm");
function reloadImage(img) {
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
	Services.console.logStringMessage("reloadImage(): " + src);
	var errors = 0;
	function check(e) {
		if(e.type == "error")
			++errors;
		Services.console.logStringMessage("reloadImage(): " + src + " => " + e.type + (errors ? "#" + errors : ""));
		if(errors && errors < 4) {
			try {
				var tools = Components.classes["@mozilla.org/image/tools;1"]
					.getService(Components.interfaces.imgITools);
				var cache = "getImgCacheForDocument" in tools // Gecko 18
					? tools.getImgCacheForDocument(img.ownerDocument)
					: Components.classes["@mozilla.org/image/cache;1"]
						.getService(Components.interfaces.imgICache);
				if(cache.findEntryProperties(uri)) {
					cache.removeEntry(uri);
					Services.console.logStringMessage("reloadImage(): " + src + " => remove this URI from cache");
				}
			}
			catch(e) {
				Services.console.logStringMessage("reloadImage(): " + src + " => cache.removeEntry() failed");
				Components.utils.reportError(e);
			}
			img.src = "about:blank";
			setTimeout(function() {
				img.src = src;
			}, 0);
		}
		else {
			img.removeEventListener("load", check, true);
			img.removeEventListener("error", check, true);
		}
	}
	img.addEventListener("load", check, true);
	img.addEventListener("error", check, true);
	img.forceReload();
}
function parseWin(win) {
	Array.forEach(win.frames, parseWin);
	Array.forEach(win.document.images, reloadImage);
}
parseWin(content);