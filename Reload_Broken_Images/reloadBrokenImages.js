// Based on code from chrome://browser/content/nsContextMenu.js (Firefox 15.0a1)
function reloadImage(img) {
	if(!(img instanceof Components.interfaces.nsIImageLoadingContent) || !img.currentURI)
		return;
	urlSecurityCheck(img.currentURI.spec,
	                 gBrowser.contentPrincipal,
	                 Components.interfaces.nsIScriptSecurityManager.DISALLOW_SCRIPT);
	img.forceReload();
}
function parseWin(win) {
	Array.forEach(win.frames, parseWin);
	Array.forEach(win.document.images, reloadImage);
}
parseWin(content);