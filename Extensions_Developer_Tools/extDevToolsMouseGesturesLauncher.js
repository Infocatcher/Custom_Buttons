// http://infocatcher.ucoz.net/js/cb/extDevToolsMouseGesturesLauncher.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Developer_Tools

// Mouse Gestures Launcher for Extensions Developer Tools
// Also the code can be used from hotkeys (using keyconfig or similar extension)
// Copy all code from
// https://github.com/Infocatcher/Custom_Buttons/blob/master/Extensions_Developer_Tools/extDevTools.js
// after "//=== Extensions Developer Tools begin"

// (c) Infocatcher 2012-2024
// version 0.1.2 - 2024-03-06

(function() {

const popupsetId = "mgLauncherForExtDevTools-popupset";
var ps = document.getElementById(popupsetId);
ps && ps.parentNode.removeChild(ps);
ps = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "popupset");
ps.id = popupsetId;
document.documentElement.appendChild(ps);

function LOG(s) {
	Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService)
		.logStringMessage("Mouse Gestures Launcher for Extensions Developer Tools:\n" + s);
}

extDevTools.call(ps);
var popup = ps.firstChild;

var e;
if(typeof event == "object" && event instanceof Event && "screenX" in event) // FireGestures
	e = event;
else if(
	this instanceof (Components.interfaces.nsIDOMChromeWindow || Components.interfaces.nsIDOMWindow)
	&& "mgGestureState" in window && "endEvent" in mgGestureState // Mouse Gestures Redox
)
	e = mgGestureState.endEvent;
else {
	var anchor = this instanceof XULElement && this
		|| window.gBrowser && gBrowser.selectedBrowser
		|| document.documentElement;
	if("boxObject" in anchor) {
		var bo = anchor.boxObject;
		e = {
			screenX: bo.screenX,
			screenY: bo.screenY
		};
		if(this instanceof XULElement)
			e.screenY += bo.height;
	}
	else {
		e = {
			screenX: anchor.screenX || 0,
			screenY: anchor.screenY || 0
		};
	}
}

var okEvt = e && ("screenX" in e);
if(!popup || !okEvt) {
	alert(
		"Mouse Gestures Launcher for Extensions Developer Tools:"
		+ (!popup ? "\nNo popup! Missing or failed Extensions Developer Tools code." : "")
		+ (!okEvt ? "\nCan't get event object!" : "")
	);
	destroy();
}
else {
	if("openPopupAtScreen" in popup)
		popup.openPopupAtScreen(e.screenX, e.screenY);
	else
		popup.showPopup(document.documentElement, e.screenX, e.screenY, "popup", null, null);
	popup.addEventListener("popuphidden", destroy, false);
}

function destroy(e) {
	if(e && e.target != popup)
		return;
	popup && popup.removeEventListener("popuphidden", destroy, false);
	setTimeout(function() {
		if("onDestroy" in ps) try {
			ps.onDestroy("delete");
			LOG("onDestroy()");
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		ps.parentNode.removeChild(ps);
		LOG("Remove popup");
	}, 0);
}


function extDevTools() {
//=== Extensions Developer Tools begin

//=== Extensions Developer Tools end
}

}).call(this);