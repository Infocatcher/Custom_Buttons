// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toolbar_Separator

// Toolbar Separator button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2014
// version 0.1.0 - 2014-05-12

this.tooltipText = ""; // Remove tooltip
this.style.cssText = '\
	/* styles for toolbarseparator from chrome://global/skin/toolbar.css */\n\
	-moz-appearance: separator !important;\n\
	border-top: 2px solid transparent;\n\
	border-bottom: 2px solid transparent;\n\
	border-left: 3px solid transparent;\n\
	border-right: 3px solid transparent;\n\
	-moz-border-left-colors  : transparent transparent ThreeDShadow;\n\
	-moz-border-right-colors : transparent transparent ThreeDHighlight;\n\
	/* Remove button styles */\n\
	list-style-image: none !important;\n\
	margin: 0 !important;\n\
	padding: 0 !important;\n\
';
setTimeout(function() { // Force hide icon
	var icon = self.ownerDocument.getAnonymousElementByAttribute(self, "class", "toolbarbutton-icon");
	icon.style.display = "none";
}, 50);