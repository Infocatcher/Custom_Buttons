// https://github.com/Infocatcher/Custom_Buttons/tree/master/CB_Disable_Initialization

// Custom Buttons: Disable Initialization button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012
// version 0.1.0pre - 2012-10-11

// Add "Enabled" checkbox to custom button's context menu.
// Only for test purposes!
// "Disabled" mean only "return;" before initealization code.

// Note: button itself aren't needed, this is just way to execute code on window startup.
// So you can place it on hidden toolbar.

var toggleEnabledLabel = (function() {
	var locale = (cbu.getPrefs("general.useragent.locale") || "en").match(/^\w*/)[0];
	if(locale == "ru")
		return "¬ключить инициализацию";
	return "Enable initialization";
})();

const deleteId = "custombuttons-contextpopup-remove";
const toggleEnabledId = "custombuttons-contextpopup-toggleEnabled";
var toggleEnabled = document.getElementById(toggleEnabledId);
if(toggleEnabled)
	toggleEnabled.parentNode.removeChild(toggleEnabled);
var deleteItem = document.getElementById(deleteId);
toggleEnabled = deleteItem.cloneNode(true);
toggleEnabled.id = toggleEnabledId;
toggleEnabled.setAttribute("cb_id", toggleEnabledId);
toggleEnabled.setAttribute("type", "checkbox");
toggleEnabled.setAttribute("label", toggleEnabledLabel);
toggleEnabled.setAttribute("oncommand", "toggleCustomButtonEnabled();");
toggleEnabled.removeAttribute("observes"); // For Firefox 3.6 and older
deleteItem.parentNode.insertBefore(toggleEnabled, deleteItem);

Array.filter( // Process already cloned menu items
	document.getElementsByAttribute("observes", deleteItem.getAttribute("observes")),
	function(mi) {
		return mi != deleteItem && (mi.id || "").substr(0, deleteId.length) == deleteId;
	}
).forEach(function(deleteItem, i) {
	var clone = toggleEnabled.cloneNode(true);
	clone.id += "-cloned-" + i;
	deleteItem.parentNode.insertBefore(clone, deleteItem);
});

addEventListener("popupshowing", function(e) {
	var popup = e.target;
	if(popup.localName != "menupopup" || (popup.id || "").substr(0, 14) != "custombuttons-")
		return;
	var btn = custombuttons.popupNode;
	if(!btn)
		return;
	var toggleEnabled = popup.getElementsByAttribute("cb_id", toggleEnabledId)[0];
	if(!toggleEnabled)
		return;
	var initCode = btn.cbInitCode;
	if(/^\n*return(?:;|\s*\n)/.test(initCode))
		toggleEnabled.removeAttribute("checked");
	else
		toggleEnabled.setAttribute("checked", "true");
	if(/^\s*(?:\/\*Initialization Code\*\/\s*)?$/.test(initCode)) // Nothing to do :)
		toggleEnabled.setAttribute("disabled", "true");
	else
		toggleEnabled.removeAttribute("disabled");
}, true);

window.toggleCustomButtonEnabled = function(btn) { // Should be global to work in cloned menus
	if(!btn)
		btn = custombuttons.popupNode;
	if(!btn)
		return;

	const disablePrefix = "return; // Disabled by Disable Initialization button\n\n";
	var initCode = btn.cbInitCode;
	//if(initCode.substr(0, disablePrefix.length) == disablePrefix)
	//	initCode = initCode.substr(disablePrefix.length);
	if(/^\s*return;?(?:\s*\/\/[^\n\r]*)?\n+/.test(initCode))
		initCode = RegExp.rightContext;
	else
		initCode = disablePrefix + initCode;

	//btn.destroy("update");
	//btn.cbInitCode = initCode;
	//btn.setAttribute("cb-init", initCode);

	var link = custombuttons.makeButtonLink("edit", btn.id);
	var cbService = custombuttons.cbService;
	var param = cbService.getButtonParameters(link);
	param = param.wrappedJSObject || param;
	param.initCode = initCode;
	cbService.installButton(param);

	//btn.init();
};

var style = '\
	@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
	toolbarbutton[id^="custombuttons-button"][cb-init^="return;"] {\n\
		outline: 1px dotted -moz-dialogtext !important;\n\
		outline-offset: -1px !important;\n\
	}';
var styleNode = document.insertBefore(
	document.createProcessingInstruction(
		"xml-stylesheet",
		'href="' + "data:text/css,"
			+ encodeURIComponent(style) + '" type="text/css"'
	),
	document.firstChild
);

this.onDestroy = function(reason) {
	if(reason == "update" || reason == "delete") {
		styleNode.parentNode.removeChild(styleNode);
		Array.slice(document.getElementsByAttribute("cb_id", toggleEnabledId)).forEach(function(btn) {
			btn.parentNode.removeChild(btn);
		});
		delete window.toggleCustomButtonEnabled;
	}
};