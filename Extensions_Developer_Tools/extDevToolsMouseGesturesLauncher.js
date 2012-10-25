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
var e = typeof event == "object" && event instanceof Event // FireGestures
	? event
	: window.mgGestureState && mgGestureState.endEvent; // Mouse Gestures Redox
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
	popup.removeEventListener("popuphidden", destroy, false);
	popup && popup.onDestroy && popup.onDestroy("delete");
	LOG("onDestroy()");
	ps.parentNode.removeChild(ps);
	LOG("Remove popup");
}


function extDevTools() {
//=== Extensions Developer Tools begin

//=== Extensions Developer Tools end
}