// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toolbar_Flexible_Space

// Toolbar Flexible Space button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2014
// version 0.1.0 - 2014-05-12

this.tooltipText = ""; // Remove tooltip
this.style.cssText = '\
	/* styles for toolbarspring from chrome://global/skin/toolbar.css */\n\
	-moz-box-flex: 1000;\n\
	/* Remove button styles */\n\
	-moz-appearance: listitem !important; /* Hack, try use "none" in case of wrong appearance */\n\
	list-style-image: none !important;\n\
	margin: 0 !important;\n\
	padding: 0 !important;\n\
	/* Force make it accessible anyway */\n\
	min-width: 4px !important;\n\
';
this.setAttribute("flex", "1");
setTimeout(function() { // Force hide icon
	var icon = self.icon
		|| self.ownerDocument.getAnonymousElementByAttribute(self, "class", "toolbarbutton-icon");
	icon.style.display = "none";
}, 50);