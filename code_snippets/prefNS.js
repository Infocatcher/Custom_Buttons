// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/prefNS.js
// Get unique preferences root for each button

const prefNS = (function() {
	const buttonId = "coolButton"; // Human-readable "name" of button
	var btnNum = "." + this.id.match(/\d*$/)[0];
	var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
		.getService(Components.interfaces.nsIXULAppInfo);
	var windowId = custombuttons.cbService.getWindowId(document.documentURI);
	if(windowId != appInfo.name) {
		windowId = windowId.substr(appInfo.name.length);
		btnNum += "." + windowId.charAt(0).toLowerCase() + windowId.substr(1);
	}
	return "extensions.custombuttons.buttons." + buttonId + btnNum + ".";
}).call(this);

alert(prefNS);