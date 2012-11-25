// https://github.com/Infocatcher/Custom_Buttons/tree/master/Add_New_Buttons_After_This_Button

// Add New Buttons After This Button button for Custom Buttons
// (code for "initialization" section)
// Note: button are disabled by default, click to enable

// (c) Infocatcher 2012
// version 0.1.1 - 2012-11-25

var cbs = Components.classes["@xsms.nm.ru/custombuttons/cbservice;1"]
	.getService(Components.interfaces.cbICustomButtonsService);
var windowId = cbs.getWindowId(document.documentURI);
var notificationPrefix = cbs.getNotificationPrefix(windowId);

this.toggleEnabled = function() {
	this.checked = !this.checked;
	document.persist(this.id, "checked");
};
this.setAttribute("oncommand", "this.toggleEnabled();");

var observer = {
	button: this,
	observe: function(button, topic, data) {
		if(topic != notificationPrefix + "installButton")
			return;
		if(!this.button.checked)
			return;
		var toolbar = this.button.parentNode;
		toolbar.insertBefore(button, this.button.nextSibling);
		custombuttons.persistCurrentSets(toolbar.id, this.button.id, button.id || button.getAttribute("id"));
	}
};
var os = Components.classes["@mozilla.org/observer-service;1"]
	.getService (Components.interfaces.nsIObserverService);
os.addObserver(observer, notificationPrefix + "installButton", false);
var hasObserver = true;

this.onDestroy = function() {
	if(hasObserver) {
		hasObserver = false;
		os.removeObserver(observer, notificationPrefix + "installButton");
	}
};