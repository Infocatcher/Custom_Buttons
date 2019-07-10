// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toolbar_Space

// Toolbar Space button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2014
// version 0.1.0 - 2014-05-12

this.tooltipText = ""; // Remove tooltip
this.style.cssText = '\
	/* styles for toolbarspacer from chrome://global/skin/toolbar.css */\n\
	width: 15px;\n\
	/* Remove button styles */\n\
	-moz-appearance: listitem !important; /* Hack, try use "none" in case of wrong appearance */\n\
	list-style-image: none !important;\n\
	margin: 0 !important;\n\
	padding: 0 !important;\n\
';
setTimeout(function() { // Force hide icon
	var icon = self.ownerDocument.getAnonymousElementByAttribute(self, "class", "toolbarbutton-icon")
		|| self.getElementsByClassName("toolbarbutton-icon")[0];
	icon.style.display = "none";
}, 50);