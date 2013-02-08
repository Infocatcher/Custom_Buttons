// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/menuWithDelayedInitialization.js

// Example menu button for Custom Buttons
// Code for "code" and "initialization" sections (see comments)

// (c) Infocatcher 2013
// version 0.1.1 - 2013-02-08


//== "Code" section:
if(!event.target) { // Button's hotkey pressed
	LOG("hotkey");
	this.open = true;
	return;
}
if(event.target != this) {
	LOG("code() from child node");
	return;
}
LOG("code()");
var mp = this.mp; // See initialization
addEventListener("command", function(e) {
	// Button shouldn't handle "command" event from child nodes
	e.stopPropagation();
}, false, mp);
// Create menu contents (just an example):
var df = document.createDocumentFragment();
for(var i = 1; i <= 10; ++i) {
	var mi = document.createElement("menuitem");
	mi.setAttribute("label", "Item #" + i);
	mi.setAttribute("oncommand", "this.parentNode.parentNode.handleCommand(" + i + ");");
	df.appendChild(mi);
}
mp.appendChild(df);
this.handleCommand = function(i) {
	alert("Command #" + i);
};


//============================
//== "Initialization" section:
LOG("init()");
this.type = "menu";
this.orient = "horizontal";
var mp = this.mp = document.createElement("menupopup");
mp.setAttribute("onpopupshowing", "this.parentNode.initMenuOnce();");
this.appendChild(mp);

this.initMenuOnce = function() {
	LOG("onpopupshowing");
	delete this.initMenuOnce;
	// Looks like Gecko bug: handler can't be removed using removeAttribute()
	mp.setAttribute("onpopupshowing", "");
	mp.removeAttribute("onpopupshowing");
	this.doCommand();
};