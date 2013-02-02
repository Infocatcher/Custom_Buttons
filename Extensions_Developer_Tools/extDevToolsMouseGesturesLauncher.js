// http://infocatcher.ucoz.net/js/cb/extDevToolsMouseGesturesLauncher.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Developer_Tools

// Mouse Gestures Launcher for Extensions Developer Tools
// Also the code can be used from hotkeys (using keyconfig or similar extension)
// Copy all code from
// https://github.com/Infocatcher/Custom_Buttons/blob/master/Extensions_Developer_Tools/extDevTools.js
// after "//=== Extensions Developer Tools begin"

// (c) Infocatcher 2012
// version 0.1.0pre2 - 2012-12-05

const popupsetId = "mgLauncherForExtDevTools-popupset";
var ps = document.getElementById(popupsetId);
ps && ps.parentNode.removeChild(ps);
ps = document.createElement("popupset");
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
else if(this == window && "mgGestureState" in window && "endEvent" in mgGestureState) // Mouse Gestures Redox
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
}

if(!popup || !e || !("screenX" in e)) {
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