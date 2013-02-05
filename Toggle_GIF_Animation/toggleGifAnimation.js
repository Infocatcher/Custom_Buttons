// http://infocatcher.ucoz.net/js/cb/toggleGifAnimation.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_GIF_Animation

// Toggle GIF Animation button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2013
// version 0.1.0 - 2013-02-05

function _localize(s, key) {
	var strings = {
		"GIF Animation:": {
			ru: "GIF-анимация:"
		},
		"Enabled": {
			ru: "Включена"
		},
		"Disabled": {
			ru: "Выключена"
		}
	};
	var locale = Application.prefs.getValue("general.useragent.locale", "en").match(/^[a-z]*/)[0];
	_localize = !locale || locale == "en"
		? function(s) {
			return s;
		}
		: function(s) {
			return strings[s] && strings[s][locale] || s;
		};
	return _localize.apply(this, arguments);
}

var win = content;

var utils = getUtils(win);
var ic = Components.interfaces.imgIContainer;
var am = utils.imageAnimationMode = utils.imageAnimationMode == ic.kNormalAnimMode
	? ic.kDontAnimMode
	: ic.kNormalAnimMode;
Array.forEach(win.frames, parseWin);

Components.classes["@mozilla.org/alerts-service;1"]
	.getService(Components.interfaces.nsIAlertsService)
	.showAlertNotification(
		this.image || "chrome://mozapps/skin/extensions/extensionGeneric.png",
		_localize("GIF Animation:"),
		am == ic.kNormalAnimMode
			? _localize("Enabled")
			: _localize("Disabled")
	);

function getUtils(win) {
	return win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindowUtils);
}
function parseWin(win) {
	Array.forEach(win.frames, parseWin);
	var utils = getUtils(win);
	try {
		utils.imageAnimationMode = am;
	}
	catch(e) { // NS_ERROR_NOT_AVAILABLE
	}
}