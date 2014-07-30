// https://github.com/Infocatcher/Custom_Buttons/tree/master/List_All_Tabs

// List All Tabs button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2013
// version 0.1.0.1 - 2013-11-23

var allTabsBtn = document.getElementById("alltabs-button");
if(!allTabsBtn && "gNavToolbox" in window && gNavToolbox.palette) // Firefox + button in palette
	allTabsBtn = gNavToolbox.palette.getElementsByAttribute("id", "alltabs-button")[0];
if(!allTabsBtn) { // SeaMonkey
	var tabContainer = document.getAnonymousElementByAttribute(gBrowser, "anonid", "tabcontainer");
	allTabsBtn = tabContainer && document.getAnonymousElementByAttribute(tabContainer, "anonid", "alltabs-button");
}
if(!allTabsBtn) {
	alert("All tab button not found!");
	return;
}

var btn = this;
var isBtn = btn instanceof XULElement;
var popup = allTabsBtn.getElementsByTagName("menupopup")[0];
if(isBtn && btn._allTabsPopup) {
	btn._allTabsPopup.hidePopup();
	btn._allTabsPopup = null;
}
else if(popup) {
	if(isBtn) {
		btn._allTabsPopup = popup;
		btn.setAttribute("open", true);
	}
	document.documentElement.appendChild(popup);
	popup.addEventListener("popuphidden", function restorePopup(e) {
		popup.removeEventListener(e.type, restorePopup, true);
		if(isBtn) {
			btn.removeAttribute("open");
			btn._allTabsPopup = null;
		}
		allTabsBtn.appendChild(popup);
	}, true);

	var e = getEvent();
	if(e) {
		if("openPopupAtScreen" in popup)
			popup.openPopupAtScreen(e.screenX, e.screenY);
		else
			popup.showPopup(document.documentElement, e.screenX, e.screenY, "popup", null, null);
	}
	else {
		if("openPopup" in popup)
			popup.openPopup();
		else
			popup.showPopup();
	}
}
else { // SeaMonkey or old Firefox?
	var open = !allTabsBtn.open;
	if(open) {
		var evt = getEvent();
		popup = document.getAnonymousElementByAttribute(allTabsBtn, "anonid", "alltabs-popup");
		if(popup) {
			if(evt) {
				popup.addEventListener("popupshowing", function movePopup(e) {
					popup.removeEventListener(e.type, movePopup, false);
					popup.moveTo(evt.screenX, evt.screenY);
				}, false);
			}
			if(isBtn) {
				btn._allTabsPopup = popup;
				btn.setAttribute("open", true);
				var markAsClosedTimer = 0;
				var markAsClosed = function(e) {
					if(e.type == "popuphidden") {
						popup.removeEventListener("popuphidden", markAsClosed, true);
						markAsClosedTimer = setTimeout(function() {
							btn.removeAttribute("open");
							btn._allTabsPopup = null;
						}, 0);
					}
					else {
						btn.removeEventListener("mousedown", markAsClosed, true);
						clearTimeout(markAsClosedTimer);
					}
				};
				popup.addEventListener("popuphidden", markAsClosed, true);
				btn.addEventListener("mousedown", markAsClosed, true);
			}
		}
	}
	allTabsBtn.open = open;
}

function getEvent() {
	var e;
	if(typeof event == "object" && event instanceof Event && "screenX" in event) // FireGestures
		e = event;
	else if(btn == window && "mgGestureState" in window && "endEvent" in mgGestureState) // Mouse Gestures Redox
		e = mgGestureState.endEvent;
	else {
		var anchor = btn instanceof XULElement && btn
			|| window.gBrowser && gBrowser.selectedBrowser
			|| document.documentElement;
		if("boxObject" in anchor) {
			var bo = anchor.boxObject;
			e = {
				screenX: bo.screenX,
				screenY: bo.screenY
			};
			if(btn instanceof XULElement)
				e.screenY += bo.height;
		}
	}
	return e;
}