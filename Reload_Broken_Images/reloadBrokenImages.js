// Based on code from chrome://browser/content/nsContextMenu.js (Firefox 3.6)
function reloadImage(img) {
	if(!(img instanceof Components.interfaces.nsIImageLoadingContent))
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