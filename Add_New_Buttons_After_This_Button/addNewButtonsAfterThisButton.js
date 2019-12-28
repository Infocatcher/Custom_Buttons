// https://github.com/Infocatcher/Custom_Buttons/tree/master/Add_New_Buttons_After_This_Button

// Add New Buttons After This Button button for Custom Buttons
// (code for "initialization" section)
// Note: button is disabled by default, click to enable

// (c) Infocatcher 2012, 2014
// version 0.1.2 - 2014-01-25

var cbs = custombuttons.cbService;
var windowId = cbs.getWindowId(document.documentURI);
var notificationPrefix = cbs.getNotificationPrefix(windowId);

this.toggleEnabled = function() {
	this.checked = !this.checked;
	if("persist" in document)
		document.persist(this.id, "checked");
	else // Firefox 63+
		Services.xulStore.persist(this, "checked");
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
		toolbar.insertBefore(
			custombuttons.cbCloneNode(button), // Prevent "The operation is insecure" in Firefox 71+
			this.button.nextSibling
		);
		custombuttons.persistCurrentSets(toolbar.id, this.button.id, button.id || button.getAttribute("id"));
	}
};
var os = Components.classes["@mozilla.org/observer-service;1"]
	.getService (Components.interfaces.nsIObserverService);
os.addObserver(observer, notificationPrefix + "installButton", false);
var hasObserver = true;

this.onDestroy = function(reason) {
	if(hasObserver) {
		hasObserver = false;
		os.removeObserver(observer, notificationPrefix + "installButton");
	}
	if(reason == "delete" && this.checked)
		this.toggleEnabled();
};