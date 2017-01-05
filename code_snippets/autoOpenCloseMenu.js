// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/autoOpenCloseMenu.js
// Automatically open menu on mouse over (and hide it on mouse out)
// (code for "initialization" section)

// Dummy menu
this.type = "menu";
this.orient = "horisontal";
this.appendChild(parseXULFromString(
	'<menupopup xmlns="' + xulns + '" oncommand="alert(event.target.getAttribute(\'label\'));">\
		<menuitem label="Item 1" />\
		<menuitem label="Item 2" />\
		<menuitem label="Item 3" />\
	</menupopup>'
));
function parseXULFromString(xul) {
	xul = xul.replace(/>\s+</g, "><");
	return new DOMParser().parseFromString(xul, "application/xml").documentElement;
}

// Autoopen/close feature
var openDelay = 200;
var closeDelay = 350;

var _openTimer = 0;
var _closeTimer = 0;
this.onmouseover = function(e) {
	clearTimeout(_closeTimer);
	if(e.target == this && closeOtherMenus()) {
		this.open = true;
		return;
	}
	_openTimer = setTimeout(function() {
		self.open = true;
	}, openDelay);
};
this.onmouseout = function(e) {
	clearTimeout(_openTimer);
	_closeTimer = setTimeout(function() {
		if(!isContextOpened())
			self.open = false;
	}, closeDelay);
};
function closeOtherMenus() {
	return Array.prototype.some.call(
		self.parentNode.getElementsByTagName("*"),
		function(node) {
			if(
				node != self
				&& node.namespaceURI == xulns
				&& node.boxObject
				// See https://github.com/Infocatcher/Custom_Buttons/issues/28
				//&& node.boxObject instanceof Components.interfaces.nsIMenuBoxObject
				&& "open" in node
				&& node.open
				&& node.getElementsByTagName("menupopup").length
			) {
				node.open = false;
				return true;
			}
			return false;
		}
	);
}
function isContextOpened() {
	return inBtn(document.popupNode);
}
function inBtn(node) {
	for(; node; node = node.parentNode)
		if(node == self)
			return true;
	return false;
}