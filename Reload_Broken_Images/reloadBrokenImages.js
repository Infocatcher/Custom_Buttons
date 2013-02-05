// Based on code from chrome://browser/content/nsContextMenu.js (Firefox 15.0a1)
Components.utils.import("resource://gre/modules/Services.jsm");
function reloadImage(img) {
	if(!(img instanceof Components.interfaces.nsIImageLoadingContent) || !img.currentURI)
		return;
	var request = img.getRequest(Components.interfaces.nsIImageLoadingContent.CURRENT_REQUEST);
	if(request && (request.imageStatus & request.STATUS_LOAD_COMPLETE))
		return;
	urlSecurityCheck(
		img.currentURI.spec,
		img.ownerDocument.nodePrincipal,
		Components.interfaces.nsIScriptSecurityManager.DISALLOW_SCRIPT
	);
	Services.console.logStringMessage("reloadImage(): " + img.currentURI.spec);
	function check(e) {
		img.removeEventListener("load", check, true);
		img.removeEventListener("error", check, true);
		Services.console.logStringMessage("reloadImage(): " + img.currentURI.spec + " => " + e.type);
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