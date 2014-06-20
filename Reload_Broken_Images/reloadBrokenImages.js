// http://infocatcher.ucoz.net/js/cb/reloadBrokenImages.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57978
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Reload_Broken_Images

// Reload Broken Images button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012-2014
// version 0.3.0 - 2014-06-20

var debug = false;
var maxAttempts = 4;

function _localize(s) {
	var strings = {
		"%label%: ": {
			ru: "%label%: "
		},
		"Reloading: $1/$2": {
			ru: "Обновление: $1/$2"
		},
		"Done [count: $1, failed: $2]": {
			ru: "Готово [всего: $1, неудачно: $2]"
		},
		"Done [count: $1]": {
			ru: "Готово [всего: $1]"
		},
		"Start reloading: $1": {
			ru: "Запуск обновления: $1"
		},
		"Nothing to reload": {
			ru: "Обновлять нечего"
		}
	};
	var locale = (function() {
		//var prefs = Services.prefs;
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
		if(!prefs.getBoolPref("intl.locale.matchOS")) {
			var locale = prefs.getCharPref("general.useragent.locale");
			if(locale.substr(0, 9) != "chrome://")
				return locale;
		}
		return Components.classes["@mozilla.org/chrome/chrome-registry;1"]
			.getService(Components.interfaces.nsIXULChromeRegistry)
			.getSelectedLocale("global");
	})().match(/^[a-z]*/)[0];
	_localize = !locale || locale == "en"
		? function(s) {
			return s;
		}
		: function(s) {
			return strings[s] && strings[s][locale] || s;
		};
	return _localize.apply(this, arguments);
}

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
			feedback("Reloading: $1/$2", [failedImages + successImages, totalImages]);
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
		if(!--activeAttempts) {
			feedback(
				failedImages
					? "Done [count: $1, failed: $2]"
					: "Done [count: $1]",
				[totalImages, failedImages],
				true
			);
		}
	}
	img.addEventListener("load", check, true);
	img.addEventListener("error", check, true);
	var stopWaitTimer = setTimeout(destroy, 8*60e3);
	++activeAttempts;
	++totalImages;
	img.forceReload();
}
function feedback(s, replacements, isLast) {
	if("XULBrowserWindow" in window) {
		s = _localize(s);
		if(replacements) replacements.forEach(function(replacement, i) {
			s = s.replace("$" + ++i, replacement);
		});
		debug && Services.console.logStringMessage(logPrefix + "feedback():\n" + s);
		XULBrowserWindow.setOverLink(feedbackPrefix + s, null);
		if(isLast) setTimeout(function() {
			XULBrowserWindow.setOverLink("", null);
		}, 1500);
	}
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
var feedbackPrefix = _localize("%label%: ")
	.replace(
		"%label%",
		this instanceof XULElement && this.label
			|| "Reload Broken Images"
	);
parseWin(content);
feedback(totalImages ? "Start reloading: $1" : "Nothing to reload", [totalImages], !totalImages);