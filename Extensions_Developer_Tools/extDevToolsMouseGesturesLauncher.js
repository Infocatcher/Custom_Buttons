// http://infocatcher.ucoz.net/js/cb/extDevToolsMouseGesturesLauncher.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Developer_Tools

// Mouse Gestures Launcher for Extensions Developer Tools
// Copy all code from
// https://github.com/Infocatcher/Custom_Buttons/blob/master/Extensions_Developer_Tools/extDevTools.js
// after "//=== Extensions Developer Tools begin"

// (c) Infocatcher 2012
// version 0.1.0pre - 2012-10-25

var ps = document.createElement("popupset");
ps.id = "mgLauncherForExtDevTools-popupset";
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
else if("mgGestureState" in window && "endEvent" in mgGestureState) // Mouse Gestures Redox
	e = mgGestureState.endEvent;
else {
	var anchor = window.gBrowser && gBrowser.selectedBrowser
		|| document.documentElement;
	if("boxObject" in anchor) {
		var bo = anchor.boxObject;
		e = {
			screenX: bo.screenX,
			screenY: bo.screenY
		};
	}
}

if(!popup || !e) {
	alert("Mouse Gestures Launcher for Extensions Developer Tools:\nNo popup or can't get event object");
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
	if(popup) {
		popup.removeEventListener("popuphidden", destroy, false);
		popup.onDestroy && popup.onDestroy("delete");
		LOG("onDestroy()");
	}
	ps.parentNode.removeChild(ps);
	LOG("Remove popup");
}


function extDevTools() {
//=== Extensions Developer Tools begin

//=== Extensions Developer Tools end
}