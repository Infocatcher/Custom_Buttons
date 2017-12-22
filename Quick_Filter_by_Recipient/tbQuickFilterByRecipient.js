// https://github.com/Infocatcher/Custom_Buttons/tree/master/Quick_Filter_by_Recipient

// Quick Filter by Recipient button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2013
// version 0.1.0 - 2013-08-16

function _localize(s, key) {
	var strings = {
		"Filter by recipient": {
			ru: "Фильтр по получателю"
		},
		"Select email address to filter:": {
			ru: "Выберите email-адрес для фильтрации:"
		}
	};
	var locale = (function() {
		if("Services" in window && Services.locale && Services.locale.getRequestedLocales) {			var locales = Services.locale.getRequestedLocales();			return locales && locales[0];		}
		var prefs = "Services" in window && Services.prefs
			|| Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		function pref(name, type) {
			return prefs.getPrefType(name) != prefs.PREF_INVALID ? prefs["get" + type + "Pref"](name) : undefined;
		}
		if(!pref("intl.locale.matchOS", "Bool")) { // Also see https://bugzilla.mozilla.org/show_bug.cgi?id=1414390
			var locale = pref("general.useragent.locale", "Char");
			if(locale && locale.substr(0, 9) != "chrome://")
				return locale;
		}
		return Components.classes["@mozilla.org/chrome/chrome-registry;1"]
			.getService(Components.interfaces.nsIXULChromeRegistry)
			.getSelectedLocale("global");
	})().match(/^[a-z]*/)[0];
	_localize = !locale || locale == "en"
		? function(s) {
			return s;
		}
		: function(s) {
			return strings[s] && strings[s][locale] || s;
		};
	return _localize.apply(this, arguments);
}

var selectedMessages = gFolderDisplay.selectedMessages;
if(selectedMessages && selectedMessages.length) {
	var selectedMessage = selectedMessages[0];
	var recipients = extractAddress(selectedMessage.recipients).split(", ");
	var cc = extractAddress(selectedMessage.ccList).split(", ");
	var bcc = extractAddress(selectedMessage.bccList).split(", ");
	var allRecipients = recipients.concat(cc, bcc).filter(function(eml, i, arr) {
		return eml && arr.indexOf(eml) == i;
	});

	var recipient = allRecipients[0];
	if(allRecipients.length > 1) {
		var recipientOut = { value: 0 };
		var ok = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService)
			.select(
				window,
				_localize("Filter by recipient"),
				_localize("Select email address to filter:"),
				allRecipients.length,
				allRecipients,
				recipientOut
			);
		if(!ok)
			return;
		recipient = allRecipients[recipientOut.value];
	}

	setFilterOptions({
		sender:     false,
		recipients: true,
		subject:    false,
		body:       false
	});
	var filterField = document.getElementById("qfb-qs-textbox");
	filterField.value = recipient;
	filterField.doCommand();
}
function extractAddress(header) {
	return Components.classes["@mozilla.org/messenger/headerparser;1"]
		.getService(Components.interfaces.nsIMsgHeaderParser)
		.extractHeaderAddressMailboxes(header);
}
function setFilterOptions(opts) {
	for(var type in opts) if(opts.hasOwnProperty(type)) {
		var btn = document.getElementById("qfb-qs-" + type);
		if(btn.checked != opts[type])
			btn.click();
	}
}