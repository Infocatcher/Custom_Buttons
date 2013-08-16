// https://github.com/Infocatcher/Custom_Buttons/tree/master/Quick_Filter_by_Sender

// Quick Filter by Sender button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2013
// version 0.1.0 - 2013-08-16

var selectedMessages = gFolderDisplay.selectedMessages;
if(selectedMessages && selectedMessages.length) {
	var authorEmail = extractAddress(selectedMessages[0].author);
	setFilterOptions({
		sender:     true,
		recipients: false,
		subject:    false,
		body:       false
	});
	var filterField = document.getElementById("qfb-qs-textbox");
	filterField.value = authorEmail;
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