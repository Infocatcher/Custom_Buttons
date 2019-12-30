// https://github.com/Infocatcher/Custom_Buttons/tree/master/Add_New_Buttons_After_This_Button

// Add New Buttons After This Button button for Custom Buttons
// (code for "initialization" section)
// Note: button is disabled by default, click to enable

// (c) Infocatcher 2012, 2014, 2018-2019
// version 0.1.2.1 - 2019-12-30

var cbs = custombuttons.cbService;
var windowId = cbs.getWindowId(document.documentURI);
var cbInstall = cbs.getNotificationPrefix(windowId) + "installButton";

this.toggleEnabled = function() {
	this.checked = !this.checked;
	if("persist" in document)
		document.persist(this.id, "checked");
	else // Firefox 63+
		Services.xulStore.persist(this, "checked");
};
this.setAttribute("oncommand", "this.toggleEnabled();");

if(!("persist" in document) && parseFloat(Services.appinfo.platformVersion) >= 71) {
	var id = this.id;
	var attr = "checked";
	if(this.hasAttribute(attr))
		return;
	var xs = Services.xulStore;
	var url = location.href;
	if(xs.hasValue(url, id, attr))
		this.setAttribute(attr, xs.getValue(url, id, attr));
}

var observer = {
	button: this,
	observe: function(button, topic, data) {
		if(topic != cbInstall)
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
os.addObserver(observer, cbInstall, false);
var hasObserver = true;

this.onDestroy = function(reason) {
	if(hasObserver) {
		hasObserver = false;
		os.removeObserver(observer, cbInstall);
	}
	if(reason == "delete" && this.checked)
		this.toggleEnabled();
};